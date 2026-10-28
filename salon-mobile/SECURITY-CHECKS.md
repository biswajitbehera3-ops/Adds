# Security checks

The `security-audit` skill runs after every build of the app, before it is shown to an owner or sent as an APK (project rule in `CLAUDE.md`). Each run's report, checked records, coverage plan and sandbox scripts are kept in `security/run-N/`. The next run reads them to know what was already covered.

| Run | Date | Build checked | Profile | Confirmed | Needs a phone to confirm | Not yet covered | Fixed |
|---|---|---|---|---|---|---|---|
| 1 | 26 Oct 2026 | commit 05910c6 (the current app, before the build-later list) | quick (partial pass) | 4 (3 medium, 1 low) | 2 | 5 areas | all 4 fixed 27 Oct (`SECURITY-LESSONS.md`); the 2 phone-only leads partly fixed |
| 2 | 27 Oct 2026 | same app source as run 1 (scoped to the 5 areas run 1 left) | quick, scoped (partial pass) | 6 (2 medium, 4 low) | 0 new | 1 area | all 6 fixed 27 Oct, and the deferred area (restore brings back deleted customers) fixed too (`SECURITY-LESSONS.md`) |
| 3 | 27–28 Oct 2026 | commit 1fe98d0 (the fixed app), then each fix commit | quick, scoped to the 11 fixed areas + new code | 6 (1 high, 1 medium, 4 low); 1 rejected | 0 new | 7 areas (no change, no prior finding) | all 6 fixed 28 Oct, plus 6 more gaps the fix checks found in the fixes (`SECURITY-LESSONS.md` run 3) |

## Run 1 in plain words

Full report: `security/run-1/REPORT.md`.

**Confirmed:**
1. **Medium.** If the app ever fails to read its saved data when it starts, it replaces the salon's real data with demo data. The owner password then becomes `owner1234`, which is shown on the login screen.
2. **Medium.** Restoring a backup trusts the file completely. A fake "backup" can set the owner's password, wallet money and prices, and switch off the WhatsApp-code check. No password is asked before restoring.
3. **Medium.** A stylist can undo a paid bill after the 2-minute limit by setting the phone's clock back, and the undo then doesn't show in the owner's checks for that day.
4. **Low.** Closing a customer's wallet can refund bonus money as cash after the wallet was spent down and topped up again.

**Needs a real phone to decide:**
- whether WhatsApp shows the customer's code to the stylist before it is sent;
- whether a crafted photo name in a restored backup can delete other files in the app's storage.

**Not covered yet** (next run): stylist check-in and leave, bookings and arrivals, customer data export and deletion, the end-of-day cash count, and the legal-page build script.

**Held up:** stylists can't reach owner-only actions, logins check passwords properly, money amounts are range-checked, links can't be redirected, the web version keeps each viewer's data separate, and there are no secrets in the code.

## Run 2 in plain words

Full report: `security/run-2/REPORT.md`. Run 2 checked the five areas run 1 left: check-in and leave, bookings, customer deletion and data export, the cash count, and the legal-page script.

**Confirmed:**
1. **Medium.** Setting the phone clock a year or more ahead and reopening the app permanently deletes recent selfies, upcoming bookings and even customers served today.
2. **Medium.** A stylist can mark tomorrow's attendance as present and on time the evening before by moving the clock forward. The next day the app never asks them to check in.
3. **Low.** Cash bills rung up after the owner's count, or backdated into a day already counted, are never checked against the drawer.
4. **Low.** A stylist can mark a late booking as no-show or cancelled to clear the owner's "booking not closed" alert, and no name is recorded.
5. **Low.** The check-in clock check ignores bookings and leave decisions, so a clock set back still passes after the owner's morning work.
6. **Low.** Deleting a customer leaves their full name in the referring friend's wallet history.

**Held up:** leave can only be withdrawn by its owner and approved from owner screens; bookings check consent, hours and clashes; the data export goes only to the customer's own number; the legal script is safe from anyone but the person who builds it.

**Still open:**
- restoring an older backup can bring back deleted customers (not yet checked);
- the two run-1 leads that need a real phone.

## Run 3 in plain words

Full report: `security/run-3/REPORT.md`. Run 3 re-checked every area that had a fix, and the new code the fixes added.

**Confirmed (all fixed 28 Oct):**
1. **High.** The fix that paused automatic clean-up when the phone's date jumped ahead could be dodged. A stylist saves once with the date moved ahead and restarts the app, or reopens the app with the date moved under 30 days each time. Clean-up then erases customers, selfies and bookings for good.
2. **Medium.** One record saved with the date years ahead stopped all billing and check-ins at the real date, and confirming the date didn't help.
3. **Low.** A stylist could cancel a booking after its time with no trace, by setting the clock back while the app sat idle.
4. **Low.** A made-up backup could name a stylist "owner", hiding their actions, or crash the owner's checks.
5. **Low.** A backup with dates up to a day ahead blocked saving after a restore.
6. **Low.** Restore, Clear all data and Load demo left selfie photos on the phone for good.

**Rejected:** old referral notes naming a deleted friend. No real data can hold one.

**The fixes were checked three more times.** Each check found a gap in the last fix, including one that would have locked the owner out after a month's closure, and each gap was fixed. In the final design:
- automatic clean-up runs only within 30 days of the owner confirming the date with the owner password;
- the owner can clear any clock problem with one tap;
- nothing is deleted early.

**Held up:** the owner password protects every restore and wipe, a failed load never shows demo data, deleted customers stay deleted, and the money and cash-count fixes all held.

**Still open, to fix before a real salon goes live:** the checklist in `SECURITY-LESSONS.md`. Most items need live sync with server time.

