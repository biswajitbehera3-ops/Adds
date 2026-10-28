# r3-restore hunter result (summary kept by parent)

Candidates:
1. `salon-mobile:checks.ts:backupProblem:unvalidated-ids-and-nested-fields` (proposed LOW): staff id "owner" accepted -> sessionActor returns "owner" for that stylist, late cancel allowed and hidden; visit.extras:"x" accepted -> ownerChecks TypeError breaks owner Live screen. check1.txt.
2. `salon-mobile:checks.ts:backupProblem:future-time-24h-slack` (proposed LOW): times up to now+24h accepted, then every guarded save refused for up to 23 h. check1.txt.
3. `salon-mobile:store.ts:restore-clear-orphan-selfie-files` (proposed LOW): restoreBackup/clearAll/resetToDemo drop attendance records without deleting their selfie files; retention only deletes referenced files. check2.txt.

Covered: R1-1, R1-2/G1 (owner secret never from file, password on every restore), run-2 #7 re-erase, R1-6 photoKey confinement, fix-introduced paths.

Hardening: pickTextFile reads whole file before size cap; exported backup left in cacheDirectory; two un-awaited writes (data, mirror); prepareRestore first-match only; staff id with '/' disables selfie; old staff profile photo file left.
