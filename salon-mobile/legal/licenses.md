# Licences for Fonts, Images, Video and Code

## Fonts
| Font | Where | Licence | OK to ship? |
|---|---|---|---|
| Rozha One, Hind | Current app (bundled via @expo-google-fonts) | SIL Open Font License 1.1 | Yes |
| Urbanist | Login prototype and screen designs | SIL OFL 1.1 | Yes |
| Bebas Neue, Space Grotesk | Vulcanico/Noturno design | SIL OFL 1.1 | Yes |
| Inter, DM Sans, Fraunces, Playfair Display, Cormorant Garamond, Unbounded, Nunito, Orbitron, JetBrains Mono, Archivo Black, Instrument Serif | Style-direction boards only | SIL OFL 1.1 | Yes, if chosen |

OFL lets you bundle fonts in an app for free. You may not sell the font files on their own. Keep the licence text with the app (the Credits section in Privacy & terms names it).

## Images, icons, video
| Asset | Source | Status |
|---|---|---|
| Scissors, brush, comb and all UI icons | Drawn as SVG for this project | Ours; no licence issue |
| `assets/icon.png`, `android-icon-*`, `splash-icon.png`, `favicon.png` | Expo starter placeholders | **Replace** with the salon's logo before release |
| `assets/brand/logo-clean.png`, `intro-clean.mp4` | Supplied by the salon. The originals carry an AI-generator "sparkle" mark, which was cropped out | **Action needed** (see below) |

**Action on the logo and intro:**
1. Get the salon's written confirmation that they own them and allow use in the app (clause 6 of the Terms does this).
2. The originals show an AI image/video generator's mark. Check that tool's terms. Some do not allow removing their visible mark, or require a paid plan for commercial use. The safe options are to regenerate the assets on a plan that permits commercial use without the mark, or to keep the mark. Until then, treat the cropped versions as **demo only**.
3. Don't use real people's photos, celebrity likeness or stock photos without a licence. The designs use none.

## Code
509 production packages: MIT 423, ISC 26, Apache-2.0 12, BSD 19, BlueOak 5, others permissive.
- The "unknown" entries are Expo packages under MIT, and `fdir` under MIT.
- `node-forge` is dual-licensed; we use it under BSD-3-Clause.
- MPL-2.0 `lightningcss` is a build tool only and is not shipped in the app.
Full list: `third-party-licenses.json`.
No GPL-only code ships in the app.

Regenerate the list before each release (from `salon-mobile/`): `npm ls --omit=dev --all --json`, then read each package's `license` field.
