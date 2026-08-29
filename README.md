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
  saying "Full street reports — £3. Leave your email and we'll tell you when
  it's ready." Every email is a vote to build it. If 50+ people sign up,
  build it; if 3 do, you just saved yourself a month of work.
  This is the default (`REPORT_MODE: "interest"`) — do this first, before the
  paid version below.

After editing, upload the changed `index.html` to GitHub again (same drag-and
-drop). Vercel redeploys automatically in about a minute.

- **GOOGLE_MAPS_API_KEY — optional, adds a real street photo to results.**
  1. Go to console.cloud.google.com, create a project (free), then
     **APIs & Services → Library** and enable **"Street View Static API"**.
  2. You'll be asked to attach a billing account — Google requires this even
     for free-tier use, but Street View Static usage includes a large free
     monthly allowance and metadata checks (which this site uses to avoid
     showing a broken image) don't count against it at all.
  3. Create an API key under **APIs & Services → Credentials**, then
     immediately restrict it: **Application restrictions → Websites**, and
     add your Vercel/custom domain. This stops anyone else using your key.
  4. Paste the key into `GOOGLE_MAPS_API_KEY` in the `CONFIG` block of both
     `index.html` and `report.html`. Leave it blank and the photo section
     just stays hidden — nothing breaks.
  The photo is centred on the postcode's location, not a specific house
  number — Land Registry data doesn't give us exact coordinates for a single
  property, so treat it as "what this street looks like," not proof of
  which building it is.

- **EPC_API_EMAIL / EPC_API_KEY — optional, adds floor area &amp; £-per-m².**
  This is the single biggest accuracy upgrade available, and it's what makes
  the £3 report worth paying for: Land Registry sold-price data has no size
  information at all, so "£450,000 for a terraced house" could mean two very
  different things depending on square footage. Adding this shows the floor
  area, energy rating, and asking-price-per-square-metre alongside the
  median comparison.
  1. Register for a free account at **epc.opendatacommunities.org**, then
     go to your account page and copy your **API key**.
  2. In Vercel: **Project → Settings → Environment Variables**, add two
     variables: `EPC_API_EMAIL` (the email you registered with) and
     `EPC_API_KEY` (the key). No changes needed to the HTML files — this one
     lives entirely in environment variables since it's read server-side.
  3. Redeploy and search a postcode you know has an EPC certificate — you
     should see a new "Energy & floor area" card in the results.
  Leave these unset and the card just doesn't appear — nothing else is
  affected. England &amp; Wales only; Scotland has a separate EPC register
  this doesn't query. A postcode can cover more than one dwelling (flats in
  the same building, for instance), so treat the floor area as "roughly this
  size," not a guarantee it's the exact unit being sold.

- **CONTACT_EMAIL &amp; legal.html — do this before switching REPORT_MODE to
  "paid".** Once you're taking real payments you need a real way for someone
  to reach you if a payment doesn't unlock a report, plus basic terms
  covering refunds. Both are already built — you just need to fill them in:
  1. Set `CONTACT_EMAIL` in the `CONFIG` block of `index.html` and
     `report.html` to a real inbox you check. It appears in the footer of
     both pages automatically.
  2. Open `legal.html` and replace the four highlighted placeholders — your
     name/trading name, your contact email (twice), and the copyright year
     — with your real details.
  3. **This isn't legal advice, and I'm not a lawyer** — `legal.html` covers
     the basics (what the site is, that the £3 report is instant digital
     content and what that means for cancellation rights, how payment and
     data are handled), but have it properly checked before you rely on it,
     especially once real money is involved.
  4. In Stripe, on your Payment Link, you can also turn on **"Collect
     consent to terms of service"** under its checkout options and point it
     at `https://yourdomain.co.uk/legal.html` — this makes ticking the box
     part of the actual checkout, not just a line on your own site.

- **Turning the £3 report on for real (once the interest form shows demand)**

  The interest form above just collects emails. This wires up an actual
  payment — someone clicks "Get the full street report," pays £3 through
  Stripe, and lands back on `report.html` with their report unlocked. No one
  can view a report without a confirmed Stripe payment: the report page asks
  Stripe directly, using a secret key that never leaves your server, before
  it shows anything.

  1. **Create a Stripe account** at stripe.com (free — you only pay a small
     percentage per transaction, no monthly fee).
  2. In the Stripe Dashboard, go to **Payment links → Create payment link**.
     Add a product called "KerbCheck street report," one-time price **£3**,
     GBP. Save it.
  3. Still editing that Payment Link, open **"After payment"** and choose
     **"Don't show confirmation page"** → redirect customers to your
     website. Set the redirect URL to:
     ```
     https://yourdomain.co.uk/report.html?session_id={CHECKOUT_SESSION_ID}
     ```
     (use your actual domain; keep `{CHECKOUT_SESSION_ID}` exactly as shown
     — Stripe fills that part in automatically). This one field is what
     sends buyers back to their report after paying, so it's worth
     double-checking.
  4. Copy the Payment Link's URL (starts `https://buy.stripe.com/...`) into
     `STRIPE_PAYMENT_LINK` in the `CONFIG` block of **both** `index.html`
     and `report.html`, and set `REPORT_MODE: "paid"` in both files too.
  5. In Stripe, go to **Developers → API keys** and copy the **Secret key**
     (starts `sk_live_...`; use the "test mode" toggle and its `sk_test_...`
     key while you try this out, so you're not paying yourself real money
     to test it). In Vercel: **Project → Settings → Environment Variables**,
     add `STRIPE_SECRET_KEY` with that value. **Never paste this key into
     index.html, report.html, or anything you commit to GitHub** — those
     files are public even in a "private" repo once deployed, and this key
     can issue refunds and read your payment history.
  6. Redeploy (upload the two changed HTML files to GitHub; Vercel picks up
     the new environment variable automatically). Run one real test
     purchase yourself in Stripe's test mode before switching to live keys.

  What this buys you beyond the interest form: real revenue with zero
  ongoing work, and it fully replaces `REPORT_INTEREST_URL` — once
  `REPORT_MODE` is `"paid"`, the interest form is no longer shown.

