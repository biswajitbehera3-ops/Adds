// A day at the salon: 1 owner, 4 stylists, 20 customers, on the real app (one phone).
import * as h from "./harness.mjs";
import fs from "fs";
const D = "/tmp/claude-0/-home-user-Adds/bb7d919e-d314-53e1-9de6-9f2761a9821f/scratchpad/salon-day";
const STOP = process.env.STOP || "end";
const H = await h.start({ html: `${D}/app.html`, out: `${D}/run`, startIST: "2026-10-31 09:15" });
const { p } = H;
const OWNER_PW = "sasmita2026";
export const STAFF = [
  { key: "Bikash", name: "Bikash Nayak", mobile: "9861000001", pw: "bikash11", chair: "Chair 1", trait: "fast, good with phones" },
  { key: "Lipsa", name: "Lipsa Mohanty", mobile: "9861000002", pw: "lipsa22", chair: "Chair 2", trait: "types slowly" },
  { key: "Manas", name: "Manas Sahoo", mobile: "9861000003", pw: "manas33", chair: "Chair 3", trait: "skips entering customers when it's busy" },
  { key: "Rashmita", name: "Rashmita Das", mobile: "9861000004", pw: "rashmi44", chair: "Chair 4", trait: "new joiner, makes mistakes" },
];
const S = Object.fromEntries(STAFF.map((s) => [s.key, s]));
const stop = (name) => { if (STOP === name) { console.log("STOP at", name); return true; } return false; };
const tab = async (label) => {
  // inner screens (keypad, bill, receipt) hide the tab bar; a person taps "‹ Home" first
  for (let i = 0; i < 3 && (await p.getByText(/^‹ Home/).last().isVisible().catch(() => false)); i++)
    await h.tap(H, p.getByText(/^‹ Home/).last(), { wait: 700 }).catch(() => {});
  await h.tap(H, p.getByRole("tab", { name: new RegExp("^" + label) }));
};

// ---------- sessions on the one phone ----------
async function ownerIn(why) {
  await h.task(H, "owner", "", `owner signs in (${why})`, async (t) => {
    await h.reload(H);
    if (await h.has(H, "Owner? Sign in here", 2000)) await h.tap(H, "Owner? Sign in here");
    await h.type(H, p.getByLabel("Owner password"), OWNER_PW);
    await h.tap(H, p.getByText(/^Log in/).last(), { wait: 2500 });
    h.read(H);
  });
}
async function signOut(who) {
  await h.task(H, who, "", `${who} logs out`, async () => {
    if (who === "owner") {
      if (!(await p.getByLabel("Owner menu").isVisible().catch(() => false))) await h.reload(H); // back to the owner's home
      await h.tap(H, p.getByLabel("Owner menu"));
      await h.tap(H, p.getByText(/^Sign out/).last(), { wait: 800 });
      await h.tap(H, p.getByText(/^Sign out/).last(), { wait: 1800 }); // confirm sheet
    } else {
      for (let i = 0; i < 3 && (await h.has(H, "‹ Home", 600)); i++) await h.tap(H, p.getByText(/^‹ Home/).last(), { wait: 700 }).catch(() => {});
      await tab("Profile");
      await h.tap(H, p.getByText("Log out", { exact: true }).last());
      if (await h.has(H, "Log out", 1000)) await h.tap(H, p.getByText(/^Log out/).last(), { wait: 1500 }).catch(() => {});
    }
    if (!(await h.has(H, "Welcome", 2500)) && !(await h.has(H, "good to see you", 500))) throw new Error("did not reach the login screen");
  });
}

