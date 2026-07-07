// BrickCheck — sold prices API
// Queries HM Land Registry Price Paid Data (open data, OGL v3.0 licence)
// via their public SPARQL endpoint. Runs as a Vercel serverless function.

const SPARQL_ENDPOINT = "https://landregistry.data.gov.uk/landregistry/query";

export default async function handler(req, res) {
  const sector = (req.query.sector || "").toString().toUpperCase().trim();

  // Postcode sector looks like "M20 4" or "SK4 3" or "SW1A 1"
  if (!/^[A-Z]{1,2}[0-9][0-9A-Z]? [0-9]$/.test(sector)) {
    res.status(400).json({ error: "Invalid postcode sector. Expected something like 'M20 4'." });
    return;
  }

  // Sales from the last 4 years
  const from = new Date();
  from.setFullYear(from.getFullYear() - 4);
  const fromDate = from.toISOString().slice(0, 10);

  const query = `
PREFIX lrppi: <http://landregistry.data.gov.uk/def/ppi/>
PREFIX lrcommon: <http://landregistry.data.gov.uk/def/common/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?amount ?date ?propertyType ?paon ?street ?town ?postcode
WHERE {
  ?transx lrppi:pricePaid ?amount ;
          lrppi:transactionDate ?date ;
          lrppi:propertyAddress ?addr .
  ?addr lrcommon:postcode ?postcode .
  OPTIONAL { ?transx lrppi:propertyType ?propertyType }
  OPTIONAL { ?addr lrcommon:paon ?paon }
  OPTIONAL { ?addr lrcommon:street ?street }
  OPTIONAL { ?addr lrcommon:town ?town }
  FILTER(STRSTARTS(?postcode, "${sector}"))
  FILTER(?date >= "${fromDate}"^^xsd:date)
}
ORDER BY DESC(?date)
LIMIT 250
`;

  try {
    const upstream = await fetch(SPARQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/sparql-results+json",
      },
      body: "query=" + encodeURIComponent(query),
    });

    if (!upstream.ok) {
      res.status(502).json({ error: "Land Registry responded with status " + upstream.status });
      return;
    }

    const data = await upstream.json();
    const rows = (data.results && data.results.bindings) || [];

    const sales = rows.map((r) => ({
      price: r.amount ? parseInt(r.amount.value, 10) : null,
      date: r.date ? r.date.value : null,
      // propertyType arrives as a URI like .../def/common/terraced — keep the last segment
      type: r.propertyType ? r.propertyType.value.split("/").pop() : "unknown",
      paon: r.paon ? r.paon.value : "",
      street: r.street ? r.street.value : "",
      town: r.town ? r.town.value : "",
      postcode: r.postcode ? r.postcode.value : "",
    })).filter((s) => s.price && s.date);

    // Cache at the edge for a day — sold-price data doesn't change hourly,
    // and this keeps you comfortably inside free-tier limits.
    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
    res.status(200).json({ sector, count: sales.length, sales });
  } catch (err) {
    res.status(502).json({ error: "Could not reach the Land Registry service. Try again in a moment." });
  }
}
