# BrickCheck — launch guide

A free tool for house buyers: paste a postcode and asking price, get a verdict
("priced fair / looks high / possible deal") based on real HM Land Registry
sold prices nearby. Free for buyers; you earn from referrals.

No coding needed to launch. Follow the steps in order.

---

## 1. Get it live (about 20 minutes, £0)

1. Create a free account at **github.com**, then create a new repository
   (call it `brickcheck`, set it to Public or Private — either works).
2. On the repository page click **"uploading an existing file"** and drag in
   everything in this folder — `index.html`, the `api` folder, this README.
   Commit the files.
3. Create a free account at **vercel.com** (sign in with your GitHub account).
4. Click **Add New → Project**, pick your `brickcheck` repository, and press
   **Deploy**. No settings need changing — Vercel automatically finds
   `index.html` and turns `api/sold-prices.js` into a live API.
5. You'll get a URL like `brickcheck.vercel.app`. Open it, enter a postcode
   you know (e.g. M20 4WX) and an asking price, and check it returns real
   sold prices.

If the first lookup ever shows an error, try once more — the Land Registry's
free endpoint occasionally takes a few seconds to wake up. Results are cached
for a day after that, so repeat searches are fast and you stay well inside
Vercel's free tier.

## 2. Get a proper domain (about £10/year)

Buy a domain (e.g. from Cloudflare or Namecheap) — brickcheck.co.uk or
whatever name you settle on. In Vercel: Project → Settings → Domains → add it
and follow the two DNS steps shown. Check the name isn't already trademarked
or in use by another property business before you buy.

## 3. Switch on the money (this is the business)

Open `index.html` and find the `CONFIG` block near the top of the script —
four links, currently set to "#". Until you change them, the buttons show a
polite "coming soon" message, which is fine for launch.

- **BROKER_URL — do this one first.** Two routes:
  (a) Join a UK affiliate network (Awin and Impact both list mortgage and
  property programmes) and search for fee-free mortgage broker programmes; or
  (b) approach a local independent broker directly and agree a referral fee
  per completed case. Direct deals usually pay better and a local broker
  will happily talk to someone sending them warm, ready-to-buy leads.
- **CONVEYANCING_URL** — conveyancing comparison sites run referral
  programmes on the same networks.
- **SURVEY_URL** — local RICS surveyors, same direct approach as brokers.
- **REPORT_INTEREST_URL** — create a free form (tally.so or Google Forms)
  saying "Full street reports — £7. Leave your email and we'll tell you when
  it's ready." Every email is a vote to build it. If 50+ people sign up,
  build it; if 3 do, you just saved yourself a month of work.

After editing, upload the changed `index.html` to GitHub again (same drag-and
-drop). Vercel redeploys automatically in about a minute.

**Keep the disclosure line in the footer** — telling users that links may earn
you a fee is a legal requirement for affiliate marketing in the UK (CAP Code),
not just good manners. The Land Registry attribution line must also stay: it's
a condition of the open licence the data comes under.

## 4. The gap test (the step that actually matters)

Post the link in two or three local Facebook groups — house-buying groups,
neighbourhood groups, "moving to Manchester" groups — with a plain message
like: *"Made a free tool that checks an asking price against what's actually
sold nearby (real Land Registry data, not asking prices). Would love to know
if it's useful."*

What to watch for in the first two weeks:
- Do strangers use it more than once?
- Do they share it without being asked?
- Does anyone click the report-interest button?

If yes: buy the domain, sort the broker deal, keep going. If it's crickets,
you've spent almost nothing finding out — change the angle or move to the
next idea. Either result is a win at this stage.

## 5. Later (only once people are using it)

- **EPC open data** (free, needs a free API key from epc.opendatacommunities.org)
  adds floor area per address — that unlocks price-per-square-metre, a much
  sharper valuation and the backbone of the paid report.
- **The £7 report** with Stripe payment links (no code needed for basic ones).
- **The investor tier** — bulk searches, auction lots, price-drop alerts.

## What's in this folder

- `index.html` — the whole site: design, valuation logic, referral buttons.
- `api/sold-prices.js` — a small server function that fetches real sold
  prices for a postcode sector from HM Land Registry's open data service.

## Honest limitations to know about

- Land Registry data has no bedroom counts, so comparisons use property type
  (terraced / semi / detached / flat). EPC data fixes this later.
- Sales appear in the register weeks to months after completion — the data
  is truthful but not instant.
- The verdict is a median of nearby sold prices, not a survey or valuation.
  The footer says so; keep it that way.
