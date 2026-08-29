// KerbCheck — a very small, best-effort per-IP rate limiter for the API
// routes. Lives outside /api on purpose: any file directly under /api
// becomes its own public endpoint on Vercel, and this is a shared helper,
// not a route.
//
// What this is NOT: a proper distributed rate limiter. A serverless
// function can run on several different instances at once, each with its
// own memory, so a determined attacker spread across enough requests could
// still get through. What it DOES stop, for free and with nothing to sign
// up for: a single script, tab, or bot hammering an endpoint in a tight
// loop, which is the ordinary abuse a small free tool actually sees. If
// this site gets big enough to attract more than that, Vercel's own
// Firewall (paid plans) or a proper store like Upstash Redis is the real
// next step — this is meant to be the free, zero-setup first line.

const buckets = new Map();

/**
 * Call at the top of a handler. Returns true (and has already written a 429
 * response) if this caller should be blocked; returns false if the request
 * should proceed normally.
 */
export function rateLimited(req, res, { limit = 20, windowMs = 5 * 60 * 1000 } = {}) {
  const ip =
    (req.headers["x-forwarded-for"] || "").toString().split(",")[0].trim() ||
    "unknown";
  const now = Date.now();
  const bucket = buckets.get(ip);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    res.setHeader("Retry-After", Math.ceil((bucket.resetAt - now) / 1000).toString());
    res.status(429).json({ error: "Too many requests from this connection — please wait a few minutes and try again." });
    return true;
  }
  return false;
}
