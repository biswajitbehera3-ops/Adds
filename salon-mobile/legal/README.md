# Legal and Compliance Pack — Salon App

Templates and audits for every salon build. Fill the [brackets], set `src/config/salon.ts → business / legal / retention`, and have an Indian lawyer review before the first live salon. Most DPDP Rules obligations apply from about **13 May 2027**. The app is built to meet them from day one.

## Checklist: where each item is handled
| # | Item | Status | Where |
|---|---|---|---|
| 1 | Privacy policy | ✅ Done | `privacy-policy.md`; in app: Privacy & terms screen |
| 2 | Terms of service | ✅ Done | `terms-of-service.md` (includes staff app terms) |
| 3 | Refund policy | ✅ Done, and enforced in code | `refund-policy.md`; app computes the refundable wallet amount (`refundableBalance`, `closeWallet`) |
| 4 | Cookie policy | ✅ Done | `cookie-policy.md` (app and pages use no cookies) |
| 5 | Cookie consent banner | ✅ Ready, off (not needed while there are no cookies) | `cookie-banner.html` |
| 6 | Form consents | ✅ Fixed in code | Separate, unticked boxes: keep details (required) and WhatsApp offers (optional); proof stored (time, notice version, staff) |
| 7 | Don't collect unnecessary data | ✅ Audited | `fair-marketing-checklist.md` → Data minimisation; automatic deletion (`purgeExpired`) |
| 8 | Audit third-party SDKs | ✅ Done | `third-party-audit.md`: no trackers, camera only |
| 9 | Remove dark patterns | ✅ Audited, none found | `fair-marketing-checklist.md` |
| 10 | Remove hidden fees | ✅ | Fee table in Terms; itemised bills |
| 11 | Remove fake reviews | ✅ None exist; rule written down | `fair-marketing-checklist.md`, PRODUCT.md |
| 12 | Remove unsupported claims | ✅ Rewrite table for pitch and ads | `fair-marketing-checklist.md` |
| 13 | Accessibility | ✅ Audited; gaps listed | `accessibility-statement.md` |
| 14 | Alt text | ✅ All photos labelled | code |
| 15 | Colour contrast | ✅ All pass AA; Vulcanico board fixed | `scripts/contrast-check.mjs` |
| 16 | Keyboard navigation | ✅ Demos and web preview | code; `accessibility-statement.md` |
| 17 | Business details | ✅ Config fields and in-app screen | `config.business`; Privacy & terms screen |
| 18 | Age consent | ✅ In code | "Under 18" box → parent/guardian consent required, guardian's number used |
| 19 | Unsubscribe | ✅ WhatsApp STOP + one-tap opt-out; no emails sent | Profile → Privacy; templates end with "Reply STOP" |
| 20 | Licence fonts and images | ✅ Fonts and code OK; ⚠ logo/intro need action | `licenses.md`, `third-party-licenses.json` |
| 21 | Data deletion request | ✅ In code, with process | Profile → Privacy → close wallet → delete; `data-deletion-request.md` |
| + | Data Processing Agreement | ✅ | `data-processing-agreement.md` |
| + | Staff data notice | ✅ | `staff-data-notice.md` |
| + | Breach plan | ✅ | `breach-response-plan.md` |
| + | Counter card (English + Hindi) | ✅ | `privacy-notice-counter-card.md` |

## Before each salon goes live
1. Fill `config.business`, `config.legal` (policy URLs) and prices (+GST note).
2. Publish the privacy policy, terms and refund policy as plain web pages (no cookies) and put the links in config.
3. Print the counter card.
4. Sign the Terms + DPA with the salon; give the Staff Data Notice to each staff member.
5. Replace placeholder icons; resolve the logo/intro item in `licenses.md`.
6. Run `npm test` and `node scripts/contrast-check.mjs`.
