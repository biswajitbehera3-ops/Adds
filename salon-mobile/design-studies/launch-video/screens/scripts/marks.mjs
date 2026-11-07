import * as L from "./lib.mjs";
import fs from "fs";
const M = {};
const box = async (p, key, loc) => { try { const b = await loc.boundingBox({ timeout: 4000 }); M[key] = b && [b.x * 3, b.y * 3, b.width * 3, b.height * 3].map(Math.round); } catch (e) { console.log("MISS", key); } };
const vis = (p, t) => p.locator(`text="${t}" >> visible=true`).last();
const tab = (p, t) => p.getByRole("tab", { name: new RegExp("^" + t) }).click().then(() => p.waitForTimeout(1300));
{ const { p, browser } = await L.open("stateA", { role: "owner" }, "2026-10-29 16:10");
  await tab(p, "Customers"); await box(p, "A1.card", p.getByLabel(/reminders to do\. Open/));
  await p.getByLabel(/reminders to do\. Open/).click(); await p.waitForTimeout(1500);
  await box(p, "A2.priyaRow", p.getByLabel(/^Priya Sharma, Haircut/)); await box(p, "A2.priyaName", vis(p, "Priya Sharma"));
  await p.getByLabel(/^Priya Sharma, Haircut/).click(); await p.waitForTimeout(1200);
  await box(p, "A3.send", vis(p, "Send on WhatsApp")); await box(p, "A3.msg", p.getByLabel("Reminder message"));
  await browser.close(); }
{ const { p, browser } = await L.open("stateA2", { role: "staff", staffId: L.ids.staff["Sunita Devi"] }, "2026-10-29 16:45");
  await tab(p, "Calendar"); await p.getByText("31", { exact: true }).first().click(); await p.waitForTimeout(1200);
  await box(p, "B2.priya", vis(p, "Priya Sharma")); await browser.close(); }
{ const { p, browser } = await L.open("stateB", { role: "owner" }, "2026-10-31 16:45");
  await box(p, "C1.anjali", vis(p, "Anjali Verma")); await box(p, "C1.priya", vis(p, "Priya Sharma"));
  await p.mouse.wheel(0, 900); await p.waitForTimeout(900);
  await box(p, "C2.undo", vis(p, "Rakesh undid a ₹300 bill")); await box(p, "C2.left", p.locator('text=/left without service/ >> visible=true').last());
  await p.mouse.wheel(0, -2000); await p.waitForTimeout(600);
  await tab(p, "Earnings"); for (const n of ["Sunita", "Neha", "Imran", "Rakesh"]) await box(p, "D1." + n, p.locator(`text=/^${n} · / >> visible=true`).last());
  await box(p, "D1.today", p.locator('text="₹7,200" >> visible=true').last());
  await tab(p, "Staff"); await box(p, "E1.late", p.locator('text=/Late 10:24/ >> visible=true').last());
  await p.getByLabel(/Leave requests, 1 waiting/).click(); await p.waitForTimeout(1300);
  await box(p, "E2.approve", vis(p, "Approve")); await box(p, "E2.note", p.locator("text=/Sister/ >> visible=true").last());
  await browser.close(); }
{ const { p, browser } = await L.open("stateC", { role: "owner" }, "2026-10-31 17:00");
  await tab(p, "Customers"); await p.locator('input[placeholder="Search name or mobile"] >> visible=true').fill("Priya"); await p.waitForTimeout(1200);
  await vis(p, "Priya Sharma").click(); await p.waitForTimeout(1500); await vis(p, "Refer").click(); await p.waitForTimeout(1500);
  await box(p, "G4.code", p.locator("text=/^PRI/ >> visible=true").last()); await box(p, "G4.paid", p.locator("text=/paid$/ >> visible=true").last());
  await browser.close(); }
L.close();
fs.writeFileSync(`${L.S}/marks.json`, JSON.stringify(M, null, 1)); console.log(JSON.stringify(M));