**Keep the disclosure line in the footer** — telling users that links may earn
you a fee is a legal requirement for affiliate marketing in the UK (CAP Code),
not just good manners. The Land Registry attribution line must also stay: it's
a condition of the open licence the data comes under.

## 4. The gap test (the step that actually matters)

First, turn on a way to actually see whether anyone's using it: in Vercel,
open your project → **Analytics** tab → **Enable**. It's free on the Hobby
plan, needs no code (the script tag is already in both HTML files, it just
does nothing until you flip this on), and needs no cookie banner since it
doesn't use cookies or collect anything personal — just page-view counts.

Post the link in two or three local Facebook groups — house-buying groups,
neighbourhood groups, "moving to Manchester" groups — with a plain message
like: *"Made a free tool that checks an asking price against what's actually
sold nearby (real Land Registry data, not asking prices). Would love to know
if it's useful."*

What to watch for in the first two weeks (this is what the Analytics tab and
the report-interest form are for — you don't need to guess):
- Do strangers use it more than once?
- Do they share it without being asked?
- Does anyone click the report-interest button?

If yes: buy the domain, sort the broker deal, keep going. If it's crickets,
you've spent almost nothing finding out — change the angle or move to the
next idea. Either result is a win at this stage.

## 5. Later (only once people are using it)

- **The investor tier** — bulk searches, auction lots, price-drop alerts.
- **Matching EPC floor area to individual comparable sales**, not just the
  searched property — a proper price-per-square-metre model across every
  comp, not just the one you searched. Real address-matching work; worth it
  once the £3 report has proven people will pay for it.

## What's in this folder

- `index.html` — the whole site: design, valuation logic, referral buttons.
- `report.html` — the full street report page (free or £3, per `REPORT_MODE`).
- `legal.html` — Terms &amp; Privacy, including the £3 report's refund policy.
  Fill in the placeholders before going live (see step 3 above).
- `api/sold-prices.js` — a small server function that fetches real sold
  prices for a postcode sector from HM Land Registry's open data service.
- `api/street-report.js` — the same, but for the full street report page.
- `api/verify-payment.js` — confirms a Stripe payment before `report.html`
  shows a paid report (only used when `REPORT_MODE` is `"paid"`).
- `api/epc.js` — looks up floor area &amp; energy rating for a postcode
  (only returns data once `EPC_API_EMAIL`/`EPC_API_KEY` are set).
- `lib/rateLimit.js` — a small shared helper the API routes use to cap how
  many requests one visitor can make per few minutes (see limitations below).
  Lives outside `api/` on purpose — anything directly inside `api/` becomes
  its own public endpoint on Vercel, and this is a helper, not a route.
- `vercel.json` — a few standard security response headers. Doesn't change
  how the site is built or deployed, purely response headers.

## Honest limitations to know about

- Land Registry data has no bedroom counts, so comparisons use property type
  (terraced / semi / detached / flat). EPC data fixes this later.
- Sales appear in the register weeks to months after completion — the data
  is truthful but not instant.
- The verdict is a median of nearby sold prices, not a survey or valuation.
  The footer says so; keep it that way.
- (Fixed) Two things that could make the estimate look "wrong": the
  property-type filter is now matched more defensively so it can't silently
  fall back to blending in every property type nearby, and the sold-price
  query now excludes HM Land Registry's "Additional Price Paid" entries
  (repossessions, identified buy-to-lets, non-private transfers — sales that
  don't reliably reflect market value) and any record marked as superseded/
  deleted. If a comparison still looks off for a specific postcode, it's
  most likely because there just aren't many genuine comparable sales nearby
  — check the sale count shown under "What actually sold nearby."
- The new street photo shows the postcode's approximate location, not a
  verified photo of the exact house — UK postcodes usually cover a handful
  of neighbouring addresses, and Land Registry data doesn't include precise
  coordinates for a single property.
- The rate limiting in `lib/rateLimit.js` is intentionally simple: it caps
  requests per visitor per warm serverless instance, not across your whole
  site globally. That's enough to stop a script or bot hammering one
  endpoint in a loop, which is the realistic abuse a small free tool sees —
  it is not a substitute for Vercel's paid Firewall if the site ever gets
  targeted seriously. Free, zero-setup, good enough for this stage.
- The EPC floor area is matched by postcode only, not by exact address —
  see the EPC setup notes in step 3 above for what that means in practice.
