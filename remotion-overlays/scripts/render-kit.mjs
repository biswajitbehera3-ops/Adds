// Render preview stills of several compositions with one bundle.
//   node scripts/render-kit.mjs <outDir> <Id:frame> [<Id:frame> ...] [--scale=0.5]
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const outDir = args.shift();
const scaleArg = args.find((a) => a.startsWith("--scale="));
const scale = scaleArg ? Number(scaleArg.split("=")[1]) : 0.5;
const jobs = args.filter((a) => !a.startsWith("--")).map((a) => a.split(":"));
const browserExecutable = fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : null;
fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browser = await openBrowser("chrome", { browserExecutable });
for (const [id, frame] of jobs) {
  const composition = await selectComposition({ serveUrl, id, puppeteerInstance: browser });
  const output = path.join(outDir, `${id}-${frame}.png`);
  await renderStill({ composition, serveUrl, output, frame: Number(frame), scale, imageFormat: "png", puppeteerInstance: browser });
  console.log(output);
}
await browser.close({ silent: true });