// ---------- 09:15 setup ----------
await h.at(H, "09:15");
await h.task(H, "owner", "", "first launch: sign in with demo owner password", async () => {
  await h.tap(H, "Owner? Sign in here");
  await h.type(H, p.getByLabel("Owner password"), "owner1234");
  await h.tap(H, p.getByText(/^Log in/).last(), { wait: 3000 });
  await h.shot(H, "owner-first-launch-demo-data");
});
await h.task(H, "owner", "", "clear the demo data and set own password", async () => {
  await h.tap(H, p.getByLabel("Owner menu"));
  await h.shot(H, "owner-menu");
  await h.tap(H, "Clear all data");
  await h.shot(H, "clear-confirm");
  await h.tap(H, "Delete all", { wait: 1800 });
  await h.type(H, p.getByLabel("Owner password"), OWNER_PW);
  await h.type(H, p.getByLabel("Type it again"), OWNER_PW);
  await h.tap(H, p.getByText(/^Save and continue/).last(), { wait: 2500 });
  await h.shot(H, "owner-empty-salon");
});
for (const s of STAFF) {
  await h.task(H, "owner", "", `add stylist ${s.name} (${s.chair})`, async () => {
    await tab("Staff");
    await h.tap(H, p.getByLabel("Add a stylist"), { wait: 900 });
    if (s.key === "Bikash") await h.shot(H, "add-stylist-form");
    await h.type(H, p.getByLabel("Name"), s.name);
    await h.type(H, p.getByLabel("Mobile (their login)"), s.mobile);
    await h.type(H, p.getByLabel("First password (they can change it)"), s.pw);
    const chair = p.getByLabel("Chair", { exact: true }).last();
    if (await chair.count()) {
      const v = await chair.inputValue().catch(() => "");
      if (v !== s.chair) await h.type(H, chair, s.chair);
      if (v !== s.chair) h.note(H, `Add-stylist form pre-filled chair "${v}" for ${s.name}; owner changed it to ${s.chair}`);
    }
    await h.tap(H, p.getByText("Add stylist", { exact: true }).last(), { wait: 1500 });
    h.read(H);
  });
}
await h.shot(H, "owner-staff-after-adding");
await tab("Live").catch((e) => h.note(H, "no Live tab: " + e.message.split("\n")[0])); await h.shot(H, "owner-live-4-stylists", { full: true });
if (stop("setup")) { await h.finish(H); process.exit(0); }
await signOut("owner");

// ---------- staff helpers ----------
const SELFIE = "/home/user/Adds/salon-mobile/assets/brand/logo-clean.png";
let who = null; // who is signed in on the phone right now
async function staffIn(key, { firstOfDay = false } = {}) {
  const s = S[key];
  await h.task(H, key, "", firstOfDay ? "log in + selfie check-in" : "log in", async () => {
    await h.reload(H);
    if (!(await h.has(H, "Welcome", 2500))) throw new Error("not on the login screen");
    if (await h.has(H, "Staff? Sign in with your number", 500)) await h.tap(H, "Staff? Sign in with your number");
    await h.type(H, p.getByLabel("Mobile number"), s.mobile);
    await h.type(H, p.getByLabel("Password"), s.pw);
    await h.tap(H, p.getByText(/^Log in/).last(), { wait: 2500 });
    h.read(H);
    if (await h.has(H, "Take selfie", 2000)) {
      if (!firstOfDay) h.note(H, `${key}: selfie asked again on a later login the same day`);
      const fc = p.waitForEvent("filechooser");
      await h.tap(H, "Take selfie");
      await (await fc).setFiles(SELFIE);
      if (H.cur) H.cur.taps++;
      await p.waitForTimeout(1200);
      await h.tap(H, p.getByText(/^Confirm attendance/).last(), { wait: 2500 });
    } else if (firstOfDay) h.note(H, `${key}: no selfie asked on the first login of the day`);
    if (firstOfDay) await h.shot(H, `${key}-home-after-checkin`);
  });
  who = key;
}
async function staffOut() { if (who && who !== "owner") await signOut(who); who = null; }
async function as(key, fn) { // make sure `key` is the one signed in on the phone
  if (who !== key) { if (who) await (who === "owner" ? signOut("owner") : staffOut()); if (key === "owner") { await ownerIn("at the salon"); who = "owner"; } else await staffIn(key); }
  await fn();
}

