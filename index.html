<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>BrickCheck — is that asking price actually fair?</title>
<meta name="description" content="Free check of any asking price against real HM Land Registry sold prices near the property. Know before you offer.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@600;700&family=IBM+Plex+Mono:wght@400;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root { --ink:#1B2A41; --muted:#5A6B80; --line:#E2E8EF; --bg:#F4F6F8; --card:#fff;
          --green:#1E7F4F; --greenbg:#E9F5EE; --amber:#B26E00; --amberbg:#FBF3E2; --red:#B23A2E; --redbg:#FBEAE7; }
  * { box-sizing:border-box; }
  body { margin:0; min-height:100vh; background:var(--bg); color:var(--ink); font-family:'Inter',system-ui,sans-serif; padding:20px 14px 48px; }
  .shell { max-width:460px; margin:0 auto; }
  .wordmark { font-family:'Zilla Slab',serif; font-weight:700; font-size:26px; letter-spacing:-.5px; }
  .wordmark .dot { color:var(--red); }
  .tagline { font-size:13px; color:var(--muted); margin-top:2px; }
  .card { background:var(--card); border:1px solid var(--line); border-radius:14px; padding:18px; margin-top:14px; box-shadow:0 1px 2px rgba(27,42,65,.05); }
  label.f { display:block; font-size:12px; font-weight:600; color:var(--muted); text-transform:uppercase; letter-spacing:.06em; margin:12px 0 5px; }
  label.f:first-child { margin-top:0; }
  input.f { width:100%; font-family:'IBM Plex Mono',monospace; font-size:17px; padding:11px 12px; border:1.5px solid #C9D2DC; border-radius:9px; background:#FAFBFC; color:var(--ink); outline:none; }
  input.f:focus { border-color:var(--ink); }
  .typerow { display:flex; gap:7px; flex-wrap:wrap; }
  .ptype { flex:1 1 45%; padding:9px 0; border:1.5px solid #C9D2DC; border-radius:9px; background:#FAFBFC; font-size:14px; font-weight:500; color:var(--muted); text-align:center; cursor:pointer; user-select:none; }
  .ptype.sel { background:var(--ink); border-color:var(--ink); color:#fff; }
  .go { width:100%; margin-top:16px; padding:13px; border:none; border-radius:10px; background:var(--ink); color:#fff; font-size:16px; font-weight:600; font-family:'Inter',sans-serif; cursor:pointer; }
  .go:active { transform:translateY(1px); }
  .go[disabled] { opacity:.6; cursor:wait; }
  .err { color:var(--red); font-size:13px; margin-top:10px; }
  .stampwrap { display:flex; justify-content:center; padding:6px 0 2px; }
  .stamp { font-family:'Zilla Slab',serif; font-weight:700; font-size:23px; letter-spacing:.08em; padding:10px 22px; border:3px double currentColor; border-radius:6px; transform:rotate(-3deg); }
  .blurb { text-align:center; font-size:14.5px; line-height:1.5; color:#3A4A60; margin-top:12px; }
  .bars { margin-top:18px; }
  .barrow { margin-bottom:12px; }
  .barlabel { display:flex; justify-content:space-between; gap:8px; font-size:12.5px; color:var(--muted); margin-bottom:4px; }
  .barlabel b { font-family:'IBM Plex Mono',monospace; color:var(--ink); font-size:13px; white-space:nowrap; }
  .bartrack { height:12px; background:#EEF2F6; border-radius:6px; overflow:hidden; }
  .barfill { height:100%; border-radius:6px; }
  .sect { font-family:'Zilla Slab',serif; font-weight:600; font-size:17px; margin:0 0 4px; }
  .sub { font-size:12.5px; color:var(--muted); margin:0 0 12px; }
  .comp { display:flex; justify-content:space-between; align-items:baseline; gap:10px; padding:9px 0; border-top:1px dashed var(--line); }
  .comp:first-of-type { border-top:none; }
  .comp .street { font-size:14px; font-weight:600; }
  .comp .meta { font-size:12px; color:var(--muted); margin-top:1px; }
  .comp .p { font-family:'IBM Plex Mono',monospace; font-weight:600; font-size:14.5px; white-space:nowrap; }
  .cta { display:block; width:100%; text-align:left; margin-top:10px; padding:13px 14px; border-radius:10px; border:1.5px solid var(--line); background:#FAFBFC; cursor:pointer; font-family:'Inter',sans-serif; text-decoration:none; }
  .cta .t { font-size:15px; font-weight:600; color:var(--ink); }
  .cta .d { font-size:12.5px; color:var(--muted); margin-top:2px; }
  .cta.primary { background:var(--green); border-color:var(--green); }
  .cta.primary .t { color:#fff; }
  .cta.primary .d { color:#D7EEDF; }
  .footer { text-align:center; font-size:11px; color:#8494A7; margin-top:24px; line-height:1.6; }
  .footer a { color:#8494A7; }
  .spinner { text-align:center; color:var(--muted); font-size:14px; padding:8px 0; }
  .hidden { display:none; }
</style>
</head>
<body>
<div class="shell">
  <div class="wordmark">BrickCheck<span class="dot">.</span></div>
  <div class="tagline">Is that asking price actually fair? Checked against real sold prices.</div>

  <div class="card">
    <label class="f" for="pc">Property postcode</label>
    <input class="f" id="pc" placeholder="e.g. M21 9PN" autocomplete="postal-code">
    <label class="f" for="price">Asking price</label>
    <input class="f" id="price" inputmode="numeric" placeholder="e.g. 450,000">
    <label class="f">Property type</label>
    <div class="typerow" id="types">
      <div class="ptype sel" data-t="terraced">Terraced</div>
      <div class="ptype" data-t="semi-detached">Semi-detached</div>
      <div class="ptype" data-t="detached">Detached</div>
      <div class="ptype" data-t="flat-maisonette">Flat</div>
    </div>
    <button class="go" id="go">Check this price</button>
    <div class="err hidden" id="err"></div>
  </div>

  <div class="spinner hidden" id="loading">Pulling real sold prices from HM Land Registry…</div>

  <div id="result" class="hidden">
    <div class="card">
      <div class="stampwrap"><div class="stamp" id="stamp"></div></div>
      <div class="blurb" id="blurb"></div>
      <div class="bars">
        <div class="barrow">
          <div class="barlabel"><span>Asking price</span><b id="askLabel"></b></div>
          <div class="bartrack"><div class="barfill" id="askBar" style="background:var(--ink)"></div></div>
        </div>
        <div class="barrow">
          <div class="barlabel"><span id="estName">Estimated from sold prices</span><b id="estLabel"></b></div>
          <div class="bartrack"><div class="barfill" id="estBar"></div></div>
        </div>
      </div>
    </div>

    <div class="card">
      <h3 class="sect">What actually sold nearby</h3>
      <p class="sub" id="compsSub"></p>
      <div id="comps"></div>
      <a class="cta" id="reportCta" href="#">
        <div class="t">Get the full street report</div>
        <div class="d">Every sale since 2000, trends for this street, and a negotiation cheat sheet. Register your interest — it's coming soon.</div>
      </a>
    </div>

    <div class="card">
      <h3 class="sect">Your next step</h3>
      <p class="sub">Before you offer on this property:</p>
      <a class="cta primary" id="brokerCta" href="#">
        <div class="t">Get a mortgage decision in principle →</div>
        <div class="d">Free, no credit-score impact. Sellers take offers more seriously with one.</div>
      </a>
      <a class="cta hidden" id="surveyCta" href="#">
        <div class="t">Book a survey before you offer</div>
        <div class="d">A Level 2 survey gives you evidence to negotiate the price down.</div>
      </a>
      <a class="cta" id="convCta" href="#">
        <div class="t">Find a conveyancing solicitor</div>
        <div class="d">Compare quotes from local firms in minutes.</div>
      </a>
    </div>
  </div>

  <div class="footer">
    Sold-price estimates are indicative and not a formal valuation.<br>
    Some links are referral links — if you use them we may receive a fee, at no cost to you.<br>
    Contains HM Land Registry data © Crown copyright and database right 2026.
    Licensed under the <a href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" target="_blank" rel="noopener">Open Government Licence v3.0</a>.
  </div>
</div>

<script>
// ============================================================
// YOUR REVENUE LINKS — edit these once you have them.
// Leave as "#" and the button shows a friendly placeholder.
// ============================================================
const CONFIG = {
  BROKER_URL: "#",           // your mortgage broker affiliate/referral link (main earner)
  SURVEY_URL: "#",           // surveyor referral link
  CONVEYANCING_URL: "#",     // conveyancing comparison referral link
  REPORT_INTEREST_URL: "#",  // a free Tally/Google Form asking for their email — demand test for the paid report
};

const TYPE_LABELS = { "terraced":"terraced", "semi-detached":"semi-detached", "detached":"detached", "flat-maisonette":"flat" };
let selectedType = "terraced";

document.getElementById("types").addEventListener("click", (e) => {
  const el = e.target.closest(".ptype");
  if (!el) return;
  document.querySelectorAll(".ptype").forEach((p) => p.classList.remove("sel"));
  el.classList.add("sel");
  selectedType = el.dataset.t;
});

function gbp(n){ return "£" + Math.round(n).toLocaleString("en-GB"); }

function normalisePostcode(raw){
  const c = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (c.length < 5 || c.length > 7) return null;
  return c.slice(0, -3) + " " + c.slice(-3);
}

function sectorOf(postcode){ return postcode.slice(0, postcode.indexOf(" ") + 2); }

function monthsBetween(iso){
  const d = new Date(iso), now = new Date();
  return (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
}
function agoLabel(iso){
  const m = monthsBetween(iso);
  if (m <= 0) return "this month";
  if (m === 1) return "1 month ago";
  if (m < 12) return m + " months ago";
  const y = Math.floor(m / 12);
  return y === 1 ? "1 year ago" : y + " years ago";
}
function median(arr){
  const s = [...arr].sort((a,b)=>a-b);
  const mid = Math.floor(s.length/2);
  return s.length % 2 ? s[mid] : (s[mid-1]+s[mid])/2;
}

function setError(msg){
  const el = document.getElementById("err");
  el.textContent = msg; el.classList.toggle("hidden", !msg);
}

function wireCta(id, url, comingSoonMsg){
  const el = document.getElementById(id);
  if (url && url !== "#") { el.href = url; el.target = "_blank"; el.rel = "noopener"; }
  else el.addEventListener("click", (e) => { e.preventDefault(); alert(comingSoonMsg); });
}
wireCta("brokerCta", CONFIG.BROKER_URL, "Mortgage partner coming soon — check back shortly!");
wireCta("surveyCta", CONFIG.SURVEY_URL, "Survey booking partner coming soon!");
wireCta("convCta", CONFIG.CONVEYANCING_URL, "Conveyancing comparison coming soon!");
wireCta("reportCta", CONFIG.REPORT_INTEREST_URL, "Full street reports are coming soon — thanks for your interest, it genuinely helps us decide to build it!");

document.getElementById("go").addEventListener("click", async () => {
  const pc = normalisePostcode(document.getElementById("pc").value);
  const asking = parseInt(document.getElementById("price").value.replace(/[^0-9]/g,""), 10);
  if (!pc) return setError("That doesn't look like a full UK postcode — e.g. M21 9PN.");
  if (!asking || asking < 20000) return setError("Enter the asking price, e.g. 450,000.");
  setError("");

  const btn = document.getElementById("go");
  btn.disabled = true;
  document.getElementById("result").classList.add("hidden");
  document.getElementById("loading").classList.remove("hidden");

  try {
    const resp = await fetch("/api/sold-prices?sector=" + encodeURIComponent(sectorOf(pc)));
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || "Lookup failed");
    render(pc, asking, data.sales || []);
  } catch (e) {
    setError(e.message + " — please try again in a moment.");
  } finally {
    btn.disabled = false;
    document.getElementById("loading").classList.add("hidden");
  }
});

function render(pc, asking, sales){
  const sameType = sales.filter((s) => s.type === selectedType);
  const recent = sameType.filter((s) => monthsBetween(s.date) <= 18);
  const pool = recent.length >= 5 ? recent : sameType;
  const usedFallback = sameType.length < 3;
  const finalPool = usedFallback ? sales : pool;

  if (finalPool.length < 3) {
    setError("Not enough recorded sales near " + pc + " to give a fair verdict. Try a neighbouring postcode.");
    return;
  }

  const estimate = median(finalPool.map((s) => s.price));
  const ratio = asking / estimate;
  const typeName = TYPE_LABELS[selectedType];

  let verdict, tone, blurb;
  if (ratio > 1.15) { verdict = "LOOKS VERY HIGH"; tone = "red";
    blurb = "The asking price is well above what nearby " + typeName + " homes have actually sold for. Strong grounds to offer under asking — or walk away."; }
  else if (ratio > 1.05) { verdict = "LOOKS HIGH"; tone = "amber";
    blurb = "Priced above recent sold prices for nearby " + typeName + " homes. Worth negotiating."; }
  else if (ratio < 0.93) { verdict = "POSSIBLE DEAL"; tone = "green";
    blurb = "The asking price sits below recent sold prices for nearby " + typeName + " homes. Check why — then move quickly."; }
  else { verdict = "PRICED FAIR"; tone = "green";
    blurb = "In line with what nearby " + typeName + " homes have genuinely sold for recently."; }

  const tones = { green:["var(--green)","var(--greenbg)"], amber:["var(--amber)","var(--amberbg)"], red:["var(--red)","var(--redbg)"] };
  const [fg, bg] = tones[tone];

  const stamp = document.getElementById("stamp");
  stamp.textContent = verdict; stamp.style.color = fg; stamp.style.background = bg;
  document.getElementById("blurb").textContent = blurb;

  const barMax = Math.max(asking, estimate) * 1.1;
  document.getElementById("askLabel").textContent = gbp(asking);
  document.getElementById("askBar").style.width = (asking / barMax * 100) + "%";
  document.getElementById("estLabel").textContent = gbp(estimate);
  document.getElementById("estBar").style.width = (estimate / barMax * 100) + "%";
  document.getElementById("estBar").style.background = fg;
  document.getElementById("estName").textContent =
    "Median sold price" + (usedFallback ? " (all property types nearby)" : " (" + typeName + " nearby)");

  document.getElementById("compsSub").textContent =
    "Recent completed sales in " + sectorOf(pc) + "xx — real sold prices from HM Land Registry, not asking prices.";

  const compsEl = document.getElementById("comps");
  compsEl.innerHTML = "";
  finalPool.slice(0, 8).forEach((s) => {
    const row = document.createElement("div");
    row.className = "comp";
    const addr = [s.paon, s.street].filter(Boolean).join(" ") || s.postcode;
    row.innerHTML =
      '<div><div class="street"></div><div class="meta"></div></div><div class="p"></div>';
    row.querySelector(".street").textContent = addr;
    row.querySelector(".meta").textContent = (TYPE_LABELS[s.type] || s.type) + " · sold " + agoLabel(s.date);
    row.querySelector(".p").textContent = gbp(s.price);
    compsEl.appendChild(row);
  });

  document.getElementById("surveyCta").classList.toggle("hidden", tone === "green");
  document.getElementById("result").classList.remove("hidden");
  document.getElementById("result").scrollIntoView({ behavior: "smooth", block: "start" });
}
</script>
</body>
</html>
