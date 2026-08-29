// KerbCheck — verifies a Stripe payment before unlocking the paid street
// report. report.html calls this once, right after Stripe redirects the
// buyer back with ?session_id=... following a successful checkout.
//
// Why this file exists at all: the report page can't just trust a
// "?paid=true" flag in the URL — anyone could type that in by hand and get
// the report for free. Instead we ask Stripe directly, server-side, using a
// secret key that never reaches the browser, whether that exact session
// really was paid.
//
// One-time setup (see README for the full walkthrough):
//  1. In Vercel: Project → Settings → Environment Variables, add
//     STRIPE_SECRET_KEY = sk_live_... (or sk_test_... while testing).
//     Never put this key in index.html, report.html, or anything committed
//     to GitHub — those files are public.
//  2. In Stripe: create a Payment Link for a one-off £3 price, and set its
//     "after payment" redirect to:
//       https://yourdomain.co.uk/report.html?session_id={CHECKOUT_SESSION_ID}
//     Paste that Payment Link's URL into STRIPE_PAYMENT_LINK in the CONFIG
//     block of index.html and report.html, and set REPORT_MODE to "paid".

import { rateLimited } from "../lib/rateLimit.js";

export default async function handler(req, res) {
  // Generous limit — this only ever fires once per real checkout redirect,
  // so the only reason to hit it hard is someone guessing session IDs.
  if (rateLimited(req, res, { limit: 30, windowMs: 5 * 60 * 1000 })) return;
  const sessionId = (req.query.session_id || "").toString().trim();
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!sessionId) {
    res.status(400).json({ error: "Missing session_id.", paid: false });
    return;
  }
  if (!secretKey) {
    res.status(500).json({ error: "Payments aren't configured on this site yet (missing STRIPE_SECRET_KEY).", paid: false });
    return;
  }

  try {
    const resp = await fetch(
      "https://api.stripe.com/v1/checkout/sessions/" + encodeURIComponent(sessionId),
      { headers: { Authorization: "Bearer " + secretKey } }
    );
    const session = await resp.json();

    if (!resp.ok) {
      res.status(502).json({ error: (session.error && session.error.message) || "Could not verify payment.", paid: false });
      return;
    }
    if (session.payment_status !== "paid") {
      res.status(402).json({ error: "Payment not completed.", paid: false });
      return;
    }

    // We pack postcode|askingPrice|propertyType into client_reference_id
    // when sending the buyer to the Stripe Payment Link (see index.html and
    // report.html's paywall) so we can hand back exactly which report they
    // paid for, without trusting anything the browser sends us directly.
    let postcode = "", price = "", type = "";
    try {
      const decoded = Buffer.from(session.client_reference_id || "", "base64").toString("utf8");
      const parts = decoded.split("|");
      postcode = parts[0] || "";
      price = parts[1] || "";
      type = parts[2] || "";
    } catch (e) {
      // leave blank — report.html falls back to "missing details" gracefully
    }

    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ paid: true, postcode, price, type });
  } catch (err) {
    res.status(502).json({ error: "Could not verify payment. Try again in a moment.", paid: false });
  }
}
