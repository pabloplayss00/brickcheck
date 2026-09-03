// KerbCheck — "is whoever's cookie this is currently a paying subscriber?"
//
// Called on every report.html load. Reads the signed cookie set by
// verify-subscription.js or restore-access.js, and — crucially — doesn't
// just trust that the cookie exists. It asks Stripe live whether that
// customer currently has an active (or trialing) subscription, so access
// disappears automatically the moment someone cancels or a renewal payment
// fails, without us having to run any of our own billing logic.

import { rateLimited } from "../lib/rateLimit.js";
import { customerIdFromRequest } from "../lib/session.js";

export default async function handler(req, res) {
  if (rateLimited(req, res, { limit: 60, windowMs: 5 * 60 * 1000 })) return;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const sessionSecret = process.env.SESSION_SECRET;
  const customerId = sessionSecret ? customerIdFromRequest(req, sessionSecret) : null;

  res.setHeader("Cache-Control", "no-store");

  if (!customerId || !secretKey) {
    res.status(200).json({ active: false });
    return;
  }

  try {
    const resp = await fetch(
      "https://api.stripe.com/v1/subscriptions?customer=" + encodeURIComponent(customerId) + "&limit=10",
      { headers: { Authorization: "Bearer " + secretKey } }
    );
    const data = await resp.json();
    const active =
      resp.ok &&
      Array.isArray(data.data) &&
      data.data.some((s) => s.status === "active" || s.status === "trialing");
    res.status(200).json({ active });
  } catch (err) {
    // Fail closed — if Stripe can't be reached, treat as not-subscribed
    // rather than accidentally unlocking a report for free.
    res.status(200).json({ active: false });
  }
}
