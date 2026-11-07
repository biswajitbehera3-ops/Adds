# Security check: salon app (run 3)

## 1. What was checked and how

- **Target:** `salon-mobile/` in biswajitbehera3-ops/Adds, at commit `1fe98d0`. This is the app after the 27 Oct fixes for every run-1 and run-2 finding.
- **Why:** the project rule in `CLAUDE.md` says the check is re-run on changed code. Run 3 re-checks every area that had a fixed finding, plus the code the fixes added.
- **Method:** Cloudflare `security-audit` skill, full audit mode, **quick profile, scoped run**:
  - 11 planned areas, checked by 4 hunters (clock; load and restore; money and bookings; privacy and login);
  - 2 independent verifiers for the 7 leads;
  - 3 rounds of fix checks on the fixes (commits `4203567`, `430da0c`, `3bcbf09`).
- **Execution:** sandboxed, source-and-local only, the same sandbox and file-promotion step as runs 1 and 2. No network, read-only disk except scratch, resource limits. Dummy data only.
- **Out of scope:** 7 areas with no finding in runs 1–2 and no changed code. They are left for the next full run.

## 2. Security posture in one paragraph

The run-1 and run-2 fixes mostly held:
- no backup can change the owner password;
- every restore needs the owner password;
- a failed load never falls back to demo data;
- deleted customers stay deleted after a normal restore;
- photo names can't leave the selfie folder;
- the undo, wallet-close, cash-count and WhatsApp-code fixes all held.

The weak point was **the clock fix**. It judged "is the clock right?" using values the clock itself had just written, so a stylist could still trigger the automatic clean-up and erase records (high). One record saved with a forward date also locked the salon out (medium).

The fixes for those took three rounds. Each round of fix checking found a new gap in the last fix, including one round that would have locked out the owner after a month's closure. The final design:
- clean-up runs only within 30 days of the owner confirming the date with the owner password;
- retention is counted from that confirmed date;
- the owner can always clear any clock problem with one tap and the owner password.

Every remaining clock risk needs server time (live sync) and is on the go-live checklist in `SECURITY-LESSONS.md`.

## 3. Confirmed findings (all fixed 28 Oct)

| Severity | Finding | What the sandbox showed |
|---|---|---|
| High | Clock-jump hold bypassed. One save with the clock ahead then a restart, or app starts each under 30 days apart, and clean-up erases customers, selfies and bookings for good | +1102 days, one check-in, restart: hold never set, today's selfie deleted, a customer served today erased. A restore can't bring her back |
| Medium | One record saved with the clock far ahead blocks every bill, top-up, check-in, void and cash count at the real date | Check-in at +10 years, clock put right, date confirmed: startVisit, topUp, closeDay and the owner's void all refused. The backup was refused too |
| Low | A stylist can cancel a booking after its time with no owner trace, by setting the clock back while the app sits idle | Cancel at "12:25" for a 12:30 booking, done at 13:10: no item in the owner's checks, no clock note |
| Low | A restored backup can name a stylist `owner` (their cancels and undos are hidden) or carry a malformed bill that crashes the owner's checks | Late cancel accepted as "owner"; ownerChecks threw TypeError |
| Low | A backup with times up to 24 hours ahead blocks saving after a restore | Reminder at +23 h accepted; topUp refused for 23 hours |
| Low | Restore, Clear all data and Load demo leave selfie files on the phone for good | A dropped selfie was never deleted over 400 simulated days |

**Rejected (1):** old referral notes that named a friend erased before the fix. The mechanism is real, but no real data can hold one: the old build never ran with real salon data. Notes like this are now rewritten when data loads anyway.

**Found by the fix checks, also fixed:**
- **Round 1:**
  - the owner's own date confirmation was refused after 30 days (high);
  - the trusted time could be walked forward through app returns (medium);
  - backup note limits were stricter than the app's own (low).
- **Round 2:**
  - after a closure of over 3 days, the trusted time froze, so a clock set back could undo a bill again (medium);
  - clean-up counted retention from an unconfirmed clock up to 30 days ahead (low).
- **Round 3:** the recovery-screen restore confirmed a date it didn't show (low).

## 4. What was checked and held

- **Owner password:**
  - restore, clear all, load demo and date confirmation each ask for it;
  - the recovery restore uses the phone's own saved copy and never the file's.
- **Loading:**
  - a read error shows the recovery screen and saves nothing;
  - lost data with a saved owner password also goes to recovery.
- **Money:**
  - **undo:** within 0–2 minutes only;
  - **wallet close:** bonus is never paid out as cash, even after a void that follows a close;
  - **cash count:** wallet refunds are subtracted, and counts from the last 7 days are recomputed;
  - **checkout:** rules unchanged and holding;
  - **WhatsApp code:** 3 wrong tries.
- **Privacy:**
  - erasure removes every copy and stays done after a normal restore;
  - the export goes only to the customer's own number.
- **Login and sessions:** Setup only appears with no owner, and every restore signs everyone out.

## 5. Needs validation

None new. The run-1 phone-only items are still open and are on the go-live checklist: does WhatsApp show the stylist the code, and how do photo files behave on a real phone?

## 6. Hardening notes and what stays open

All are listed, with what closes each, in **"Before the first real salon goes live"** in `salon-mobile/SECURITY-LESSONS.md` (locked by the user on 28 Oct):

- **Clock tricks that only server time closes:**
  - blocking bills until the owner confirms;
  - the first booking of the day cancelled with no trace;
  - pre-marked attendance;
  - an undo inside the 2-minute window after the clock is changed.
- **Monthly date confirmation:** if the owner never confirms, old records are kept past retention.
- **Accepted risks carried over:**
  - no owner checks in the engine;
  - no login lockout;
  - weak password hashing;
  - sessions never expire;
  - the exported backup is left in the phone's cache;
  - the file size is checked only after reading;
  - quotes in links in the legal-page script.
- **Back-jump log:** it keeps the last 20 entries (low).

## 7. Coverage

| Units | Count |
|---|---|
| Candidate (leads found and verified) | 5 |
| Covered (no finding) | 6 |
| Out of scope (no change, no prior finding) | 7 |
| **Total** | **18** |

- **Leads:** 7 verified. 6 confirmed (1 high, 1 medium, 4 low) and 1 rejected. 6 more found by the fix checks, all fixed.
- **Validators:** `validate-findings.cjs` (6 valid) and `validate-coverage-ledger.cjs` (18 units valid) both pass.
- **Tests:** 113 pass, including a test for every finding. The web build starts cleanly.
