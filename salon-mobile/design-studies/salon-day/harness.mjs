// Harness for the salon-day simulation: drives the real app (single-file web build) in Chromium
// with a fake clock, counts taps and typed characters per task, captures WhatsApp links the app
// opens, takes screenshots and text dumps, and keeps the ground truth of what "really" happened.
import { chromium } from "/opt/node-tools/node_modules/playwright/index.mjs";
import http from "http";
import fs from "fs";

export async function start({ html, out, port = 8150, startIST }) {
  fs.mkdirSync(out + "/shots", { recursive: true });
  const srv = http.createServer((q, r) => { r.writeHead(200, { "content-type": "text/html" }); fs.createReadStream(html).pipe(r); }).listen(port);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1.5 });
  await ctx.addInitScript(() => {
    window.__opened = [];
    window.open = (u) => { window.__opened.push(String(u)); return null; };
  });
  const p = await ctx.newPage();
  const H = {
    p, out, browser, srv, errors: [], tasks: [], truth: [], whatsapp: [], screens: [], notes: [],
    cur: null, shotN: 0,
  };
  p.on("pageerror", (e) => H.errors.push({ at: H.clock, msg: e.message.split("\n")[0] }));
  p.on("console", (m) => { if (m.type() === "error") H.errors.push({ at: H.clock, msg: "console: " + m.text().slice(0, 200) }); });
  await p.clock.install({ time: istToDate(startIST) });
  H.clock = startIST;
  await p.goto(`http://localhost:${port}/`);
  await p.waitForTimeout(3500);
  return H;
}

export function istToDate(s) { // "2026-10-31 09:30"
  const [d, t] = s.split(" ");
  return new Date(`${d}T${t}:00+05:30`);
}

export async function at(H, hhmm) {
  const day = H.clock.split(" ")[0];
  H.clock = `${day} ${hhmm}`;
  await H.p.clock.setSystemTime(istToDate(H.clock));
  await H.p.waitForTimeout(250);
}

// A task = one thing a person does (bill a walk-in, check in, count the cash...).
export async function task(H, actor, customer, what, fn) {
  const t = { at: H.clock, actor, customer, what, taps: 0, chars: 0, ok: true, error: null, waits: 0, notes: [] };
  H.cur = t;
  const t0 = Date.now();
  try { await fn(t); } catch (e) {
    t.ok = false; t.error = e.message.split("\n")[0].slice(0, 300);
    await shot(H, `FAIL-${actor}-${customer || what}`.replace(/[^\w-]+/g, "_").slice(0, 60));
  }
  t.harnessMs = Date.now() - t0;
  // Human time estimate: 1.5 s per tap (find + press), 0.5 s per typed character on a phone keyboard,
  // plus 4 s per screen the person has to read; the WhatsApp hand-off counts 6 s each (switch app, press send, come back).
  t.estSeconds = Math.round(t.taps * 1.5 + t.chars * 0.5 + t.waits * 4 + (t.whatsapp || 0) * 6);
  H.tasks.push(t); H.cur = null;
  console.log(`${t.at.slice(11)} ${t.ok ? "ok  " : "FAIL"} ${actor.padEnd(8)} ${String(customer || "").padEnd(4)} ${what} | taps ${t.taps} chars ${t.chars} ~${t.estSeconds}s${t.error ? " | " + t.error : ""}`);
  return t;
}

const L = (H, sel) => (typeof sel === "string" ? H.p.getByText(sel, { exact: true }).last() : sel);
export async function tap(H, sel, { wait = 500, timeout = 5000 } = {}) {
  const loc = L(H, sel);
  await loc.click({ timeout });
  if (H.cur) H.cur.taps++;
  await H.p.waitForTimeout(wait);
}
export async function type(H, sel, text, { wait = 200 } = {}) {
  const loc = L(H, sel);
  await loc.click({ timeout: 5000 });
  await loc.fill(text);
  if (H.cur) { H.cur.taps++; H.cur.chars += text.length; }
  await H.p.waitForTimeout(wait);
}
export async function keypad(H, digits) {
  for (const k of digits) {
    await H.p.getByRole("button", { name: k, exact: true }).click({ timeout: 4000 });
    if (H.cur) H.cur.taps++;
  }
  await H.p.waitForTimeout(600);
}
export function read(H, n = 1) { if (H.cur) H.cur.waits += n; }
export async function text(H) { return H.p.evaluate(() => document.body.innerText.replace(/\n{2,}/g, "\n")); }
export async function has(H, s, timeout = 1500) {
  try { await H.p.getByText(s, { exact: false }).first().waitFor({ timeout }); return true; } catch { return false; }
}
export async function shot(H, name, { full = false } = {}) {
  await H.p.waitForTimeout(700);
  const file = `shots/${String(H.shotN++).padStart(3, "0")}-${name}.png`;
  await H.p.screenshot({ path: `${H.out}/${file}`, fullPage: full });
  H.screens.push({ at: H.clock, name, file, text: await text(H) });
  return file;
}
export async function grabWhatsApp(H, actor, customer, purpose) {
  const urls = await H.p.evaluate(() => { const u = window.__opened.slice(); window.__opened.length = 0; return u; });
  for (const u of urls) {
    let msg = "", to = "";
    try { const url = new URL(u); to = url.pathname.replace("/", ""); msg = url.searchParams.get("text") || ""; } catch { msg = u; }
    H.whatsapp.push({ at: H.clock, actor, customer, purpose, to, message: msg, raw: u });
    if (H.cur) H.cur.whatsapp = (H.cur.whatsapp || 0) + 1;
  }
  return urls;
}
export function truth(H, row) { H.truth.push({ at: H.clock, ...row }); }
export function note(H, s) { H.notes.push({ at: H.clock, note: s }); console.log(`   NOTE ${H.clock.slice(11)} ${s}`); }

export async function storage(H) {
  return H.p.evaluate(() => JSON.parse(localStorage.getItem("salon:data:v1") || "null"));
}
export async function reload(H) { await H.p.goto(H.p.url().split("#")[0]); await H.p.waitForTimeout(3000); }

export async function finish(H) {
  fs.writeFileSync(`${H.out}/run.json`, JSON.stringify({
    tasks: H.tasks, truth: H.truth, whatsapp: H.whatsapp, errors: H.errors, notes: H.notes,
    screens: H.screens.map(({ text, ...s }) => s),
  }, null, 1));
  fs.writeFileSync(`${H.out}/screens.txt`, H.screens.map((s) => `\n===== ${s.at} ${s.name} (${s.file}) =====\n${s.text}`).join("\n"));
  await H.browser.close(); H.srv.close();
}
