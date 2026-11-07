import * as L from "./lib.mjs";
import fs from "fs";
const step = async (name, fn) => { try { await fn(); } catch (e) { console.log("FAIL", name, e.message.split("\n")[0]); } };
const dump = async (p, n = 900) => console.log((await L.text(p)).slice(-n).replace(/\n/g, " | "));
const vis = (p, t) => p.locator(`text="${t}" >> visible=true`).last();
const tab = (p, t) => p.getByRole("tab", { name: new RegExp("^" + t) }).click().then(() => p.waitForTimeout(1300));
{
  const { p, browser } = await L.open("stateC", { role: "owner" }, "2026-10-31 17:00");
  await step("refer2", async () => { await tab(p, "Customers"); await p.locator('input[placeholder="Search name or mobile"] >> visible=true').fill("Priya"); await p.waitForTimeout(1200);
    await vis(p, "Priya Sharma").click(); await p.waitForTimeout(1500); await L.shot(p, "G3-priya-profile-after"); await dump(p, 900);
    await vis(p, "Refer").click(); await p.waitForTimeout(1500); await L.shot(p, "G4-refer-after"); await dump(p, 500); });
  await browser.close();
}
{
  const { p, browser } = await L.open("stateC", { role: "staff", staffId: L.ids.staff["Rakesh Kumar"] }, "2026-10-31 17:10");
  await step("bill2", async () => {
    await vis(p, "Pay ₹450").click(); await p.waitForTimeout(1500);
    await vis(p, "Cash").click(); await p.waitForTimeout(800); await L.shot(p, "I1-pay-cash");
    await vis(p, "Collect ₹450").click(); await p.waitForTimeout(2500); await L.shot(p, "I2-receipt-cash"); await dump(p, 500);
  });
  fs.writeFileSync(`${L.S}/build/stateD.json`, await p.evaluate(() => localStorage.getItem("salon:data:v1")));
  await browser.close();
}
{
  const { p, browser } = await L.open("stateD", { role: "owner" }, "2026-10-31 17:12");
  await step("after", async () => { await L.shot(p, "J1-live-after"); await dump(p, 900);
    await tab(p, "Earnings"); await L.shot(p, "J2-earnings-after"); await dump(p, 700);
    await p.getByText(/^Sunita/).first().click().catch(() => {}); await p.waitForTimeout(1500); await L.shot(p, "J3-stylist"); await dump(p, 700); });
  await browser.close();
}
L.close();
