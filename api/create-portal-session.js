// KerbCheck — "manage / cancel my subscription" button.
//
// Rather than building our own cancel-subscription UI (and the ways that
// could go wrong with money involved), this hands the signed-in customer
// off to Stripe's own hosted Billing Portal, where they can see their
// subscription, update their card, or cancel — all directly with Stripe.
// UK subscription rules increasingly expect cancellation to be at least as
// easy as signing up; this keeps it to one click from the report page.
//
// One-time setup in Stripe: Settings → Billing → Customer portal — turn it
// on and (at minimum) allow customers to cancel subscriptions.

import { rateLimited } from "../lib/rateLimit.js";
import { customerIdFromRequest } from "../lib/session.js";

export default async function handler(req, res) {
  if (rateLimited(req, res, { limit: 20, windowMs: 5 * 60 * 1000 })) return;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const sessionSecret = process.env.SESSION_SECRET;
  const customerId = sessionSecret ? customerIdFromRequest(req, sessionSecret) : null;

  if (!customerId || !secretKey) {
    res.status(401).json({ error: "You don't look like an active subscriber on this browser — use \"Already subscribe?\" to restore access first." });
    return;
  }

  const proto = (req.headers["x-forwarded-proto"] || "https").toString().split(",")[0];
  const returnUrl = proto + "://" + (req.headers.host || "www.kerbcheck.co.uk") + "/report.html";

  try {
    const resp = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + secretKey,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "customer=" + encodeURIComponent(customerId) + "&return_url=" + encodeURIComponent(returnUrl),
    });
    const data = await resp.json();
    if (!resp.ok || !data.url) {
      res.status(502).json({ error: (data.error && data.error.message) || "Could not open subscription management — make sure the Customer Portal is turned on in Stripe (Settings → Billing → Customer portal)." });
      return;
    }
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ url: data.url });
  } catch (err) {
    res.status(502).json({ error: "Could not open subscription management. Try again in a moment." });
  }
}
