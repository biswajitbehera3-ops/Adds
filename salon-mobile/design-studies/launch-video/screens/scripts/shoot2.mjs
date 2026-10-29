import * as L from "./lib.mjs";
const step = async (name, fn) => { try { await fn(); } catch (e) { console.log("FAIL", name, e.message.split("\n")[0]); } };
const dump = async (p, n = 900) => console.log((await L.text(p)).slice(0, n).replace(/\n/g, " | "));
const tab = (p, t) => p.getByRole("tab", { name: new RegExp("^" + t) }).click().then(() => p.waitForTimeout(1300));
{
  const { p, browser } = await L.open("stateB", { role: "owner" }, "2026-10-31 16:45");
  await step("live", async () => { await L.shot(p, "C1-live-floor"); await dump(p, 700);
    await p.mouse.wheel(0, 900); await p.waitForTimeout(900); await L.shot(p, "C2-live-checks"); await dump(p, 2500); await p.mouse.wheel(0, -2000); });
  await step("earnings", async () => { await tab(p, "Earnings"); await L.shot(p, "D1-earnings"); });
  await step("staff", async () => { await tab(p, "Staff"); await L.shot(p, "E1-staff");
    await p.getByLabel(/Leave requests, 1 waiting/).click(); await p.waitForTimeout(1300); await L.shot(p, "E2-leave"); await dump(p);
    await p.getByText(/^‹/).first().click().catch(() => p.goBack()); await p.waitForTimeout(1000); });
  await step("addStylist", async () => { await tab(p, "Staff"); await p.getByText(/Add a stylist|Add stylist/).first().click(); await p.waitForTimeout(1300); await L.shot(p, "F2-add-stylist"); await dump(p); });
  await browser.close();
}
{
  const { p, browser } = await L.open("stateB", { role: "owner" }, "2026-10-31 16:45");
  await step("services", async () => { await p.getByLabel("Owner menu").click(); await p.waitForTimeout(900);
    await p.getByText("Services & prices", { exact: true }).click(); await p.waitForTimeout(1300); await L.shot(p, "F1-services"); await dump(p); });
  await browser.close();
}
{
  const { p, browser } = await L.open("stateB", { role: "owner" }, "2026-10-31 16:45");
  await step("refer", async () => { await tab(p, "Customers"); await p.getByPlaceholder(/./).first().fill("Priya"); await p.waitForTimeout(1200);
    await p.getByText("Priya Sharma", { exact: true }).first().click(); await p.waitForTimeout(1500); await L.shot(p, "G1-priya-profile"); await dump(p);
    await p.getByText("Refer", { exact: true }).last().click(); await p.waitForTimeout(1500); await L.shot(p, "G2-refer"); await dump(p); });
  await browser.close();
}
L.close();
