# Master Build Prompt: "Loreline" (a better Talefy)

Paste everything below the line into a **new, empty Claude Code project folder**. Before you do, put these files in the folder (the video's main lesson is to give Claude rich context):

- `REPORT.md` from this directory (the teardown)
- A **screen recording** of the Talefy iOS app: install, onboarding, paywall, one full playthrough, and creating one story
- 2–3 reference images of the art style you want (Pinterest or similar)
- Optional: a Loom walkthrough of anything you want changed later

Connect the **Higgsfield MCP** first. Have your Apple Developer account ($99/yr), an Expo account, a Supabase project, an Anthropic API key, a RevenueCat account and a Stripe account ready. Claude will ask for each key when it needs it.

---

```
You are my senior mobile engineer, product designer and growth engineer. We are building
"Loreline" (working name): an AI interactive-story app for iOS + Android, plus a web
onboarding funnel. It is a direct competitor to Talefy (talefy.ai, ~$22K MRR, 3.5★ iOS /
2.7★ Play). Read REPORT.md in this folder first. It holds the full teardown: revenue model,
the 20-screen quiz funnel, pricing, feature list, and every user complaint we must fix.
Also watch the screen recording in this folder so you know every screen and interaction
of the app we are beating.

Reference App Store listing: https://apps.apple.com/us/app/talefy-ai-character-roleplay/id6504186435
Read its reviews again yourself and add any complaint that REPORT.md §3 missed.

RULE 0: PLAN BEFORE YOU BUILD.
Do not write app code yet. First reply with:
  1. A screen map (every screen and modal, with its purpose and main components)
  2. The data model (tables, key columns, relations)
  3. The story-engine architecture (see spec below) as a sequence diagram
  4. Build order by level (below), with open questions for me
Wait for my "go" after the plan.

LEVELS (build in this order, and show me a working preview at the end of each):

LEVEL 1: DESIGN AND CORE SCREENS
- Use /design to build high-fidelity mockups, previewed on localhost inside an iPhone frame.
- Visual direction: dark, cinematic, "premium romance/fantasy streaming app" (think Netflix
  meets a romance novel), NOT a generic chat UI. Derive the palette from my reference images.
- Use the Higgsfield MCP for ALL images and video: story covers, character portraits,
  backgrounds, app icon. You write the image prompts. Keep each lead character's face
  consistent: build one face-locked reference plus a character sheet per lead and reuse it
  as a reference for every later image of that character.
- IMPORTANT COST RULE: before ANY Higgsfield generation, post a quote (model, count,
  resolution/duration, estimated credits vs my balance) and wait for my explicit "yes".
  After each run, inspect the output and tell me what's wrong before I notice.
- Screens: Home (hero carousel + genre rails: Everyday Love, Billionaire, Fantasy Romance,
  Forbidden Love, LGBTQ+, Thriller, Horror, Sci-Fi), Story Detail (animated cover, synopsis,
  characters, rating, "Continue"/"Start"), Player, Memory drawer, Branch tree, History,
  Create wizard, Characters, Shop/Coins, Profile/Settings, Paywall.
- Seed 12 original launch stories (romance-led, plus 2 fantasy, 1 thriller, 1 horror).
  Titles, art and text must be ORIGINAL. Never copy Talefy's titles, art or copy.

LEVEL 2: ONBOARDING AND PAYWALL (web + in-app)
- An onboarding quiz of about 16–18 screens, modelled on the funnel structure in REPORT.md §2.3
  but rewritten in our voice: preference questions (theme, what you love in a story, play
  style, fandoms, preferred ending), age gate (18+ for mature-tagged content), social-proof
  interstitials, a "what turns you off in AI stories?" screen whose options we then
  explicitly promise to solve (memory, railroading, lost progress), a
  "building your first story…" labour-illusion screen, then a free first chapter
  PERSONALISED from the answers, then the paywall at the cliffhanger.
- Paywall: weekly (intro price), monthly and annual plans, with honest per-week pricing,
  "Cancel anytime" linked to the real cancel flow, and restore purchases. The copy, prices
  and plan list come from remote config so I can A/B test them.
- Build the SAME quiz as a Next.js web funnel (Stripe Checkout) for paid Meta traffic.
  Web purchases and app purchases share ONE entitlement.

LEVEL 3: ANIMATION AND DELIGHT
- Use Higgsfield Seedance 2.5 (quote first!) to make 5–8 s seamless looping animated
  covers for the top 6 stories and idle loops for the 4 lead characters (breathing,
  blinking, a glance at camera). Swap the stills for looping expo-video, falling back to the
  still when the device is on low-power mode or offline.
- LottieFiles micro-animations recoloured to our palette: confetti on chapter end,
  streak flame, coin burst, choice-select ripple. Use Reanimated for page and card
  transitions and haptics on choices.

LEVEL 4: REAL APP AND BACKEND (start this in parallel while Higgsfield renders)
- React Native + Expo (Expo Router, TypeScript strict), built with Expo EAS Build so I can
  install it on my iPhone. Guide me step by step through Apple Developer, Expo, EAS and
  TestFlight setup, and ask me for every key or credential you need.
- Supabase: Auth (Sign in with Apple, Google, email), Postgres with row-level security, Storage,
  and Edge Functions for all AI calls (never ship API keys in the app).
- Payments: RevenueCat for iOS/Android IAP and Stripe for the web. Webhooks from both write
  to one `entitlements` table. "Manage subscription" must work from every platform.
- Coins: a double-entry ledger with idempotency keys. Every paid generation is a
  reservation that is committed only on success and AUTO-REFUNDED on failure or timeout.
- Daily streak (daily login coins plus free "energy" for non-subscribers).
- Sentry (crash reporting) and PostHog (funnel events, paywall experiments, retention).

STORY ENGINE SPEC (the core product; this is why we win):
Models: narrator = claude-sonnet-5 (streaming). Intent parsing, state extraction, choice
generation and validation = claude-haiku-4-5-20251001. Use prompt caching for the system
prompt and story bible.

Per story we store: story bible (premise, tone lock, style guide, milestone beats),
characters (traits, voice, goals, secrets), and `story_version_id`.
Per playthrough we store: canon ledger (atomic facts: text, source_step, pinned bool),
character states (including relationship meter to the player), scene state (location,
time, inventory, open threads), chapter summaries, and every step as an immutable row
(parent_step_id → enables a branch tree).

Each turn:
  1. INTENT: parse the player's choice or free-text action into {action, target, stance}.
     If the player accepts or declines an offer, write that to canon as a commitment.
  2. NARRATE: stream 120–220 words (the player can choose the length) using: bible +
     pinned canon + relevant canon + character states + last 6 steps + chapter summary.
     Obey the tone lock (a romance story stays romance). The narrator must not undo
     player commitments or contradict pinned facts.
  3. EXTRACT: JSON diff of new facts, relationship deltas, scene changes, open threads.
  4. VALIDATE: check the new text against canon. On contradiction, regenerate once with the
     contradiction named; if it still fails, pick the safer variant and log it.
  5. CHOICES: generate 4 distinct next choices (at least one bold, one emotional, one
     cautious), plus free-text input that is ALWAYS free and never costs coins.
  6. ANTI-LOOP: if the scene embedding is >0.9 similar to one of the last 3 steps, or the
     same offer or question repeats, inject "advance to the next milestone beat" and regenerate.
  7. PERSIST: commit the step and state to Postgres BEFORE rendering the final text;
     cache locally for offline reading. Images and TTS are queued asynchronously and never
     block the story.
Player controls: Rewind to any step, Edit my last choice, Branch from here (tree view),
Memory drawer (view, edit or pin canon facts), freedom slider (Guided / Balanced /
Sandbox), typing speed, step length, narration voice on/off.
Version pinning: author edits create a new story_version. Active playthroughs keep their
version, and the player can opt in to "update to the latest version". There is NEVER a
"story has been edited" lock-out.

CREATE WIZARD (user-generated stories):
Premise → genre and tone lock → characters (AI-suggest or write) → 3–7 milestone beats →
cover (Higgsfield, costs coins, quoted) → rating (13+/18+) → publish. Editing
auto-filled fields is FREE. Published stories get report, block and moderation tooling
(App Store guideline 1.2) and an AI moderation pass before going public.

CONTENT POLICY:
Romance, drama, danger and dark themes are fine. Sexual content is fade-to-black and never
explicit (Anthropic usage policy, App Store 1.1, Meta ad policy). Hard block anything
involving minors. Age-gate mature-tagged stories.

QUALITY BARS (write tests for these):
- Memory regression suite: 20 scripted playthroughs that plant facts early and assert
  they are respected 15+ steps later. It must pass ≥95%.
- Railroad suite: a declined offer must not come back within 10 steps.
- Zero-loss tests: kill the app mid-generation, then relaunch → same step, same state,
  coins refunded.
- Entitlement tests: buy on the web → app unlocks within 5 s; cancel works on every platform.
- Performance: first token under 1.5 s, crash-free sessions ≥99.5%.

WORKING STYLE:
- After each level, give me a localhost phone-mockup preview AND (from Level 4 on) an EAS
  build on my phone.
- I will send screenshots or Loom videos with feedback. Watch them and fix exactly what I
  point at.
- Keep a CHANGELOG.md and a DECISIONS.md. Commit after every working milestone.
- Ask me before any spend: Higgsfield credits, paid APIs, App Store submission.

Start now with RULE 0: the plan.
```
