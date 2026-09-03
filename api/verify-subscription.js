// KerbCheck — confirms a brand-new subscription before unlocking reports.
//
// report.html calls this once, right after Stripe redirects a buyer back
// with ?session_id=... following a successful subscription checkout. We
// don't trust the URL alone — anyone could type "?session_id=..." by hand —
// so we ask Stripe directly, server-side, whether that checkout session
// really produced an active subscription, then remember the buyer with a
// signed cookie (see lib/session.js) so they don't have to pay again on
// their next visit or for their next search.

import { rateLimited } from "../lib/rateLimit.js";
import { setSessionCookie } from "../lib/session.js";

export default async function handler(req, res) {
  // Generous limit — this only ever fires once per real checkout redirect,
  // so the only reason to hit it hard is someone guessing session IDs.
  if (rateLimited(req, res, { limit: 30, windowMs: 5 * 60 * 1000 })) return;

  const sessionId = (req.query.session_id || "").toString().trim();
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const sessionSecret = process.env.SESSION_SECRET;

  if (!sessionId) {
    res.status(400).json({ active: false, error: "Missing session_id." });
    return;
  }
  if (!secretKey) {
    res.status(500).json({ active: false, error: "Payments aren't configured on this site yet (missing STRIPE_SECRET_KEY)." });
    return;
  }
  if (!sessionSecret) {
    res.status(500).json({ active: false, error: "Site misconfigured (missing SESSION_SECRET)." });
    return;
  }

  try {
    const resp = await fetch(
      "https://api.stripe.com/v1/checkout/sessions/" + encodeURIComponent(sessionId) + "?expand[]=subscription",
      { headers: { Authorization: "Bearer " + secretKey } }
    );
    const session = await resp.json();

    if (!resp.ok) {
      res.status(502).json({ active: false, error: (session.error && session.error.message) || "Could not verify subscription." });
      return;
    }

    const sub = session.subscription; // expanded object, or null if this wasn't a subscription checkout
    const status = sub && typeof sub === "object" ? sub.status : null;
    const customerId = session.customer;

    if (!customerId || !(status === "active" || status === "trialing")) {
      res.status(402).json({ active: false, error: "Subscription isn't active — if you were charged, contact us and we'll sort it out." });
      return;
    }

    setSessionCookie(res, customerId, sessionSecret);
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ active: true });
  } catch (err) {
    res.status(502).json({ active: false, error: "Could not verify subscription. Try again in a moment." });
  }
}
