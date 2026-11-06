// QA helper: render chosen frames of a composition as PNG stills, so they can be checked
// over bright footage before anything is delivered.
//
//   node scripts/check-frames.mjs <CompositionId> <outDir> <frame,frame,...> ['<json props>']
//
// Bundles once and reuses the browser for every frame.
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";

const [id, outDir, framesArg, propsArg] = process.argv.slice(2);
if (!id || !outDir || !framesArg) {
  console.error("usage: node scripts/check-frames.mjs <id> <outDir> <f1,f2,...> ['{props}']");
  process.exit(1);
}
const inputProps = propsArg ? JSON.parse(propsArg) : {};
const browserExecutable = fs.existsSync("/opt/pw-browsers/chromium")
  ? "/opt/pw-browsers/chromium"
  : null;

fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browser = await openBrowser("chrome", { browserExecutable });
const composition = await selectComposition({ serveUrl, id, inputProps, puppeteerInstance: browser });

for (const frame of framesArg.split(",").map(Number)) {
  const output = path.join(outDir, `${id}-${frame}.png`);
  await renderStill({ composition, serveUrl, output, frame, inputProps, imageFormat: "png", puppeteerInstance: browser });
  console.log(output);
}
await browser.close({ silent: true });
