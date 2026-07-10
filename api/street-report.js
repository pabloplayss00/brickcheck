// KerbCheck — street report API
// Returns two datasets for the full report:
//   street: every recorded sale at the exact postcode since 2000
//   area:   sales within ~1 mile over the last 4 years (same as the checker)
// England & Wales only (Land Registry Price Paid Data).

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

function mapSales(rows) {
  return rows
    .map((r) => ({
      price: r.amount ? parseInt(r.amount.value, 10) : null,
      date: r.date ? r.date.value : null,
      type: r.propertyType ? r.propertyType.value.split("/").pop() : "unknown",
      paon: r.paon ? r.paon.value : "",
      street: r.street ? r.street.value : "",
      postcode: r.postcode ? r.postcode.value : "",
    }))
    .filter((s) => s.price && s.date);
}

const SELECT = `
PREFIX lrppi: <http://landregistry.data.gov.uk/def/ppi/>
PREFIX lrcommon: <http://landregistry.data.gov.uk/def/common/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?amount ?date ?propertyType ?paon ?street ?postcode
WHERE {
  VALUES ?postcode { __VALUES__ }
  ?addr lrcommon:postcode ?postcode .
  ?transx lrppi:propertyAddress ?addr ;
          lrppi:pricePaid ?amount ;
          lrppi:transactionDate ?date .
  OPTIONAL { ?transx lrppi:propertyType ?propertyType }
  OPTIONAL { ?addr lrcommon:paon ?paon }
  OPTIONAL { ?addr lrcommon:street ?street }
  FILTER(?date >= "__FROM__"^^xsd:date)
}
ORDER BY DESC(?date)
LIMIT __LIMIT__
`;

export default async function handler(req, res) {
  const raw = (req.query.postcode || "").toString().toUpperCase().trim();
  const clean = raw.replace(/[^A-Z0-9]/g, "");
  if (clean.length < 5 || clean.length > 7) {
    res.status(400).json({ error: "That doesn't look like a full UK postcode." });
    return;
  }
  const postcode = clean.slice(0, -3) + " " + clean.slice(-3);

  try {
    const lookupResp = await fetch(POSTCODES_IO + "/postcodes/" + encodeURIComponent(postcode));
    if (lookupResp.status === 404) {
      res.status(400).json({ error: "We couldn't find that postcode — double-check it." });
      return;
    }
    if (!lookupResp.ok) throw new Error("postcode lookup failed");
    const lookup = await lookupResp.json();
    const { latitude, longitude, country, admin_district, admin_ward } = lookup.result;

    if (country !== "England" && country !== "Wales") {
      res.status(400).json({
        error: "Street reports are available for England & Wales only for now — street-level sold prices aren't open data elsewhere in the UK.",
      });
      return;
    }

    // --- street history: exact postcode, since 2000 ---
    const streetRows = await runSparql(
      SELECT.replace("__VALUES__", '"' + postcode + '"')
        .replace("__FROM__", "2000-01-01")
        .replace("__LIMIT__", "200")
    );

    // --- area pool: ~1 mile, last 4 years ---
    const nearResp = await fetch(
      POSTCODES_IO + "/postcodes?lon=" + longitude + "&lat=" + latitude + "&radius=1600&limit=100"
    );
    if (!nearResp.ok) throw new Error("nearby postcode lookup failed");
    const near = await nearResp.json();
    const codes = new Set([postcode]);
    (near.result || []).forEach((p) => codes.add(p.postcode));

    const from = new Date();
    from.setFullYear(from.getFullYear() - 4);

    const areaRows = await runSparql(
      SELECT.replace("__VALUES__", [...codes].map((c) => '"' + c + '"').join(" "))
        .replace("__FROM__", from.toISOString().slice(0, 10))
        .replace("__LIMIT__", "250")
    );

    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
    res.status(200).json({
      postcode,
      ward: admin_ward || "",
      district: admin_district || "",
      street: mapSales(streetRows),
      area: mapSales(areaRows),
    });
  } catch (err) {
    res.status(502).json({ error: "Could not fetch sold-price data. Try again in a moment." });
  }
}
