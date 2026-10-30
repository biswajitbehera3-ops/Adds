import * as L from "./lib.mjs";
const tab = (p, t) => p.getByRole("tab", { name: new RegExp("^" + t) }).click().then(() => p.waitForTimeout(1300));
const { p, browser } = await L.open("stateB", { role: "owner" }, "2026-10-31 16:45");
await tab(p, "Earnings"); await L.shot(p, "D1-earnings");
console.log((await L.text(p)).slice(0, 500).replace(/\n/g, " | "));
await tab(p, "Staff"); await p.getByLabel("Add a stylist").click(); await p.waitForTimeout(1300); await L.shot(p, "F2-add-stylist");
await browser.close(); L.close();