if (STOP === "setup2") { await h.finish(H); process.exit(0); }

// ---------- 09:45-10:25 check-ins ----------
await h.at(H, "09:45"); await staffIn("Bikash", { firstOfDay: true }); await staffOut();
await h.at(H, "09:52"); await staffIn("Lipsa", { firstOfDay: true }); await staffOut();
await h.at(H, "09:58"); await staffIn("Manas", { firstOfDay: true }); await staffOut();
if (stop("checkin")) { await h.finish(H); process.exit(0); }


// ---------- customer helpers ----------
const PRICE = { "Haircut": 300, "Beard trim": 150, "Hair colour": 1200, "Facial": 900, "Hair spa": 1000 };
const C = {}; // ground truth per customer
const firstShot = new Set();
async function shotOnce(tag) { if (!firstShot.has(tag)) { firstShot.add(tag); await h.shot(H, tag, { full: true }); } }
async function openCounter(phone) {
  await h.tap(H, p.getByLabel("Customer walked in: enter their mobile number").first(), { wait: 800 });
  await h.keypad(H, phone);
}
async function addNew(name, { referral } = {}) {
  await h.type(H, p.getByLabel("Name"), name);
  if (referral) {
    await h.type(H, p.getByLabel("Sent by a friend? Their code or mobile"), referral);
    await p.waitForTimeout(500);
  }
  await h.tap(H, p.getByText(/^Agrees we keep their details/).last());
  if (referral) {
    await shotOnce("referral-needs-code");
    await h.tap(H, p.getByText(/Send code on WhatsApp/).last(), { wait: 800 });
    const urls = await h.grabWhatsApp(H, who, name, "referral code");
    const code = decodeURIComponent(urls.join(" ")).match(/\b(\d{4})\b/)?.[1];
    if (!code) throw new Error("no 4-digit code found in the WhatsApp message");
    h.read(H); // customer reads the code out
    await h.type(H, p.getByLabel("Code from the customer's WhatsApp"), code);
  }
  await h.tap(H, p.getByText("Add customer", { exact: true }).last(), { wait: 1200 });
}
async function pickAndStart(services, stylistKey) {
  for (const sv of services) await h.tap(H, p.getByText(sv, { exact: true }).last(), { wait: 300 });
  if (stylistKey && stylistKey !== who) await h.tap(H, p.getByText(stylistKey, { exact: true }).last(), { wait: 300 });
  await h.tap(H, p.getByText(/^Start visit/).last(), { wait: 1500 });
}
async function openBill() {
  await h.reload(H);
  await h.tap(H, p.getByText(/^Pay ₹/).last(), { wait: 1200 });
  h.read(H);
}
async function useWalletIfAsked() {
  const t = await h.text(H);
  if (/Pay from wallet/.test(t)) {
    // the app switches the wallet on by itself when the balance covers the bill; only tap if it is off
    if (!/from wallet/.test(t.replace(/Pay from wallet/g, ""))) await h.tap(H, p.getByText(/Pay from wallet/).last(), { wait: 600 });
  }
  if (await h.has(H, "Send code on WhatsApp", 1200)) {
    await shotOnce("wallet-needs-code");
    await h.tap(H, p.getByText(/Send code on WhatsApp/).last(), { wait: 800 });
    const urls = await h.grabWhatsApp(H, who, "", "wallet code");
    const code = decodeURIComponent(urls.join(" ")).match(/\b(\d{4})\b/)?.[1];
    h.read(H);
    await h.type(H, p.getByLabel("Code from the customer's WhatsApp"), code || "0000");
  }
}
async function collect(method, { double = false, thankYou = true } = {}) {
  if (method && method !== "Wallet") await h.tap(H, p.getByText(method, { exact: true }).last(), { wait: 300 });
  await shotOnce("bill-before-collect");
  const btn = p.getByRole("button", { name: /^Collect/ }).last();
  if (double) { await btn.dblclick(); if (H.cur) H.cur.taps += 2; await p.waitForTimeout(1500); }
  else await h.tap(H, btn, { wait: 1800 });
  await shotOnce("receipt");
  if (thankYou && (await h.has(H, "Send thank-you on WhatsApp", 1500))) {
    await h.tap(H, p.getByText("Send thank-you on WhatsApp").last(), { wait: 600 });
    await h.grabWhatsApp(H, who, "", "thank-you receipt");
  }
}
async function nextCustomer() { if (await h.has(H, "Next customer", 1000)) await h.tap(H, p.getByText("Next customer").last(), { wait: 800 }); }

