# Accessibility Statement and Audit

**Target:** WCAG 2.2 level AA for the app and its web pages.

## Checked and passing
| Area | Status | How |
|---|---|---|
| Colour contrast | Pass: every text pair at least 4.5:1, UI parts at least 3:1 | `node scripts/contrast-check.mjs` (fails the run if any pair drops below) |
| Vulcanico / Noturno palette | Pass at 5.29:1. Faded tints removed from text and borders; used only for decoration | same script |
| Alt text | Every photo has a label ("Imran's check-in photo", "Your selfie"); decorative bullets are hidden from screen readers | code review |
| Screen-reader labels | Every icon-only button has `accessibilityLabel`; checkboxes, switches, tabs and links have roles and states | code review |
| Touch targets | At least 44–48 px | code review |
| Text size | The system font-size setting is respected (no scaling caps) | code review |
| Reduced motion | Animations stop when the phone's "reduce motion" setting is on | `useReducedMotion` in animated components; CSS `prefers-reduced-motion` in demos |
| Keyboard (web preview and demos) | Counter keypad accepts a hardware keyboard; demo tabs and buttons work with Tab, Enter and Space, with a visible focus ring; cookie banner closes with Esc | code review |
| No colour-only meaning | Late/on-time and paid/in-chair use words as well as colour | design review |
| Language | Plain English, with a Hindi notice available | |

## Known gaps (to fix in the app build)
- Test with TalkBack on a real Android phone, especially the custom number keypad and the animated Live floor.
- The Live floor animation needs a "pause animation" control for people who find motion distracting.
- Hindi in-app text is not done yet.

**Report a problem:** [support email / phone]. We aim to fix accessibility issues within 30 days.
