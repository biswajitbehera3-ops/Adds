#!/usr/bin/env node
/**
 * Builds one salon's legal pack from the templates in legal/ and the values in
 * src/config/salon-details.json (or a details file passed as the first argument).
 *
 *   npm run legal              → legal-out/<salon>/  (filled .md + web pages)
 *   npm run legal -- --strict  → also fails if any [placeholder] is still unfilled (use before release)
 *
 * The web pages are plain static HTML in the app's brown glass style: no cookies,
 * no scripts, no web fonts or other third-party requests, so they need no consent banner.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);
const strict = args.includes("--strict");
const detailsPath = args.find((a) => !a.startsWith("--")) ?? path.join(ROOT, "src/config/salon-details.json");
const d = JSON.parse(fs.readFileSync(detailsPath, "utf8"));

const span = (days) => (days % 365 === 0 ? `${days / 365} year${days === 365 ? "" : "s"}` : `${days} days`);
const tokens = {
  salonName: d.salonName,
  legalName: d.business.legalName,
  address: d.business.address,
  city: d.business.city,
  gstinLine: d.business.gstin ? `, GSTIN ${d.business.gstin}` : "",
  phone: d.business.phone,
  email: d.business.email,
  ownerName: d.business.grievance.name,
  ownerPhone: d.business.grievance.phone,
  ownerEmail: d.business.grievance.email,
  noticeVersion: d.legal.noticeVersion,
  effectiveDate: d.legal.effectiveDate,
  privacyUrl: d.legal.privacyUrl,
  termsUrl: d.legal.termsUrl,
  providerName: d.legal.providerName,
  providerAddress: d.legal.providerAddress,
  providerGstinLine: d.legal.providerGstin ? `, GSTIN ${d.legal.providerGstin}` : "",
  providerEmail: d.legal.providerEmail,
  providerPhone: d.legal.providerPhone,
  cloudProvider: d.legal.cloudProvider,
  cloudRegion: d.legal.cloudRegion,
  setupFee: d.contract.setupFee,
  monthlyFee: d.contract.monthlyFee,
  supportHours: d.contract.supportHours,
  deliveryDays: String(d.contract.deliveryDays),
  inactiveRetention: span(d.retention.inactiveCustomerDays),
  selfieRetention: span(d.retention.attendancePhotoDays),
  reminderRetention: span(d.retention.reminderLogDays),
};

// Which documents are public web pages (for customers) and which are for signing / internal use.
const DOCS = [
  ["privacy-policy.md", "Privacy policy", "public"],
  ["refund-policy.md", "Refund policy", "public"],
  ["cookie-policy.md", "Cookie policy", "public"],
  ["privacy-notice-counter-card.md", "Counter card", "print"],
  ["terms-of-service.md", "Terms of service (salon ↔ provider)", "sign"],
  ["data-processing-agreement.md", "Data processing agreement", "sign"],
  ["staff-data-notice.md", "Staff data notice", "print"],
  ["data-deletion-request.md", "Privacy requests", "internal"],
  ["breach-response-plan.md", "Breach response plan", "internal"],
  ["accessibility-statement.md", "Accessibility statement", "public"],
];

const missing = new Set();
const fill = (text) =>
  text.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    if (!(k in tokens)) throw new Error(`Unknown token {{${k}}}`);
    const v = String(tokens[k]);
    if (/\[[^\]]*\]/.test(v)) missing.add(`${k} = ${v}`);
    return v;
  });

// Minimal Markdown → HTML for these documents: headings, lists, tables, quotes, bold, italic, links, rules.
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const inline = (s) =>
  esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2">$1</a>')
    .replace(/(^|[\s(])(https?:\/\/[^\s)<]+)/g, '$1<a href="$2">$2</a>');
function md(src) {
  const out = [];
  const lines = src.replace(/<!--[\s\S]*?-->/g, "").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!l.trim()) continue;
    let m;
    if ((m = l.match(/^(#{1,3}) (.*)/))) out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`);
    else if (/^---+$/.test(l.trim())) out.push("<hr>");
    else if (l.startsWith("|")) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith("|")) rows.push(lines[i++]);
      i--;
      const cells = (r) => r.trim().replace(/^\||\|$/g, "").split("|").map((c) => inline(c.trim()));
      const body = rows.filter((r) => !/^\|[\s:|-]+\|$/.test(r.trim()));
      out.push(`<div class="table"><table><thead><tr>${cells(body[0]).map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${body.slice(1).map((r) => `<tr>${cells(r).map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
    } else if (/^\s*([-*]|\d+\.) /.test(l)) {
      const ordered = /^\s*\d+\. /.test(l);
      const items = [];
      while (i < lines.length && /^\s*([-*]|\d+\.) /.test(lines[i])) items.push(lines[i++].replace(/^\s*([-*]|\d+\.) /, ""));
      i--;
      out.push(`<${ordered ? "ol" : "ul"}>${items.map((x) => `<li>${inline(x)}</li>`).join("")}</${ordered ? "ol" : "ul"}>`);
    } else if (l.startsWith(">")) {
      const q = [];
      while (i < lines.length && lines[i].startsWith(">")) q.push(lines[i++].replace(/^>\s?/, ""));
      i--;
      out.push(`<blockquote>${q.map(inline).join("<br>")}</blockquote>`);
    } else {
      const p = [l];
      while (i + 1 < lines.length && lines[i + 1].trim() && !/^(#|\||>|---|\s*([-*]|\d+\.) )/.test(lines[i + 1])) p.push(lines[++i]);
      out.push(`<p>${p.map(inline).join("<br>")}</p>`);
    }
  }
  return out.join("\n");
}

const CSS = `:root{--glow:#8E5B4E;--mid:#4A3029;--deep:#1A1210;--ink:#FFF8F1;--soft:rgba(255,248,241,.82);--edge:rgba(255,244,236,.28);--gold:#E4A67B}
*{box-sizing:border-box}html{background:var(--deep)}
body{margin:0;min-height:100vh;color:var(--ink);font:16px/1.6 "Helvetica Neue",Arial,system-ui,sans-serif;background:radial-gradient(120% 70% at 15% 0%,var(--glow),var(--mid) 45%,var(--deep)) fixed;padding:24px 16px 64px}
main{max-width:760px;margin:0 auto;background:linear-gradient(180deg,rgba(255,244,236,.14),rgba(255,244,236,.07));border:1px solid var(--edge);border-radius:28px;padding:28px clamp(18px,5vw,44px);backdrop-filter:blur(14px)}
h1{font-weight:600;font-size:clamp(26px,5vw,36px);line-height:1.15;margin:0 0 8px}h2{font-size:20px;margin:28px 0 8px;color:var(--gold)}h3{font-size:17px;margin:20px 0 6px}
p,li,td{color:var(--soft)}strong{color:var(--ink)}a{color:var(--gold)}a:focus-visible{outline:2px solid var(--gold);outline-offset:2px}
.table{overflow-x:auto;margin:12px 0}table{border-collapse:collapse;width:100%;font-size:15px}th,td{text-align:left;padding:8px 10px;border-bottom:1px solid var(--edge);vertical-align:top}th{color:var(--ink)}
blockquote{margin:12px 0;padding:12px 16px;border-left:3px solid var(--gold);background:rgba(0,0,0,.18);border-radius:0 12px 12px 0}
hr{border:0;border-top:1px solid var(--edge);margin:24px 0}code{font-size:.92em}
nav{max-width:760px;margin:0 auto 16px;display:flex;flex-wrap:wrap;gap:8px 18px;font-size:15px}
footer{max-width:760px;margin:16px auto 0;font-size:13px;color:var(--soft)}
@media print{body{background:#fff;color:#000}main{border:0;backdrop-filter:none;background:#fff}p,li,td,footer{color:#000}h2,a{color:#000}nav{display:none}}`;

const slug = (d.salonName || "salon").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "salon";
const outDir = path.join(ROOT, "legal-out", slug);
fs.mkdirSync(outDir, { recursive: true });
const page = (title, body, nav) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} · ${esc(d.salonName)}</title><style>${CSS}</style></head>
<body><nav aria-label="Policies">${nav}</nav><main>${body}</main>
<footer>${esc(d.business.legalName)} · ${esc(d.business.address)} · Notice version ${esc(d.legal.noticeVersion)} · This page sets no cookies and loads nothing from other sites.</footer></body></html>`;

const publicNav = DOCS.filter((x) => x[2] === "public").map(([f, t]) => `<a href="${f.replace(".md", ".html")}">${esc(t)}</a>`).join("");
for (const [file, title, kind] of DOCS) {
  const filled = fill(fs.readFileSync(path.join(ROOT, "legal", file), "utf8"));
  fs.writeFileSync(path.join(outDir, file), filled);
  fs.writeFileSync(path.join(outDir, file.replace(".md", ".html")), page(title, md(filled), kind === "public" ? publicNav : `<a href="index.html">All documents</a>`));
}
const groups = { public: "Publish on the web (links go in salon-details.json)", print: "Print / hand out", sign: "Sign with the salon", internal: "Keep internally" };
const index = Object.entries(groups)
  .map(([k, label]) => `<h2>${label}</h2><ul>${DOCS.filter((x) => x[2] === k).map(([f, t]) => `<li><a href="${f.replace(".md", ".html")}">${esc(t)}</a> · <a href="${f}">.md</a></li>`).join("")}</ul>`)
  .join("");
fs.writeFileSync(path.join(outDir, "index.html"), page("Legal pack", `<h1>Legal pack · ${esc(d.salonName)}</h1>${index}`, publicNav));

// The app also reads values no document uses (e.g. termsUrl), so check the whole file.
(function scan(o, at) {
  for (const [k, v] of Object.entries(o)) {
    if (k.startsWith("_")) continue;
    if (v && typeof v === "object") scan(v, `${at}${k}.`);
    else if (typeof v === "string" && /\[[^\]]*\]/.test(v) && ![...missing].some((m) => m.endsWith(`= ${v}`))) missing.add(`${at}${k} = ${v}`);
  }
})(d, "");

console.log(`Legal pack → ${path.relative(ROOT, outDir)}/ (${DOCS.length} documents)`);
if (missing.size) {
  console.log(`\n${missing.size} value(s) still to fill in ${path.relative(ROOT, detailsPath)}:`);
  for (const m of missing) console.log(`  - ${m}`);
  if (strict) {
    console.log("\nRelease blocked: fill these before go-live.");
    process.exitCode = 1;
  }
}
