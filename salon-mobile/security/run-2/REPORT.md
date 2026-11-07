# Security check: salon app (run 2)

## 1. What was checked and how

- **Target:** `salon-mobile/` in biswajitbehera3-ops/Adds. The app source is unchanged since run 1 (it was last changed in commit `0729859`, run at repo commit `ca474f5`).
- **Method:** Cloudflare `security-audit` skill, full audit mode, **quick profile, scoped run**. In scope are only the five areas run 1 left as not yet checked:
  - (A) stylist check-in and leave;
  - (B) bookings: arrival, no-show and cancel;
  - (C) customer data export, deletion, retention purge and consent;
  - (D) the owner's end-of-day cash count;
  - (E) the legal-page build script.

  The other 12 areas were checked in run 1 at the same source and are recorded here as out of scope. **This is a partial pass.**
- **Budget:** 24 agent runs set, 16 used (4 mapping, 5 hunters, 1 coverage reviewer, 6 verifiers).
- **Execution:** sandboxed source-and-local only, with the same sandbox and file-promotion step as run 1:
  - no network;
  - the disk read-only except one scratch folder per agent;
  - an empty environment with an allowlist;
  - CPU, memory, process, file-size and time limits.

  Only dummy data was used. The legal script ran on a copy inside the sandbox, never on the real folder.
- **Prior run:** the run-1 ledger and findings were read. Run-1 findings stand as recorded and were not re-verified here (same source). Every run-2 lead was checked against them; none repeats a run-1 root cause.
- **Deferred:** one more area, found by the coverage reviewer and not checked: restoring an older backup after a customer was deleted brings that customer back.

## 2. Security posture in one paragraph

All six problems in these areas come from one pattern: **the app trusts the phone's clock and does not record who closed or changed something.** A stylist with the shared phone can do three things:
- move the clock forward to pre-mark tomorrow's attendance;
- move it forward a year and restart to wipe selfies, bookings and old customers;
- ring up a cash bill after the owner's count, or backdate one into a day already counted, so the drawer check never sees it.

They can also close a late booking as no-show without a name on it. Deleting a customer leaves their name in the referring friend's wallet history. None of this works from outside the phone, and none of it exposes data to anyone outside the salon.

## 3. Confirmed findings

| Severity | Finding | Area | What the sandbox showed |
|---|---|---|---|
| Medium | Moving the phone clock forward and reopening the app permanently deletes recent selfies, upcoming bookings and active customers | Retention purge (C) | +366 days: today's selfie and tomorrow's booking deleted. +1,100 days: a customer who paid today erased |
| Medium | A stylist can mark tomorrow as present and on time the evening before by moving the clock forward | Attendance (A) | Tomorrow 09:00 accepted. Next day: "Present 09:00, selfie saved, not late", and the stylist is never asked to check in |
| Low | Cash bills rung up after the owner's count, or backdated into a counted day, are never checked against the drawer | Cash count (D) | Count 300 = 300, then a ₹300 cash bill: no "Cash short" item, today or on the backdated day |
| Low | A stylist can mark a late booking no-show or cancelled to clear the owner's "booking not closed" alert, with no name recorded | Bookings (B) | The alert disappeared after no-show or cancel; the booking stores no who or when |
| Low | The check-in clock guard ignores bookings, leave decisions and other non-bill records | Attendance (A) | After an owner booking at 10:20, a check-in with the clock set to 09:58 was accepted as on time. With a bill at 10:20 it was refused |
| Low | Deleting a customer leaves their full name in the referring friend's wallet history | Deletion (C) | After deletion, the referrer's history still reads "Referred <name>". Same after automatic erase |

### 3.1 Clock forward wipes records (medium)

- **Where:**
  - `src/domain/store.ts:38-42`: the purge runs on every app start with the phone's time, then deletes the selfie files and saves.
  - `src/domain/engine.ts:935-975` (`purgeExpired`): every cutoff comes from that time, with no check against the newest saved record.
- **Who:** anyone with the unlocked salon phone who can change its date. No login is needed.
- **Reproduction (sandbox):** run the purge with the clock at real time, +366 days and +1,100 days.
- **Result:**
  - real time: nothing deleted;
  - +366 days: today's selfie and tomorrow's booking deleted;
  - +1,100 days: also the customer who paid today, logged as auto-erased with a date three years ahead.

  Setting the clock back restores nothing.
- **Fix:**
  - skip the purge when the clock is more than about 30 days past the newest saved record, and show the owner a "check the phone date" prompt;
  - because a forward-dated record can be saved first, also ask the owner to confirm before a purge removes customers or bookings, or keep a saved "last trusted purge" mark.

### 3.2 Pre-marking tomorrow's attendance (medium)

