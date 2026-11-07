// Builds the invented "Your Salon" data for the launch-film screen recordings, using the app's own engine.
import { it, vi } from "vitest";
import fs from "fs";
import { createHash } from "crypto";
import * as E from "/home/user/Adds/salon-mobile/src/domain/engine";
import { emptyData, type Data, type PaymentMethod } from "/home/user/Adds/salon-mobile/src/domain/types";

const OUT = "/tmp/claude-0/-home-user-Adds/bb7d919e-d314-53e1-9de6-9f2761a9821f/scratchpad/film/build";
const secret = (pw: string, salt: string) => ({ salt, hash: createHash("sha256").update(salt + pw).digest("hex") });
const ist = (day: string, hm: string) => new Date(`${day}T${hm}:00+05:30`);
const dow = (day: string) => new Date(`${day}T12:00:00+05:30`).getUTCDay();
const addMin = (hm: string, m: number) => { const t = +hm.slice(0, 2) * 60 + +hm.slice(3) + m; return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`; };

let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const pick = <T,>(xs: readonly T[]) => xs[Math.floor(rand() * xs.length)];

const FIRST = ["Aarav","Rohan","Ananya","Vikram","Sneha","Arjun","Kavya","Karan","Isha","Diya","Aditya","Meera","Siddharth","Pooja","Nikhil","Riya","Varun","Manish","Tanvi","Harsh","Shreya","Amit","Deepak","Sana","Farhan","Gaurav","Simran","Yash","Ritika","Kunal","Nisha","Vivek","Swati","Abhishek","Komal","Tarun","Lakshmi","Suresh","Ayesha","Pranav"];
const LAST = ["Mehta","Gupta","Iyer","Singh","Reddy","Nair","Menon","Malhotra","Joshi","Kapoor","Rao","Pillai","Das","Kulkarni","Bose","Chatterjee","Saxena","Yadav","Desai","Agarwal","Ghosh","Tiwari","Mishra","Qureshi","Ali","Jain","Kaur","Thakur","Bansal","Arora","Pandey","Chauhan","Dubey","Roy","Shah","Sethi"];
const POOL = [...new Set(Array.from({ length: 400 }, (_, i) => `${FIRST[(i * 7) % FIRST.length]} ${LAST[(i * 11 + Math.floor(i / 36)) % LAST.length]}`))].filter((n) => !["Priya Sharma", "Rahul Verma", "Kabir Anand", "Anjali Verma"].includes(n)).slice(0, 180);
const SERVICES: [string[], string[]][] = [
  [["haircut"], []], [["haircut"], ["hair-wash"]], [["haircut", "beard"], []], [["beard"], []], [["haircut"], ["head-massage"]],
  [["facial"], []], [["hair-colour"], []], [["hair-spa"], []], [["haircut", "beard"], ["beard-styling"]], [["beard"], ["cleanup"]],
];
const METHODS: PaymentMethod[] = ["UPI", "UPI", "UPI", "CASH", "CASH", "CARD"];

it("builds the film data", () => {
  vi.useFakeTimers({ toFake: ["Date"] });
  let data: Data = emptyData();
  let now = ist("2026-08-01", "10:00");
  const go = (d: Date) => { now = d; vi.setSystemTime(d); };
  const run = <T,>(op: { data: Data; result: T }) => ((data = op.data), op.result);
  go(now);
  run(E.setOwnerSecret(data, secret("owner1234", "film-owner-salt-01"), now));
  const staffSecret = secret("1234", "film-staff-salt-01");
  const STAFF = [["Imran Khan", "9811100001", "Chair 1"], ["Sunita Devi", "9811100002", "Chair 2"], ["Rakesh Kumar", "9811100003", "Chair 3"], ["Neha Sharma", "9811100004", "Chair 4"]]
    .map(([name, phone, chair]) => run(E.addStaff(data, { name, phone, chair, secret: staffSecret }, now)));
  const [imran, sunita, rakesh, neha] = STAFF;

  const custByName = new Map<string, string>();
  let phoneN = 0;
  const customer = (name: string, marketing = false, phone?: string, extra: object = {}) => {
    if (custByName.has(name)) return custByName.get(name)!;
    const c = run(E.createCustomer(data, { phone: phone ?? String(9700000000 + ++phoneN * 7331), name, consent: true, marketing, takenBy: imran.id, ...extra } as any, now));
    custByName.set(name, c.id);
    return c.id;
  };

  type Ev = { at: Date; fn: () => void };
  const dayEvents = (day: string, plan: Ev[]) => plan.sort((a, b) => a.at.getTime() - b.at.getTime()).forEach((e) => { go(e.at); e.fn(); });
  const bill = (ev: Ev[], day: string, startHm: string, name: string, staffId: string, svc: [string[], string[]], method: PaymentMethod, marketing = false, mins = 35) => {
    let visitId = "";
    ev.push({ at: ist(day, startHm), fn: () => {
      let n = name; while (!n || data.visits.some((v) => v.status === "OPEN" && v.customerId === custByName.get(n))) n = pick(POOL);
      const cid = customer(n, marketing); visitId = run(E.startVisit(data, { customerId: cid, serviceIds: svc[0], addOnIds: svc[1], staffId }, now)).id; } });
    ev.push({ at: ist(day, addMin(startHm, mins)), fn: () => run(E.checkoutVisit(data, { visitId, walletAmount: 0, paymentMethod: method }, now)) });
    return () => visitId;
  };

  // ---- History: 1 Sep to 30 Oct (salon closed on Tuesdays) ----
  const SPECIAL = ["Priya Sharma", "Rahul Verma", "Kabir Anand"];
  for (let d = new Date("2026-09-01T12:00:00+05:30"); d <= new Date("2026-10-30T12:00:00+05:30"); d = new Date(d.getTime() + 86400000)) {
    const day = new Date(d.getTime() + 330 * 60000).toISOString().slice(0, 10);
    if (dow(day) === 2) continue;
    const ev: Ev[] = [];
    for (const s of STAFF) {
      if (rand() < 0.06) continue;
      const m = 9 * 60 + 45 + Math.floor(rand() * (rand() < 0.15 ? 50 : 28));
      ev.push({ at: ist(day, `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`), fn: () => run(E.markAttendance(data, { staffId: s.id, photoKey: null }, now)) });
    }
    const stopAt = day === "2026-10-29" ? "15:15" : "19:30";
    for (const s of STAFF) {
      let t = addMin("10:30", Math.floor(rand() * 40));
      while (t < stopAt) {
        if (rand() < (dow(day) === 6 ? 0.54 : dow(day) === 0 ? 0.48 : 0.42)) {
          bill(ev, day, t, "", s.id, pick(SERVICES), pick(METHODS));
        }
        t = addMin(t, 45 + Math.floor(rand() * 40));
      }
    }
    if (day === "2026-09-26") bill(ev, day, "15:10", "Priya Sharma", sunita.id, [["haircut"], []], "UPI", true);
    if (day === "2026-09-28") bill(ev, day, "13:05", "Rahul Verma", rakesh.id, [["haircut"], []], "CASH", true);
    if (day === "2026-10-14") bill(ev, day, "17:20", "Kabir Anand", imran.id, [["beard"], []], "UPI", true);
    // Bookings for Saturday 31 Oct, made earlier in the week.
    if (day === "2026-10-28") {
      ev.push({ at: ist(day, "18:00"), fn: () => {
        const mId = customer("Meera Pillai"); run(E.bookAppointment(data, { customerId: mId, serviceIds: ["facial"], staffId: neha.id, day: "2026-10-31", time: "11:00", source: "PHONE", by: "owner" }, now));
        const aId = customer("Arjun Nair"); run(E.bookAppointment(data, { customerId: aId, serviceIds: ["haircut", "beard"], staffId: rakesh.id, day: "2026-10-31", time: "14:00", source: "WHATSAPP", by: rakesh.id }, now));
        const kId = customer("Simran Kaur"); run(E.bookAppointment(data, { customerId: kId, serviceIds: ["hair-spa"], staffId: sunita.id, day: "2026-10-31", time: "18:00", source: "COUNTER", by: sunita.id }, now));
      } });
    }
    dayEvents(day, ev);
    // ---- State A: Thursday 29 Oct, 4:10 PM. Priya is due back. ----
    if (day === "2026-10-29") {
      go(ist(day, "16:10"));
      snap("stateA", data);
      go(ist(day, "16:14"));
      run(E.logReminder(data, { customerId: custByName.get("Priya Sharma")!, serviceId: "haircut", message: E.overdueReminders(data, now).find((r) => r.name === "Priya Sharma")!.message, status: "SENT", by: null }, now));
      go(ist(day, "16:40"));
      run(E.bookAppointment(data, { customerId: custByName.get("Priya Sharma")!, serviceIds: ["haircut"], staffId: sunita.id, day: "2026-10-31", time: "16:30", source: "WHATSAPP", by: "owner" }, now));
      snap("stateA2", data);
    }
  }
  void SPECIAL;

  // ---- Saturday 31 Oct ----
  const day = "2026-10-31";
  const ev: Ev[] = [];
  ev.push({ at: ist(day, "09:52"), fn: () => run(E.markAttendance(data, { staffId: imran.id, photoKey: null }, now)) });
  ev.push({ at: ist(day, "09:58"), fn: () => run(E.markAttendance(data, { staffId: sunita.id, photoKey: null }, now)) });
  ev.push({ at: ist(day, "10:06"), fn: () => run(E.markAttendance(data, { staffId: rakesh.id, photoKey: null }, now)) });
  ev.push({ at: ist(day, "10:24"), fn: () => run(E.markAttendance(data, { staffId: neha.id, photoKey: null }, now)) });
  bill(ev, day, "10:35", "Rohan Gupta", imran.id, [["haircut", "beard"], []], "UPI");
  bill(ev, day, "10:40", "Ananya Iyer", sunita.id, [["hair-colour"], []], "UPI", false, 90);
  bill(ev, day, "10:50", "Vikram Singh", rakesh.id, [["beard"], []], "CASH");
  bill(ev, day, "11:30", "Aditya Rao", imran.id, [["haircut"], ["head-massage"]], "CASH");
  // Rakesh bills a haircut, then undoes it: it was only a beard trim.
  const wrong = bill(ev, day, "11:35", "Karan Malhotra", rakesh.id, [["haircut"], []], "CASH", false, 25);
  ev.push({ at: ist(day, "12:01"), fn: () => run(E.voidVisit(data, { visitId: wrong(), by: "staff", reason: "Wrong service", staffId: rakesh.id }, now)) });
  ev.push({ at: ist(day, "12:03"), fn: () => {
    const v = run(E.startVisit(data, { customerId: custByName.get("Karan Malhotra")!, serviceIds: ["beard"], addOnIds: [], staffId: rakesh.id }, now));
    go(ist(day, "12:20")); run(E.checkoutVisit(data, { visitId: v.id, walletAmount: 0, paymentMethod: "CASH" }, now));
  } });
  ev.push({ at: ist(day, "11:00"), fn: () => {
    const a = E.appointmentsOn(data, day).find((x) => x.customerName === "Meera Pillai")!;
    const r = run(E.appointmentArrived(data, { id: a.id, staffId: neha.id }, now));
    go(ist(day, "11:50")); run(E.checkoutVisit(data, { visitId: r.visit.id, walletAmount: 0, paymentMethod: "UPI" }, now));
  } });
  bill(ev, day, "12:40", "Sneha Reddy", sunita.id, [["haircut"], ["hair-wash"]], "UPI");
  bill(ev, day, "12:45", "Gaurav Jain", imran.id, [["haircut", "beard"], ["beard-styling"]], "CARD");
  bill(ev, day, "13:15", "Nikhil Bose", neha.id, [["haircut"], []], "CASH");
  ev.push({ at: ist(day, "13:20"), fn: () => run(E.requestLeave(data, { staffId: rakesh.id, from: "2026-11-06", to: "2026-11-06", type: "CASUAL", note: "Sister's wedding" }, now)) });
  ev.push({ at: ist(day, "14:00"), fn: () => {
    const a = E.appointmentsOn(data, day).find((x) => x.customerName === "Arjun Nair")!;
    const r = run(E.appointmentArrived(data, { id: a.id, staffId: rakesh.id }, now));
    go(ist(day, "14:40")); run(E.checkoutVisit(data, { visitId: r.visit.id, walletAmount: 0, paymentMethod: "UPI" }, now));
  } });
  // A walk-in who left before being served.
  ev.push({ at: ist(day, "14:20"), fn: () => {
    const yId = customer("Sameer Khan"); const v = run(E.startVisit(data, { customerId: yId, serviceIds: ["haircut"], addOnIds: [], staffId: neha.id }, now));
    go(ist(day, "14:38")); run(E.cancelOpenVisit(data, v.id, neha.id, now));
  } });
  bill(ev, day, "14:50", "Pooja Kulkarni", sunita.id, [["facial"], []], "UPI", false, 45);
  bill(ev, day, "15:00", "Harsh Agarwal", imran.id, [["haircut"], []], "CASH");
  bill(ev, day, "15:20", "Tanvi Desai", neha.id, [["hair-spa"], []], "UPI", false, 60);
  dayEvents(day, ev);

  // 4:30 PM: Priya arrives for her booking with Sunita.
  go(ist(day, "16:30"));
  const pa = E.appointmentsOn(data, day).find((x) => x.customerName === "Priya Sharma")!;
  run(E.appointmentArrived(data, { id: pa.id, staffId: sunita.id }, now));
  // 4:34 PM: a walk-in in Rakesh's chair (billed on camera later).
  go(ist(day, "16:34"));
  const kuId = customer("Kunal Arora"); run(E.startVisit(data, { customerId: kuId, serviceIds: ["haircut", "beard"], addOnIds: [], staffId: rakesh.id }, now));
  // 4:36 PM: Priya's friend Anjali joins with Priya's code, in Imran's chair.
  go(ist(day, "16:36"));
  const priya = data.customers.find((c) => c.name === "Priya Sharma")!;
  const anjali = run(E.createCustomer(data, { phone: "9876543211", name: "Anjali Verma", consent: true, marketing: true, referredBy: priya.referralCode, referralVerified: true, takenBy: imran.id }, now));
  go(ist(day, "16:38"));
  run(E.startVisit(data, { customerId: anjali.id, serviceIds: ["haircut"], addOnIds: ["hair-wash"], staffId: imran.id }, now));
  go(ist(day, "16:41"));
  const faId = customer("Farhan Ali"); run(E.startVisit(data, { customerId: faId, serviceIds: ["beard"], addOnIds: ["cleanup"], staffId: neha.id }, now));
  go(ist(day, "16:45"));
  snap("stateB", data);

  fs.writeFileSync(`${OUT}/ids.json`, JSON.stringify({
    staff: Object.fromEntries(STAFF.map((s) => [s.name, s.id])),
    priya: priya.id, priyaCode: priya.referralCode, anjali: anjali.id,
  }, null, 1));
  vi.useRealTimers();

  function snap(name: string, d: Data) {
    const t = now.toISOString();
    const out = { ...d, clock: { lastSeen: t, anchor: t, confirmedAt: new Date(now.getTime() - 3600000).toISOString(), backJumps: [], hold: null } };
    fs.writeFileSync(`${OUT}/${name}.json`, JSON.stringify(out));
  }
});
