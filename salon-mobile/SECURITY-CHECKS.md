# Security checks

The `security-audit` skill runs after every build of the app, before it is shown to an owner or sent as an APK (project rule in `CLAUDE.md`). Each run's report, checked records, coverage plan and sandbox scripts are kept in `security/run-N/`. The next run reads them to know what was already covered.

| Run | Date | Build checked | Profile | Confirmed | Needs a phone to confirm | Not yet covered | Fixed |
|---|---|---|---|---|---|---|---|
| 1 | 26 Oct 2026 | commit 05910c6 (the current app, before the build-later list) | quick (partial pass) | 4 (3 medium, 1 low) | 2 | 5 areas | none yet: on the build list (BUILD-SPEC 11.0 k) |

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
