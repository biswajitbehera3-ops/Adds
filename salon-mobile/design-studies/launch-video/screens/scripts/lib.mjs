import { chromium } from "/opt/node-tools/node_modules/playwright/index.mjs";
import http from "http";
import fs from "fs";
export const S = "/tmp/claude-0/-home-user-Adds/bb7d919e-d314-53e1-9de6-9f2761a9821f/scratchpad/film";
export const ids = JSON.parse(fs.readFileSync(`${S}/build/ids.json`));
let srv; const port = 8170;
export async function open(state, session, timeIST, { video = false } = {}) {
  if (!srv) srv = http.createServer((q, r) => { r.writeHead(200, { "content-type": "text/html" }); fs.createReadStream(`${S}/app.html`).pipe(r); }).listen(port);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, ...(video ? { recordVideo: { dir: `${S}/rec/video`, size: { width: 780, height: 1688 } } } : {}) });
  const data = fs.readFileSync(`${S}/build/${state}.json`, "utf8");
  const owner = JSON.stringify(JSON.parse(data).owner);
  await ctx.addInitScript(([data, owner, session]) => {
    window.open = (u) => { (window.__opened ||= []).push(String(u)); return null; };
    if (sessionStorage.getItem("film-loaded")) return;
    sessionStorage.setItem("film-loaded", "1");
    localStorage.setItem("salon:data:v1", data);
    localStorage.setItem("salon:owner", owner);
    localStorage.setItem("salon:session", session);
    localStorage.setItem("salon:intro-seen", "1");
  }, [data, owner, JSON.stringify(session)]);
  const p = await ctx.newPage();
  p.on("pageerror", (e) => console.log("PAGEERROR", e.message.split("\n")[0]));
  await p.clock.install({ time: new Date(timeIST.replace(" ", "T") + ":00+05:30") });
  await p.goto(`http://localhost:${port}/`);
  await p.waitForTimeout(3500);
  return { p, ctx, browser };
}
export const text = (p) => p.evaluate(() => document.body.innerText.replace(/\n{2,}/g, "\n"));
export async function shot(p, name) { await p.waitForTimeout(800); await p.screenshot({ path: `${S}/shots/${name}.png` }); console.log("shot", name); }
export function close() { srv?.close(); }
