// KerbCheck — "I already subscribe, I'm just on a new browser/device."
//
// A subscription (unlike the old one-off £3 purchase) has to keep working
// across every visit, not just the one right after paying — but this site
// deliberately has no accounts or passwords. This is the low-friction
// middle ground: someone types the email they subscribed with, we ask
// Stripe (server-side, using the secret key) whether any customer with
// that email currently has an active subscription, and if so we hand back
// the same signed cookie a fresh checkout would have set.
//
// This trusts "knows the email" as proof of identity, same as a magic-link
// login would — reasonable for a low-value, low-sensitivity subscription
// like this one, but worth knowing: anyone who knows a subscriber's email
// can restore access with it. Rate-limited hard below to make guessing
// emails impractical.

import { rateLimited } from "../lib/rateLimit.js";
import { setSessionCookie } from "../lib/session.js";

export default async function handler(req, res) {
  if (rateLimited(req, res, { limit: 8, windowMs: 15 * 60 * 1000 })) return;

  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed." });
    return;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const sessionSecret = process.env.SESSION_SECRET;
  if (!secretKey || !sessionSecret) {
    res.status(500).json({ ok: false, error: "Site misconfigured." });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  const email = ((body && body.email) || "").toString().trim().toLowerCase();
  if (!email || !email.includes("@") || email.length > 200) {
    res.status(400).json({ ok: false, error: "Enter a valid email address." });
    return;
  }

  try {
    const custResp = await fetch(
      "https://api.stripe.com/v1/customers?email=" + encodeURIComponent(email) + "&limit=5",
      { headers: { Authorization: "Bearer " + secretKey } }
    );
    const custData = await custResp.json();
    if (!custResp.ok || !Array.isArray(custData.data)) {
      res.status(502).json({ ok: false, error: "Could not look up your subscription. Try again in a moment." });
      return;
    }

    for (const cust of custData.data) {
      const subResp = await fetch(
        "https://api.stripe.com/v1/subscriptions?customer=" + encodeURIComponent(cust.id) + "&limit=10",
        { headers: { Authorization: "Bearer " + secretKey } }
      );
      const subData = await subResp.json();
      const active =
        subResp.ok &&
        Array.isArray(subData.data) &&
        subData.data.some((s) => s.status === "active" || s.status === "trialing");
      if (active) {
        setSessionCookie(res, cust.id, sessionSecret);
        res.setHeader("Cache-Control", "no-store");
        res.status(200).json({ ok: true });
        return;
      }
    }

    res.status(404).json({ ok: false, error: "No active subscription found for that email." });
  } catch (err) {
    res.status(502).json({ ok: false, error: "Could not look up your subscription. Try again in a moment." });
  }
}
