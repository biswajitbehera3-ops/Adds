# Motion spec (approved)

Chosen by the owner of this project from the skill motion library
(`design-studies/skill-motions.html`). Sources: ui-ux-pro-max presets (#n) and the
design-motion-principles cookbook (Rn). Rule behind every choice: the more often staff see a
motion, the smaller and faster it is.

| App moment | Motion | Source spec |
|---|---|---|
| Every button | **R6 Press squeeze** | scale 0.97 on press, 100ms in / 160ms out; never from 0 |
| Opening a screen from a card (hub tile → screen, customer → profile) | **#12 Shared-element morph** | ~0.6s, ease expo.inOut |
| Any other page change | **#10 Fade page change** | fade out 0.2s, fade in 0.2s, power1.inOut |
| App opens (once a day) | **#9 Letter-by-letter headline** | per char: opacity 0, y 20, rotateX −40 → in; 0.6s, stagger 0.015, expo.out |
| Home tiles on launch (once per launch) | **#8 Grid pop-in** | opacity 0, scale 0.92, y 16 → in; 0.4s, stagger 0.06, back.out(1.4) |
| Customer and reminder lists (first open only, never while searching) | **#7 Quick list stagger** | opacity 0, y 8 → in; 0.3s, stagger 0.03 |
| Customer found at Counter, toasts, results | **R1 Materialize in** | opacity 0, y 8, blur 4px → clear; spring 0.45s, no bounce |
| Toasts leaving | **R2 Subtle exit** | opacity 0, y 4, blur 2px; 0.2s |
| Copy referral code, reminder sent | **R3 Icon swap** | outgoing opacity 0 / scale 0.25 / blur 4px; incoming reverse, 0.25s |
| Visits/Wallet tabs, Today/7d/30d | **R5 Clip-path tabs** | active pill via clip-path inset, 0.25s ease-out |
| Top-up sheet | **R8 Swipe-to-dismiss sheet** | dismiss if dragged > threshold or velocity > 0.11; else spring back |
| Receipt after a visit | **R4 Clip-path reveal** | inset(0 0 100% 0) → inset(0); ~0.5s |
| Backup progress | **08 Barber-pole progress** | red/cream/blue stripe fill; moves only while a backup runs |

Optional, only if the need appears: **R7 Popover from its button** (dropdown menus),
**#15 Skeleton shimmer** (if data ever loads from a server).

## Never animated
- Counter keypad: instant tint on touch, nothing else.
- Anything typed or triggered from a keyboard.

## Rejected (and why)
#1–3 hover (no hover on phones) · #4–5 scroll fade-ins (hide content in a working app) ·
#6 pinned scroll (marketing pattern) · #13–14 parallax (motion sickness, no value) ·
#11 curtain wipe (~1s, too slow for all-day use) · #16 bouncing dots (app rarely waits) ·
#17 carousel (distracts staff) · R9 stagger wave (duplicates #8).

## Accessibility
With the phone's Reduce Motion on, every transition becomes a short crossfade or an instant
change, and the launch animation is skipped.
