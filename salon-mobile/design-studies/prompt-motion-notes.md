# Prompt Motion research notes (saved for later)

Source: https://prompt-motion.com (gallery of motion videos made with Claude, with the prompts and skills behind them).
Read on 14 Oct 2026: the two "characters" skills, all 22 "phone" entries, 8 "charts" entries and the showreel template.
Status: **candidates only** — nothing here is approved or built. Approved motions live in `../MOTION.md`.

## Skills from the link the user sent
- **product-film** (@anthonyriera): learns the product's design system, interviews you, renders a launch video in Remotion with your real components, logo and music.
  `/plugin marketplace add Rieranthony/product-film-skill` then `/plugin install product-film@product-film-skill` — https://github.com/Rieranthony/product-film-skill
- **session-story** (@jake11moran, HyperFrames): turns a Claude Code session history into a short animated film. Not useful for the salon app.
  `npx skills add heygen-com/hyperframes-community-skills --skill session-story`

## Techniques worth using inside the app (Reanimated)
| # | Technique | Source page | Where it fits | Key rules quoted |
|---|---|---|---|---|
| P1 | One shape morphs through states (button → spinner → ✓) | twoclipping-5cba86 | "Collect ₹600" → "Paid ✓"; login button | "content swaps with a short blur", "a tiny overshoot at most" |
| P2 | Stretchy tab pill: leading edge on a stiffer spring | twoclipping-5cba86 | Owner Today/7 days/30 days, Cash/UPI/Card (upgrade of R5) | "two edges ride different springs" |
| P3 | Chart draws itself, numbers settle a beat later | twoclipping-5cba86, daniel-haida-8691d4 | Earnings rings, 7-day bars, attendance month grid | "settle slightly later", "subtle stagger" |
| P4 | Morphing status pill | twoclipping-221cab | Excel export (Building → 64% → Saved ✓), alongside the barber pole | "Ordered ✓ → Printing % → On its way → Delivered ✓" |
| P5 | Flood-and-contract | twoclipping-221cab | Gold circle floods then contracts into the PAID stamp | "overscale past the corners and take about 0.3s" |
| P6 | Precise numbers, staggered stops | daniel-haida-8691d4 | All money figures (we keep Urbanist with tabular figures, not a mono font) | "Elements should not all start and stop at exactly the same frame", ease `cubic-bezier(0.16,1,0.3,1)` |
| P7 | Physics tilt + gold particles badge | bthreeagency-b9b8d9 | Only if the owner approves the top-stylist bonus (F5) | "tilts … following the rules of physics", "should not be bouncy" |

Rules shared by these prompts that match our taste: no bouncy easing, no glows, no particle bursts (one rare moment at most), no crossfades.
Gotcha: text swapping inside a morphing container needs its own enter/exit timing or it overlaps.

## For a sales/promo video of the app (to show salon owners)
1. **daniel-haida-8691d4** (Remotion): dark + gold finance-app film, 15 s storyboard, CHAOS → CONTROL → CLARITY, real UI rebuilt in React, first product moment at ~2 s. Best match.
2. **twoclipping-6dd14e** (HTML + Playwright): stats-led promo, 10 bars at 120 BPM, big stats on push cuts.
3. **product-film skill** above, or the `/templates/showreel` prompt (soundtrack written in Web Audio, no licensing).
These render with code, so they cost no Higgsfield credits.
