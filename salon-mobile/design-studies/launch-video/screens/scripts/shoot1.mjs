import * as L from "./lib.mjs";
const step = async (name, fn) => { try { await fn(); } catch (e) { console.log("FAIL", name, e.message.split("\n")[0]); } };
const dump = async (p, n = 900) => console.log((await L.text(p)).slice(0, n).replace(/\n/g, " | "));
// A: owner, Thursday 4:10 PM: reminders
{
  const { p, browser } = await L.open("stateA", { role: "owner" }, "2026-10-29 16:10");
  await step("reminders", async () => {
    await p.getByRole("tab", { name: /^Customers/ }).click(); await p.waitForTimeout(1200);
    await L.shot(p, "A1-customers-reminder-card");
    await p.getByLabel(/reminders to do\. Open/).click(); await p.waitForTimeout(1500);
    await L.shot(p, "A2-reminders-list"); await dump(p);
    await p.getByLabel(/^Priya Sharma, Haircut/).click(); await p.waitForTimeout(1200);
    await L.shot(p, "A3-reminder-open"); await dump(p, 1400);
    await p.getByText("Send on WhatsApp", { exact: true }).last().click(); await p.waitForTimeout(1500);
    console.log("OPENED", await p.evaluate(() => window.__opened));
    await L.shot(p, "A4-reminder-sent"); await dump(p);
  });
  await browser.close();
}
// A2: staff Sunita, Thursday 4:45 PM: calendar with Saturday booking
{
  const { p, browser } = await L.open("stateA2", { role: "staff", staffId: L.ids.staff["Sunita Devi"] }, "2026-10-29 16:45");
  await step("calendar", async () => {
    await p.getByRole("tab", { name: /^Calendar/ }).click(); await p.waitForTimeout(1500);
    await L.shot(p, "B1-calendar"); await dump(p);
    await p.getByText("31", { exact: true }).first().click(); await p.waitForTimeout(1200);
    await L.shot(p, "B2-calendar-sat31"); await dump(p, 1400);
  });
  await browser.close();
}
L.close();
