// KerbCheck — EPC (Energy Performance Certificate) lookup.
// Land Registry sold-price data has no size information at all, which is
// the single biggest thing missing from the verdict. EPC records add a
// floor area and energy rating per address, which lets us show a rough
// asking-price-per-square-metre figure alongside the median comparison.
// England & Wales only — Scotland's EPC register is a separate service.
//
// Needs a free API key from epc.opendatacommunities.org (see README):
// set EPC_API_EMAIL and EPC_API_KEY as Vercel environment variables. Left
// unset, this endpoint just replies { epc: null } and the site quietly
// skips the floor-area section — nothing else breaks.
//
// Deliberately conservative about what it claims: a postcode can cover
// several dwellings (a terrace, a block of flats), and this has no way to
// know which EPC record belongs to the specific house someone is asking
// about. It returns everything found at that postcode and lets the front
// end show the most recent one with an honest caveat when there's more
// than one.

import { rateLimited } from "../lib/rateLimit.js";

const EPC_BASE = "https://epc.opendatacommunities.org/api/v1/domestic/search";

export default async function handler(req, res) {
  if (rateLimited(req, res)) return;

  const raw = (req.query.postcode || "").toString().toUpperCase().trim();
  const clean = raw.replace(/[^A-Z0-9]/g, "");
  if (clean.length < 5 || clean.length > 7) {
    res.status(400).json({ error: "That doesn't look like a full UK postcode." });
    return;
  }
  const postcode = clean.slice(0, -3) + " " + clean.slice(-3);

  const email = process.env.EPC_API_EMAIL;
  const key = process.env.EPC_API_KEY;
  if (!email || !key) {
    // Feature not configured — not an error, just nothing to show.
    res.status(200).json({ epc: false, records: [] });
    return;
  }

  try {
    const auth = Buffer.from(email + ":" + key).toString("base64");
    const resp = await fetch(EPC_BASE + "?postcode=" + encodeURIComponent(postcode) + "&size=25", {
      headers: { Authorization: "Basic " + auth, Accept: "application/json" },
    });

    if (resp.status === 404) {
      res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
      res.status(200).json({ epc: false, records: [] });
      return;
    }
    if (!resp.ok) throw new Error("EPC lookup failed with status " + resp.status);

    const data = await resp.json();
    const records = (data.rows || [])
      .map((r) => ({
        address: [r["address1"], r["address2"], r["address3"]].filter(Boolean).join(", "),
        floorArea: r["total-floor-area"] ? parseFloat(r["total-floor-area"]) : null,
        rating: r["current-energy-rating"] || null,
        propertyType: r["property-type"] || null,
        builtForm: r["built-form"] || null,
        inspectionDate: r["inspection-date"] || null,
      }))
      .filter((r) => r.floorArea && r.floorArea > 0)
      .slice(0, 10);

    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
    res.status(200).json({ epc: records.length > 0, records });
  } catch (err) {
    // This is a bonus feature layered on top of the main check — never let
    // an EPC hiccup block or error out the core price comparison.
    res.status(200).json({ epc: false, records: [] });
  }
}