- **Where:**
  - `src/domain/engine.ts:1336-1339` (`markAttendance`): only a clock set *back* is refused, and the date and time both come from the phone.
  - `App.tsx:119`: the next day the stylist is treated as already checked in.
  - The export (`engine.ts:1401`) shows "Present 09:00".
- **Who:** a signed-in stylist with the shared phone in the evening.
- **Result:** the record for tomorrow 09:00 is accepted. Other stylists' real check-ins the next morning still pass. A real check-in later says "already marked". Only the selfie, taken the evening before, gives it away.
- **Fix:** a check against the phone's own clock can't work, because it reads the same moved clock. Instead:
  - number every save in order;
  - when a saved record is dated after records saved later, flag it to the owner and don't count it as a check-in;
  - long term, use server time once phones sync.

### 3.3 to 3.6 (low)

- **Cash count** (`src/domain/checks.ts:112-121, 162-166`): the count keeps the expected figure as it was at count time. Compare against a fresh total for recent days, and refuse checkout when the clock is behind the latest saved record.
- **Booking closure** (`src/domain/engine.ts:1073-1084`, `checks.ts:142`):
  - record who closed a booking and when;
  - don't let staff cancel after the booking time;
  - list staff no-shows and late cancels in the owner's checks.
- **Clock guard coverage** (`src/domain/engine.ts:61-72`): include bookings, leave, reminders, cash counts and the privacy log in "newest saved record".
- **Name left after deletion** (`src/domain/engine.ts:569, 900-911`): write "Referred a friend" instead of the name, and clean up existing notes when a customer is deleted.

Full traces and fixes are in `FINDINGS-DETAIL.md` (medium findings) and `findings.json` (all).

## 4. What was checked and held

- **Leave:**
  - a stylist can only withdraw their own waiting request;
  - leave approval is reachable from owner screens only;
  - approve or decline can't be repeated.
- **Bookings:**
  - consent, closed days, hours, past times, double bookings and stylists on leave are all checked;
  - "Arrived" can't run twice and only opens a visit for an active stylist.
- **Customer data export:** it shows only what the profile already shows and goes to the customer's own number. Deleted customers are refused.
- **Consent:** marketing consent and reminders respect opt-out and deletion.
- **Cash count:** mixed wallet-and-cash bills are counted correctly. Top-ups paid in cash are matched consistently.
- **Legal script:**
  - all its inputs come from whoever builds the pages;
  - names and text are escaped;
  - the output folder name can't escape its folder.

## 5. Needs validation

None in this run. Every lead was confirmed. The two run-1 leads that need a real phone (the WhatsApp code and the photo file name) are still open.

## 6. Hardening notes (not findings)

- **Check-in time:** it is taken when the selfie is shot, not when it is confirmed. Use the confirm time.
- **Leave in the past:** the "leave can't start in the past" rule uses the phone clock, and approval doesn't re-check it. Show the owner a "past dates" warning.
- **Owner-only functions:** approve and decline leave, delete customer and close wallet have no owner check in the core code, only in the screens. This is the same pattern run 1 noted.
- **Arrival:**
  - "Arrived" has no same-day check in the core code;
  - TodayBookings gives an "anyone free" booking to the first stylist when nobody is signed in;
  - "reminded" can be stamped on a closed booking.
- **Cash count:**
  - cash refunds from closing a wallet aren't subtracted, which shows a false "short";
  - there's no opening float;
  - a re-count overwrites the earlier one with no history.
- **Data export:**
  - it isn't logged with who sent it;
  - it leaves out bookings, reminders and referral links;
  - free-text void reasons and cash notes aren't cleaned when a customer is deleted.
- **Legal script:** quotes aren't escaped inside links. A quote in a configured link breaks the page's HTML (reproduced), but only whoever builds the pages controls that. Escape quotes, check that the privacy and terms links start with `https://`, and serve the pages with a strict content policy.

## 7. Coverage

| Units | Count |
|---|---|
| Covered (no finding) | 1 (legal script) |
| Candidate (leads found and verified) | 4 |
| Deferred (coverage reviewer, quick profile) | 1 (backup restore bringing back deleted customers) |
| Out of scope (checked in run 1, same source) | 12 |
| **Total** | **18** |

- **Leads:** 6 verified, all confirmed (2 medium, 4 low), 0 rejected.
- **Validators:** `validate-findings.cjs` (6 valid) and `validate-coverage-ledger.cjs` (18 units valid) both pass.
- **Across runs 1 and 2:** every area the first check planned has now been checked once. Left open:
  - the backup-restore-after-deletion area;
  - the two run-1 leads that need a real phone.
- **Next run (after fixes are built):** re-check the 10 confirmed findings from both runs, plus the deferred area.
