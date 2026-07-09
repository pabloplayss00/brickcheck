// BrickCheck — sold prices API (v4)
// England & Wales: street-level sold prices from HM Land Registry Price Paid
//   Data (postcodes within ~1 mile, indexed query).
// Scotland: individual sold prices aren't open data, so we use the official
//   UK House Price Index — typical price by property type for the council
//   area, updated monthly, same open licence. Clearly labelled as area-level.
// Northern Ireland: no open data yet — honest message.

const SPARQL_ENDPOINT = "https://landregistry.data.gov.uk/landregistry/query";
const POSTCODES_IO = "https://api.postcodes.io";

async function runSparql(query) {
  const resp = await fetch(SPARQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/sparql-results+json",
    },
    body: "query=" + encodeURIComponent(query),
  });
  if (!resp.ok) throw new Error("Land Registry responded with status " + resp.status);
  const data = await resp.json();
  return (data.results && data.results.bindings) || [];
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9 -]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const num = (b) => (b ? parseFloat(b.value) : null);

// ---------- Scotland: latest UK HPI averages for a council area ----------
async function scotlandAverages(district) {
  const candidates = [slugify(district || ""), "scotland"].filter(Boolean);
  for (const slug of candidates) {
    const query = `
PREFIX ukhpi: <http://landregistry.data.gov.uk/def/ukhpi/>

SELECT ?month ?avg ?avgDet ?avgSemi ?avgTerr ?avgFlat
WHERE {
  ?obs ukhpi:refRegion <http://landregistry.data.gov.uk/id/region/${slug}> ;
       ukhpi:refMonth ?month .
  OPTIONAL { ?obs ukhpi:averagePrice ?avg }
  OPTIONAL { ?obs ukhpi:averagePriceDetached ?avgDet }
  OPTIONAL { ?obs ukhpi:averagePriceSemiDetached ?avgSemi }
  OPTIONAL { ?obs ukhpi:averagePriceTerraced ?avgTerr }
  OPTIONAL { ?obs ukhpi:averagePriceFlatMaisonette ?avgFlat }
}
ORDER BY DESC(?month)
LIMIT 6
`;
    let rows = [];
    try { rows = await runSparql(query); } catch (e) { rows = []; }
    // newest month that actually has an overall average
    const row = rows.find((r) => num(r.avg));
    if (row) {
      return {
        regionSlug: slug,
        regionName: slug === "scotland" ? "Scotland" : district,
        month: row.month.value,
        averages: {
          overall: num(row.avg),
          detached: num(row.avgDet),
          "semi-detached": num(row.avgSemi),
          terraced: num(row.avgTerr),
          "flat-maisonette": num(row.avgFlat),
        },
      };
    }
  }
  return null;
}

export default async function handler(req, res) {
  const raw = (req.query.postcode || "").toString().toUpperCase().trim();
  const clean = raw.replace(/[^A-Z0-9]/g, "");

  if (clean.length < 5 || clean.length > 7) {
    res.status(400).json({ error: "That doesn't look like a full UK postcode." });
    return;
  }
  const postcode = clean.slice(0, -3) + " " + clean.slice(-3);

  try {
    // --- 1. Where is this postcode? ---
    const lookupResp = await fetch(POSTCODES_IO + "/postcodes/" + encodeURIComponent(postcode));
    if (lookupResp.status === 404) {
      res.status(400).json({ error: "We couldn't find that postcode — double-check it." });
      return;
    }
    if (!lookupResp.ok) throw new Error("postcode lookup failed");
    const lookup = await lookupResp.json();
    const { latitude, longitude, country, admin_district } = lookup.result;

    if (country === "Northern Ireland") {
      res.status(400).json({
        error:
          "BrickCheck covers England, Wales & Scotland for now — Northern Ireland's sold-price records aren't open data yet. Sorry!",
      });
      return;
    }

    // --- Scotland: official area averages (UK House Price Index) ---
    if (country === "Scotland") {
      const hpi = await scotlandAverages(admin_district);
      if (!hpi) {
        res.status(502).json({ error: "Couldn't fetch official price data for that area. Try again in a moment." });
        return;
      }
      res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
      res.status(200).json({ mode: "hpi", postcode, region: hpi.regionName, month: hpi.month, averages: hpi.averages });
      return;
    }

    // --- England & Wales: street-level sold prices within ~1 mile ---
    const nearResp = await fetch(
      POSTCODES_IO + "/postcodes?lon=" + longitude + "&lat=" + latitude + "&radius=1600&limit=100"
    );
    if (!nearResp.ok) throw new Error("nearby postcode lookup failed");
    const near = await nearResp.json();
    const codes = new Set([postcode]);
    (near.result || []).forEach((p) => codes.add(p.postcode));

    const from = new Date();
    from.setFullYear(from.getFullYear() - 4);
    const fromDate = from.toISOString().slice(0, 10);
    const valuesList = [...codes].map((c) => '"' + c + '"').join(" ");

    const rows = await runSparql(`
PREFIX lrppi: <http://landregistry.data.gov.uk/def/ppi/>
PREFIX lrcommon: <http://landregistry.data.gov.uk/def/common/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?amount ?date ?propertyType ?paon ?street ?postcode
WHERE {
  VALUES ?postcode { ${valuesList} }
  ?addr lrcommon:postcode ?postcode .
  ?transx lrppi:propertyAddress ?addr ;
          lrppi:pricePaid ?amount ;
          lrppi:transactionDate ?date .
  OPTIONAL { ?transx lrppi:propertyType ?propertyType }
  OPTIONAL { ?addr lrcommon:paon ?paon }
  OPTIONAL { ?addr lrcommon:street ?street }
  FILTER(?date >= "${fromDate}"^^xsd:date)
}
ORDER BY DESC(?date)
LIMIT 250
`);

    const sales = rows
      .map((r) => ({
        price: r.amount ? parseInt(r.amount.value, 10) : null,
        date: r.date ? r.date.value : null,
        type: r.propertyType ? r.propertyType.value.split("/").pop() : "unknown",
        paon: r.paon ? r.paon.value : "",
        street: r.street ? r.street.value : "",
        postcode: r.postcode ? r.postcode.value : "",
      }))
      .filter((s) => s.price && s.date);

    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
    res.status(200).json({ mode: "ppd", postcode, count: sales.length, sales });
  } catch (err) {
    res.status(502).json({ error: "Could not fetch sold-price data. Try again in a moment." });
  }
}
