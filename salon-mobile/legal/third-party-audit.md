# Third-Party SDK, Permission and Data-Flow Audit

**Audited:** 15 Oct 2026, against `package.json`, `app.json` and the source code.

## SDKs in the app
| Package | What it does | Network / data sent | Verdict |
|---|---|---|---|
| expo, react, react-native (+ web, reanimated, gesture-handler, safe-area, svg, worklets) | App framework, UI, animation | None | OK |
| @react-native-async-storage/async-storage | Saves data on the phone | None (local only) | OK |
| expo-crypto | Password hashing, ids | None | OK |
| expo-image-picker | Front camera for the attendance selfie | None; the photo stays in the app's private folder | OK: camera only; photos-library and microphone permissions turned off |
| expo-file-system, expo-sharing | Save selfies; share the Excel export | Only when the owner taps Share | OK |
| expo-clipboard | Copy referral code | None | OK |
| expo-haptics, expo-blur, expo-linear-gradient, expo-status-bar, expo-font | Feel and visuals | None | OK |
| @expo-google-fonts/* | Fonts bundled in the app | None (no Google Fonts calls at runtime) | OK |
| fflate | Builds the Excel file on the phone | None | OK |

**Not present (deliberately):** analytics, advertising, crash reporting, Firebase/Google Analytics, Facebook SDK, push-notification trackers, session recording, fingerprinting, location.

## Data that leaves the phone
| Flow | When | To whom |
|---|---|---|
| WhatsApp message (`wa.me` link) | Staff tap Send; WhatsApp opens with the text ready, and staff press send | Meta (WhatsApp), only that message |
| Excel attendance export | Owner taps Export / Share | Wherever the owner shares it |
| Cloud sync (planned) | Continuously, once built | [Cloud provider], India region, under the DPA (sub-processor) |

## Android permissions
| Permission | Why | Asked when |
|---|---|---|
| Camera | Attendance selfie | The first time a staff member takes a selfie |
| Internet | Cloud sync (planned), opening WhatsApp links | Normal permission, no prompt |
None other: no contacts, location, microphone, storage or phone-state.

## Re-run before every release
1. `npm ls --omit=dev` and compare with this list. Any new package needs a row here.
2. Search the source for `fetch(` / `http`: today the only URLs are `wa.me` and the policy links.
3. Check `app.json` plugins and permissions.
4. Regenerate `third-party-licenses.json` (see `licenses.md`).