// walk-in from the door to "in the chair"
async function walkIn(key, id, name, phone, services, { referral } = {}) {
  C[id] = { id, name, phone, stylist: key, services, amount: services.reduce((a, s) => a + PRICE[s], 0), recorded: false };
  await as(key, async () => {});
  await h.task(H, key, id, `walk-in ${name}: ${services.join(" + ")}${referral ? " (referred)" : ""}`, async () => {
    await openCounter(phone);
    if (await h.has(H, "New customer", 1200)) await addNew(name, { referral });
    await pickAndStart(services);
    if (!(await h.has(H, "in the chair", 2000)) && !(await h.has(H, "since", 500))) throw new Error("visit did not start");
  });
}
async function pay(key, id, method, opts = {}) {
  await as(key, async () => {});
  await h.task(H, key, id, `collect ₹${C[id].amount} by ${method}${opts.double ? " (double tap)" : ""}`, async () => {
    await openBill();
    if (opts.wallet) await useWalletIfAsked();
    await collect(method, opts);
    if (!opts.stay) await nextCustomer();
    C[id].recorded = true; C[id].method = method;
  });
}


// ---------- other actions ----------
async function book(key, id, name, phone, service, time, note) {
  C[id] = { id, name, phone, stylist: key, services: [service], amount: PRICE[service], recorded: false, booking: time };
  await as(key, async () => {});
  await h.task(H, key, id, `book ${name}: ${service} at ${time} (${note})`, async () => {
    await tab("Calendar");
    await h.tap(H, p.getByLabel("Book an appointment"), { wait: 1000 });
    await shotOnce("book-sheet");
    await h.type(H, p.getByLabel("Customer's mobile number"), phone);
    await p.waitForTimeout(500);
    if (await p.getByLabel("Customer's name").count()) await h.type(H, p.getByLabel("Customer's name"), name);
    const consent = p.getByText(/^Customer agrees we keep their name/).last();
    if (await consent.count()) await h.tap(H, consent);
    await h.tap(H, p.getByText(service, { exact: true }).last(), { wait: 400 });
    if (await p.getByText(key, { exact: true }).count()) await h.tap(H, p.getByText(key, { exact: true }).last(), { wait: 400 });
    await h.tap(H, p.getByLabel(time, { exact: true }).first(), { wait: 400 });
    await shotOnce("book-sheet-filled");
    await h.tap(H, p.getByText(/^Book/).last(), { wait: 1500 });
    await h.grabWhatsApp(H, key, id, "booking confirmation");
  });
}
async function bookingArrived(key, id, services) {
  await as(key, async () => {});
  await h.task(H, key, id, `booked customer arrives`, async () => {
    await tab("Calendar");
    if (await h.has(H, "Open today's timeline", 1200)) await h.tap(H, p.getByText(/^Open today's timeline/).last(), { wait: 1000 });
    await h.tap(H, p.getByRole("button", { name: new RegExp(", " + C[id].name + ",") }).last(), { wait: 1000 });
    await h.tap(H, p.getByText(/^Arrived/).last(), { wait: 1500 });
    if (await h.has(H, "Start visit", 1200)) await pickAndStart([]);
    await p.waitForTimeout(1500);
    const d = await h.storage(H);
    const ap = (d?.appointments || []).find((x) => x.status === "ARRIVED" && d.customers.find((c) => c.id === x.customerId)?.name === C[id].name);
    if (!ap) throw new Error("visit did not start from the booking");
    await h.shot(H, `${id}-visit-from-booking`);
  });
}
async function noShow(key, id) {
  await as(key, async () => {});
  await h.task(H, key, id, `mark booked customer a no-show`, async () => {
    await tab("Calendar");
    if (await h.has(H, "Open today's timeline", 1200)) await h.tap(H, p.getByText(/^Open today's timeline/).last(), { wait: 1000 });
    await h.tap(H, p.getByRole("button", { name: new RegExp(", " + C[id].name + ",") }).last(), { wait: 1000 });
    await h.tap(H, p.getByText("No-show", { exact: true }).last(), { wait: 1200 });
  });
}
async function ownerLook(tag) {
  await h.task(H, "owner", "", `owner looks at the salon (${tag})`, async () => {
    await h.reload(H);
    await tab("Live"); await h.shot(H, `owner-${tag}-live`, { full: true }); h.read(H, 2);
    await tab("Earnings"); await h.shot(H, `owner-${tag}-earnings`, { full: true }); h.read(H);
    await tab("Staff"); await h.shot(H, `owner-${tag}-staff`, { full: true }); h.read(H);
    await tab("Customers"); await h.shot(H, `owner-${tag}-customers`, { full: true }); h.read(H);
    await tab("Live");
  });
}

// ================= THE DAY =================
await h.at(H, "10:05"); await walkIn("Bikash", "C01", "Amit Panda", "9937100001", ["Haircut"]);
await h.at(H, "10:15"); await walkIn("Lipsa", "C02", "Sneha Rath", "9937100002", ["Facial"]);
await h.at(H, "10:20"); await book("Bikash", "C03", "Dev Mohanty", "9937100003", "Hair colour", "11:00 AM", "called the salon");
await h.at(H, "10:25"); await staffOut(); await staffIn("Rashmita", { firstOfDay: true });
truth(H, { kind: "attendance", note: "Rashmita arrived 25 minutes late (shift 10:00)" });
await h.shot(H, "rashmita-home");
await staffOut();
await h.at(H, "10:35"); await pay("Bikash", "C01", "Cash");
// C04: a customer who won't give a mobile number
await h.at(H, "10:40");
C.C04 = { id: "C04", name: "Ritu Patnaik", phone: null, stylist: "Rashmita", services: ["Haircut"], amount: 300, recorded: false };
await as("Rashmita", async () => {});
await h.task(H, "Rashmita", "C04", "walk-in who won't give a mobile number", async (t) => {
  await h.tap(H, p.getByLabel("Customer walked in: enter their mobile number").first(), { wait: 800 });
  await h.shot(H, "no-number-counter");
  const tx = await h.text(H);
  if (!/without (a )?(mobile|number)|no number|Skip/i.test(tx)) {
    h.note(H, "No way to bill a customer without a mobile number; Rashmita tries 0000000000");
    await h.keypad(H, "0000000000");
    await h.shot(H, "no-number-zeros");
    if (await h.has(H, "New customer", 1200)) {
      await addNew("Ritu Patnaik");
      if (await h.has(H, "Haircut", 1200)) { await pickAndStart(["Haircut"]); C.C04.fakeNumber = true; }
    } else throw new Error("app refused 0000000000 and offers no other way: the visit is not recorded");
  }
});
if (C.C04.fakeNumber) { await h.at(H, "11:10"); await pay("Rashmita", "C04", "Cash"); }
else h.truth(H, { customer: "C04", note: "Ritu paid ₹300 cash for a haircut that is not in the app (no mobile number)", cashIntoDrawerUnrecorded: 300 });

await h.at(H, "11:00"); await pay("Lipsa", "C02", "UPI");
await h.at(H, "11:00"); await bookingArrived("Bikash", "C03", ["Hair colour"]);
await h.at(H, "11:05"); await walkIn("Manas", "C05", "Ankit Mishra", "9937100005", ["Haircut", "Beard trim"]);
// C06: wants a wallet top-up; only the owner can top up
await h.at(H, "11:30");
await as("Lipsa", async () => {});
await h.task(H, "Lipsa", "C06", "Pooja Jena asks to put ₹2,000 in her wallet", async () => {
  C.C06 = { id: "C06", name: "Pooja Jena", phone: "9937100006", stylist: "Lipsa", services: [], amount: 0, recorded: true, note: "top-up only" };
  await openCounter("9937100006");
  if (await h.has(H, "New customer", 1200)) await addNew("Pooja Jena");
  await h.shot(H, "staff-sees-new-customer-no-topup");
  const canTop = await p.getByLabel("Top up wallet").count();
  h.note(H, canTop ? "Top-up button visible to a stylist" : "Stylist has no top-up button: Pooja is told to come back when the owner is in");
  await h.tap(H, p.getByLabel("Start over").first()).catch(() => {});
});
await h.at(H, "11:40"); await pay("Manas", "C05", "Cash");
await h.at(H, "11:45"); await book("Bikash", "C07", "Kiran Behera", "9937100007", "Haircut", "12:30 PM", "booked on a phone call");
// C08: new joiner bills the wrong service, undoes it with a reason, bills again
await h.at(H, "12:00"); await walkIn("Rashmita", "C08", "Suresh Swain", "9937100008", ["Beard trim"]);
await h.at(H, "12:25"); await pay("Rashmita", "C08", "Cash", { thankYou: false, stay: true });
await h.task(H, "Rashmita", "C08", "notices the wrong service on the receipt: undo the bill (2-minute window)", async () => {
  await h.tap(H, p.getByText(/^Undo this visit/).last(), { wait: 800 });
  await h.shot(H, "undo-sheet");
  await h.tap(H, p.getByText("Wrong service", { exact: true }).last());
  await h.tap(H, p.getByText(/^Undo the bill/).last(), { wait: 1200 });
  await h.shot(H, "after-undo");
});
h.note(H, "Undo exists only on the receipt for 2 minutes. Once the stylist leaves the receipt, the customer profile says 'Wrong bill? Ask the owner': only the owner can fix it later.");
C.C08.services = ["Haircut"]; C.C08.amount = 300; C.C08.undone = "Beard trim ₹150";
await h.task(H, "Rashmita", "C08", "bill again with the right service", async () => {
  await h.reload(H);
  await openCounter("9937100008");
  await pickAndStart(["Haircut"]);
});
await h.at(H, "12:30"); await pay("Rashmita", "C08", "Cash");
await h.at(H, "12:35"); await walkIn("Lipsa", "C09", "Neha Sahu", "9937100009", ["Haircut"], { referral: "9937100001" });
await h.at(H, "12:40"); await pay("Bikash", "C03", "Cash");
await h.at(H, "13:00"); await noShow("Bikash", "C07"); C.C07.noShow = true;
await h.at(H, "13:05"); await pay("Lipsa", "C09", "UPI");

// 13:10 owner comes in
await h.at(H, "13:10"); await as("owner", async () => {}); await ownerLook("1310");
await h.task(H, "owner", "C06", "owner tops up Pooja's wallet ₹2,000 (she came back)", async () => {
  await tab("Customers");
  await h.tap(H, p.getByText("Pooja Jena").first(), { wait: 1000 });
  await h.tap(H, p.getByLabel("Top up wallet").first(), { wait: 800 });
  await h.shot(H, "topup-sheet");
  const chip = p.getByText(/₹2,000/).first();
  if (await chip.count()) await h.tap(H, chip); else await h.type(H, p.getByLabel("Other amount in rupees"), "2000");
  await h.tap(H, p.getByText("Cash", { exact: true }).last(), { wait: 300 }); // sheet opens on UPI; Pooja hands over cash
  await h.shot(H, "topup-sheet-filled");
  await h.tap(H, p.getByText(/^Add ₹/).last(), { wait: 1200 });
  await h.shot(H, "topup-done");
  await h.grabWhatsApp(H, "owner", "C06", "top-up receipt");
});
h.truth(H, { customer: "C06", note: "Pooja paid ₹2,000 cash into her wallet; owner put the cash in the drawer", cashIntoDrawer: 2000 });

await h.at(H, "13:30"); await walkIn("Bikash", "C10", "Pooja Jena", "9937100006", ["Hair spa"]);
// C11: service not in the list, owner not here
await h.at(H, "14:00"); await walkIn("Lipsa", "C11", "Rahul Dash", "9937100011", ["Hair colour"]);
await h.at(H, "14:45"); await pay("Bikash", "C10", "Wallet", { wallet: true });
await h.at(H, "15:30");
await as("Lipsa", async () => {});
await h.task(H, "Lipsa", "C11", "add 'Keratin touch-up ₹800' (not in the list); owner is not here", async () => {
  await openBill();
  await h.tap(H, p.getByText(/^Not in the list/).last(), { wait: 600 });
  await h.type(H, p.getByLabel("Service name"), "Keratin touch-up");
  await h.type(H, p.getByLabel("Price in rupees"), "800");
  await h.tap(H, p.getByText(/^Add to the bill/).last(), { wait: 900 });
  await h.shot(H, "other-service-waiting-owner", { full: true });
  const blocked = await h.has(H, "Waiting for owner's approval", 1500);
  h.note(H, `With the owner away, Collect is ${blocked ? "blocked ('Waiting for owner's approval'); approval only on this phone with the owner present ('Owner approves here')" : "still possible"}`);
});
await h.task(H, "Lipsa", "C11", "customer can't wait: remove the extra, collect hair colour only; ₹800 taken in cash off the books", async () => {
  await h.reload(H); await openBill();
  const rm = p.getByLabel(/Remove/).first();
  if (await rm.count()) await h.tap(H, rm); else h.note(H, "No visible way to remove the pending extra service from the bill");
  await collect("UPI"); await nextCustomer();
  C.C11.recorded = true; C.C11.method = "UPI";
});
h.truth(H, { customer: "C11", note: "Rahul paid ₹1,200 by UPI (recorded) + ₹800 cash for keratin (not in the app); Lipsa put the ₹800 in the drawer", cashIntoDrawerUnrecorded: 800 });

// C12 leaves without a service
await h.at(H, "15:35"); await walkIn("Manas", "C12", "Priya Nanda", "9937100012", ["Haircut"]);
await h.at(H, "15:50");
await h.task(H, "Manas", "C12", "customer leaves without a service", async () => {
  await openBill();
  await h.tap(H, p.getByText(/^Customer left without a service/).last(), { wait: 600 });
  await h.tap(H, p.getByText(/^They left/).last(), { wait: 1200 });
});
C.C12.left = true;
await h.at(H, "15:55"); await walkIn("Manas", "C13", "Soumya Kar", "9937100013", ["Haircut"]);
await h.at(H, "16:00"); await walkIn("Rashmita", "C14", "Anjali Pati", "9937100014", ["Facial"]);
await h.at(H, "16:30"); await pay("Manas", "C13", "Cash");
await h.at(H, "16:50"); await pay("Rashmita", "C14", "Card");

// 17:00-18:30 rush
await h.at(H, "17:05"); await walkIn("Bikash", "C15", "Rohit Sethi", "9937100015", ["Haircut", "Beard trim"]);
C.C16 = { id: "C16", name: "Vivek Rout", phone: "9937100016", stylist: "Manas", services: ["Haircut"], amount: 300, recorded: false, skipped: "not entered; ₹300 cash kept by Manas" };
h.truth(H, { customer: "C16", note: "Manas cut Vivek's hair in the rush and never entered him; kept the ₹300 cash", cashPocketed: 300 });
await h.at(H, "17:20"); await walkIn("Lipsa", "C17", "Mamata Swain", "9937100017", ["Hair colour"]);
await h.at(H, "17:30"); await walkIn("Rashmita", "C18", "Tapan Jena", "9937100018", ["Haircut"]);
await h.at(H, "17:35"); await h.shot(H, "rush-staff-view");
await h.at(H, "17:40"); await pay("Bikash", "C15", "Cash", { double: true });
C.C19 = { id: "C19", name: "Sanjay Pradhan", phone: "9937100019", stylist: "Manas", services: ["Beard trim"], amount: 150, recorded: false, skipped: "not entered; ₹150 cash put in the drawer" };
h.truth(H, { customer: "C19", note: "Manas trimmed Sanjay's beard, forgot to enter him, put ₹150 cash in the drawer", cashIntoDrawerUnrecorded: 150 });
await h.at(H, "18:00"); await pay("Rashmita", "C18", "UPI");
h.truth(H, { customer: "C18", note: "Tapan paid ₹300 in CASH; Rashmita tapped UPI by mistake", cashIntoDrawerUnrecorded: 300, recordedAs: "UPI" });
await h.at(H, "18:05"); await walkIn("Bikash", "C20", "Arjun Behera", "9937100020", ["Haircut"]);
await h.at(H, "18:40"); await pay("Bikash", "C20", "Cash");
await h.at(H, "18:50"); await pay("Lipsa", "C17", "UPI");
await h.at(H, "18:55");
for (const k of ["Bikash", "Lipsa", "Manas", "Rashmita"]) {
  await as(k, async () => {});
  await h.task(H, k, "", `${k} checks own earnings at the end of the day`, async () => { await h.reload(H); await h.shot(H, `${k}-end-of-day-home`, { full: true }); h.read(H); });
}

// 19:45 owner closes
await h.at(H, "19:45"); await as("owner", async () => {}); await ownerLook("1945");
await h.task(H, "owner", "", "owner opens Today's checks and counts the cash", async () => {
  await h.reload(H);
  const t = await h.text(H);
  const exp = Number((t.match(/Cash in the drawer should be ₹([\d,]+)/) || [])[1]?.replace(/,/g, "") || NaN);
  // drawer = what the app expects + the extra cash that went in unrecorded
  const extra = H.truth.reduce((a, r) => a + (r.cashIntoDrawerUnrecorded || 0), 0);
  const counted = (isNaN(exp) ? 0 : exp) + extra;
  h.note(H, `App expects ₹${exp} in the drawer; the drawer really holds ₹${counted} (₹${extra} came in without a bill)`);
  await h.tap(H, p.getByText(/^Count the cash/).last(), { wait: 800 });
  await h.type(H, p.getByLabel("Cash counted in rupees"), String(counted));
  if (await p.getByLabel("Note").count()) await h.type(H, p.getByLabel("Note").last(), "More cash than bills: will ask the staff");
  await h.shot(H, "cash-count-sheet", { full: true });
  await h.tap(H, p.getByText(/^Save the count/).last(), { wait: 1200 });
  await h.shot(H, "owner-checks-after-count", { full: true });
});
await h.task(H, "owner", "", "owner backs up the day's data", async () => {
  await h.tap(H, p.getByLabel("Owner menu"));
  const dl = p.waitForEvent("download", { timeout: 4000 }).catch(() => null);
  await h.tap(H, p.getByText(/^Back up data/).last(), { wait: 1500 });
  const d = await dl;
  h.note(H, d ? `Backup file offered: ${d.suggestedFilename()}` : "No backup file appeared on the web preview");
  await h.shot(H, "backup");
});
const data = await h.storage(H);
fs.writeFileSync(`${D}/run/app-data-end-of-day.json`, JSON.stringify(data, null, 1));
fs.writeFileSync(`${D}/run/customers-truth.json`, JSON.stringify(C, null, 1));
await h.finish(H);
function truth(H, row) { h.truth(H, row); }
