import * as L from "./lib.mjs";
import fs from "fs";
const step = async (name, fn) => { try { await fn(); } catch (e) { console.log("FAIL", name, e.message.split("\n")[0]); } };
const dump = async (p, n = 900) => console.log((await L.text(p)).slice(-n).replace(/\n/g, " | "));
const vis = (p, t) => p.locator(`text="${t}" >> visible=true`).last();
{
  const { p, browser } = await L.open("stateB", { role: "staff", staffId: L.ids.staff["Imran Khan"] }, "2026-10-31 16:58");
  await step("bill", async () => {
    await L.shot(p, "H0-imran-home");
    await vis(p, "Pay ₹400").click(); await p.waitForTimeout(1500);
    await vis(p, "UPI").click(); await p.waitForTimeout(800); await L.shot(p, "H1-pay-upi"); await dump(p, 500);
    await vis(p, "Collect ₹400").click(); await p.waitForTimeout(2500); await L.shot(p, "H2-after-collect"); await dump(p, 1200);
  });
  await step("thanks", async () => {
    const b = p.locator('text=/WhatsApp/ >> visible=true').last(); console.log("btn:", await b.innerText());
    await b.click(); await p.waitForTimeout(1500);
    console.log("OPENED", await p.evaluate(() => window.__opened)); await L.shot(p, "H3-thanks-sent"); await dump(p, 600);
  });
  fs.writeFileSync(`${L.S}/build/stateC.json`, await p.evaluate(() => localStorage.getItem("salon:data:v1")));
  await browser.close();
}
L.close();
