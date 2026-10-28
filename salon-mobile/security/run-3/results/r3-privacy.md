# r3-privacy hunter result (summary kept by parent; full JSON was returned in-session)

Units:
- customerDataExport/erase (Feature abuse and data leakage): candidate `salon-mobile:engine.ts:erase:legacy-referral-note-not-scrubbed`
  - erase() rewrites referral notes only at erase time; notes "Referred <name>" written by the pre-fix build for customers already erased are never rewritten (migrate, purgeExpired, prepareRestore all skip them). Shown on the referrer's Profile (Profile.tsx:232) and copied into backups.
  - Local check: agents/r3-privacy/artifacts/check1.txt (6/6 pass: legacy note survives load and restore; fresh delete and live re-erase scrub correctly; purge hold works).
  - Proposed fix: normalise REFERRAL_REWARD notes starting "Referred " to REFERRAL_NOTE in migrate().
  - Proposed severity: low (likelihood low, impact low), confidence high.
- Login/checkSecret (Access control): covered. Owner-menu restore/clear/demo password check holds (Live.tsx:612-620); confirmClock only via OwnerApproval; recovery restore needs the mirror password and keeps it; Setup reachable only with no owner.

Hardening notes:
1. loadStore treats a missing salon:data:v1 as first launch even when salon:owner exists; should route to recovery instead of demo data.
2. voidReason, extras names, day-closing notes are free text erase() leaves in place.
3. No wrong-try limit on OwnerApproval, owner-menu confirm, LoadFailed restore (accepted residual; recovery screen most exposed).
