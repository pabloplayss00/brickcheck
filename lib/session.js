// KerbCheck — signs and reads the "am I a subscriber" cookie.
//
// Why this exists: once the street report is a £-per-month subscription
// instead of a one-off purchase, "have they paid" isn't a single yes/no
// fact tied to one report any more — it's an ongoing status tied to a
// person, that can change (they cancel, a card fails) without them visiting
// the site. So instead of trusting a URL parameter, we identify returning
// subscribers with a small signed cookie that just says "this browser
// belongs to Stripe customer X," and every API route that cares re-checks
// X's live subscription status with Stripe before treating them as active.
// The cookie can't be forged (it's HMAC-signed with a secret only the
// server has) but it also can't unlock anything by itself — it's an
// identity, not a permission slip.
//
// Requires a SESSION_SECRET environment variable: any long random string,
// e.g. generate one with `openssl rand -hex 32` and add it in Vercel under
// Project → Settings → Environment Variables. Treat it like a password —
// never commit it, never put it in index.html/report.html.

import crypto from "crypto";

export const COOKIE_NAME = "kc_sess";

export function sign(customerId, secret) {
  const mac = crypto.createHmac("sha256", secret).update(customerId).digest("hex");
  return Buffer.from(customerId, "utf8").toString("base64url") + "." + mac;
}

export function verify(token, secret) {
  if (!token || !secret) return null;
  const dot = token.indexOf(".");
  if (dot === -1) return null;
  const idPart = token.slice(0, dot);
  const macPart = token.slice(dot + 1);
  let customerId;
  try {
    customerId = Buffer.from(idPart, "base64url").toString("utf8");
  } catch (e) {
    return null;
  }
  if (!customerId) return null;
  const expected = crypto.createHmac("sha256", secret).update(customerId).digest("hex");
  const a = Buffer.from(macPart, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return customerId;
}

export function parseCookies(header) {
  const out = {};
  (header || "").split(";").forEach((part) => {
    const idx = part.indexOf("=");
    if (idx === -1) return;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key) {
      try {
        out[key] = decodeURIComponent(val);
      } catch (e) {
        out[key] = val;
      }
    }
  });
  return out;
}

// A year and a bit — long enough that a genuine subscriber is never
// randomly signed out, since it only ever identifies them; it never says
// they're *entitled* to anything by itself (see the file header).
const MAX_AGE = 60 * 60 * 24 * 400;

export function setSessionCookie(res, customerId, secret) {
  const token = sign(customerId, secret);
  res.setHeader(
    "Set-Cookie",
    COOKIE_NAME + "=" + token + "; Path=/; Max-Age=" + MAX_AGE + "; HttpOnly; Secure; SameSite=Lax"
  );
}

export function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", COOKIE_NAME + "=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax");
}

export function customerIdFromRequest(req, secret) {
  const cookies = parseCookies(req.headers.cookie);
  return verify(cookies[COOKIE_NAME], secret);
}
