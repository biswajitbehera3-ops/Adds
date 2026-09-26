# Talefy Teardown & Build Plan

*Research date: 26 Sep 2026. Sources: TrustMRR (Stripe-verified), talefy.ai, quiz.talefy.ai (walked to the email gate), Apple App Store + Google Play listings and reviews, DreamGen and Skywork hands-on reviews, Meta Ads Library (37 active ads), and the full transcript of Jason Lee's "Watch Me Vibe Code an Animated App with Claude Fable 5.1 + Seedance 2.5" (24:24).*

---

## 1. TL;DR

- **Talefy is a ~$22K MRR business, not a tech moat.** It has $943K all-time Stripe revenue, $21,691 MRR, 723 active subscriptions (≈ **$30 per subscriber per month**) and 2% MoM growth. It was founded May 2023 by AIceberg Labs, Inc. (Delaware), which also runs an AI song app, an AI podcast app and a calorie tracker. It is an **app factory** that runs the same playbook in several categories.
- **Most of the money comes from the web funnel, not the App Store.** Every "Play now" button on talefy.ai goes to a **20-screen quiz**, then an email gate, then a Stripe paywall (TrustMRR lists Stripe as its only billing stack). They avoid Apple's 30% cut, and paid Meta traffic lands directly on that funnel.
- **The product is weak, which is the opening.** It has 3.5★ on iOS (100 ratings), 2.7★ on Google Play (10K+ downloads), and a 3.2 TrustScore. The complaints repeat: the AI forgets things, stories get railroaded, crashes lose progress, the "story has been edited" error locks paying users out, coins are lost on crashes, and subscriptions don't sync between web and app.
- **Where they are heading:** all 37 active Meta ads use the CTA **"Start Video Chat 👇"** and were created in the last ~10 days. They are pushing into **AI character video chat**, which fits this project's Higgsfield/Seedance skills.
- **Our angle:** copy the monetisation machine (quiz funnel, weekly paywall, coins, romance-led content) and build the product properly. That means a real story-memory engine, no railroading, rewind/branching, zero lost progress, one account across platforms, and animated, voiced characters. Each fix answers a complaint from the reviews.

---

## 2. Business model, reverse-engineered

### 2.1 Revenue (TrustMRR, Stripe-verified, updated 24 Sep 2026)
| Metric | Value |
|---|---|
| All-time revenue | **$943,132** |
| MRR | **$21,691** |
| Last 30 days | $21,762 (+2% vs prev.) |
| Active subscriptions | **723** → ≈ $30 ARPU/month |
| Founded / HQ | May 2023 / US (Delaware) |
| Domain Rating | 35/100 (low: SEO is not the main channel) |
| Billing stack | Stripe |

### 2.2 Pricing: three layers stacked

**Layer 1: web subscription (Stripe, with intro discount).** From DreamGen's hands-on test:
| Plan | Intro price | Renews at | Coins included |
|---|---|---|---|
| Spark (weekly) | $9.99 first week | **$29.99 / week** | 1,000 |
| Flame (monthly) | $19.99 first month | **$61.99 / month** | 3,000 |
| Passion (3 months) | $49.99 first 3 mo | **$99.99 / 3 months** | 8,000 |

The free tier is about **5 story steps** with no coins. Their Terms of Use also mention a **14-day trial** on some flows.

**Layer 2: App Store IAPs (iOS).** Premium at $19.99 / $26.99 / $46.99, plus a 7-day Premium at $29.99.

**Layer 3: consumable coins ("Taleys").** 165 for $1.99, 475 for $5.99, 855 for $10.99. Coins are spent on:
- a custom image during play: **5 coins**
- AI-generated story details during creation: **20 coins**
- editing the auto-filled fields during creation (Google Play review)
- writing your own custom action instead of picking one of the 4 choices (implied by the iOS review "works great if you can pay to write your own choices")

**Why it works:** the weekly plan is anchored against a cheap first week. Coins then monetise the heaviest users on top of their subscription. One reviewer says they pay "$30 a month", which matches the ≈$30 ARPU.

### 2.3 Acquisition engine
1. **Meta ads.** 37 active ads on page ID `1312255435304584`, all with the link title **"Start Video Chat👇"**, launched in batches of 7 to 12 (19, 20 and 21 Sep 2026). That is a creative-testing cadence. Snapshot example: https://www.facebook.com/ads/library/?id=1473014018214800
2. **Landing site.** talefy.ai is an SEO page stuffed with "AI story generator" keywords, but every story card links to the same quiz URL.
3. **Web quiz funnel** (`quiz.talefy.ai/quiz/1`), which I walked screen by screen:

| # | Screen | Options / purpose |
|---|---|---|
| 0 | "Let's customize your experience!" | Intro plus Terms / Privacy / **Subscription Policy** links |
| 1 | Favorite thing about a good story? | Twists · Strong characters · Rich worlds · Emotions & drama |
| 2 | How old are you? | 18-24 … 65+ (age gate and targeting) |
| 3 | Gender? | Male · Female · Non-binary · Prefer not to say |
| 4 | *"Join over 100,000 storytellers…"* | Social proof |
| 5 | How do you feel about a story that adapts to your choices? | Excited · Curious · Neutral · Skeptical |
| 6 | Ideal story theme? | Romance · Action · Famous figures · Thriller · Slice of Life · True Crime · Your Own Story · Sci-Fi · Fantasy · Horror |
| 7 | *"Talefy stories evolve based on your choice."* | Value statement |
| 8 | Preferred interaction style? | Wreak havoc · Role-play and follow the plot · Mixed |
| 9 | Free time? | Alone · Friends · Videos · Games · Reading · Working hard |
| 10 | *"Every month Talefy adds 10 new thematic settings"* | Content-freshness promise |
| 11 | Ready for unexpected twists? | 4-point scale |
| 12 | **What in AI storytelling turns you off?** | **AI forgetting past events** · Boring narrative · **Censorship** · **Limited freedom of choices** |
| 13 | How should the narrative engage you? | Challenge me · Reflect my choices · Surprise me · Support my escapism |
| 14 | *"Create your own story from scratch in minutes"* | Creator value statement |
| 15 | Narrative "love language"? | Descriptions · Dialogue · Plots · Emotional resonance |
| 16 | Fandoms? | Anime · Harry Potter · LOTR · Witcher · Fanfiction · D&D · DC/Marvel · None |
| 17 | How should your story end? | Open · Happy · Dramatic · Bittersweet · Surprising |
| 18 | "Personalizing your perfect match…" | Fake progress bars plus testimonials (labour illusion) |
| 19 | **Email gate** | "This email will be used to retrieve your benefits in the app." |
| 20 | Paywall (behind the email gate; I did not enter an email) | Plans as in §2.2 |

Screen 12 matters most. **Talefy's own funnel asks users about the exact problems its product has** (memory, railroading, censorship). Those are the objections to answer in both our product and our ads.

4. **Content strategy.** The home-page "Top stories" are *Claimed by the Billionaire*, *Carrying the CEO's Child*, *My Girlfriend is a Succubus*, *The CEO's Assistant* and *The Reunion Affair*. The genre rails are Everyday Love, Billionaire, Fantasy Romance, LGBTQ+, Forbidden Love and Stolen Hearts. **This is the Webnovel / Chapters / Episode romance audience** (mostly women 25–54), not "writers". The "writer's block tool" wording on the site is SEO cover.

### 2.4 Product features (App Store / Play / changelog v1.5 → v1.48)
- A premade library ("200+ story games") plus user-created stories, series and episodes
- 4 AI choices per step plus a typed or spoken custom action
- Real-time AI illustrations (and on-demand image generation since v1.37)
- Chat with characters, and a Character Marketplace
- Text-to-speech narration (v1.35); reviewers praise the voice as "human"
- Choice of AI model, text style and visual tone; safety or content toggles; 0+/13+/18+ ratings
- Typing speed and step-length controls (v1.43), plus a History page and a bonus/rewards system (v1.44–1.45)
- Video covers on stories (v1.33)
- Onboarding tutorials, multi-language support, and speech-to-text

---

## 3. What users hate and what they love (review mining)

### 3.1 Pain points, ranked by how often and how badly they hurt
| # | Complaint (quoted or paraphrased) | Source | Our fix |
|---|---|---|---|
| 1 | **AI forgets.** "mix up character names… no continuity… characters acted like it didn't happen." The developer admits: "working on a model that holds context much longer." | iOS ★, DreamGen (failed 2 of 3 memory tests), Skywork | **Story State Engine**: structured canon ledger plus summaries (§5.1) |
| 2 | **Railroading.** "It ALWAYS brought me back to the same offer, regardless of what I choose." | iOS ★, DreamGen ("significant narrative railroading") | Flexible milestone beats plus loop detection (§5.2) |
| 3 | **"Story has been edited" lock-out.** Happened "5-6 times… paying $30 a month to have it kick me out" | iOS ★★★ | **Version pinning**: a playthrough keeps the story version it started on |
| 4 | **Crashes and failed launches**, sometimes the app won't open at all after subscribing | iOS ★ ×3, Play ★ ×2 | Crash-free-sessions budget, Sentry, offline-first cache |
| 5 | **Lost progress.** Froze while generating an image, and "when I re-entered it started over at the beginning but different" | iOS ★ | Every step is saved to the server before rendering; images are generated asynchronously and never block |
| 6 | **Lost coins** when the app crashed mid-creation | Play ★★ | Idempotent coin ledger with **automatic refund** on any failed generation |
| 7 | **Subscription not recognised** across web and app; can't renew in the app; can't log in to cancel | Play ★, iOS ★★★★ | One entitlement system (RevenueCat + Stripe web), and "Manage subscription" works everywhere |
| 8 | AI **ignores facts the user wrote**, even right after a correction | iOS ★★ | Pinned "Canon" facts that the model must respect, with a validator pass |
| 9 | Your own typed action "completely messes with the story" | iOS ★★★★★ | Parse the action first, update state, then narrate |
| 10 | **Theme drift** ("romance turns into drama") and a protagonist who keeps "questioning themselves" | iOS ★★ | Tone lock and per-story style guide in the system prompt |
| 11 | No way to edit, undo or delete choices or AI replies | DreamGen | **Rewind, edit and branch** on every step |
| 12 | Slow, about **10 s** per step | DreamGen | Stream the text so the first token arrives in under 1.5 s; prefetch choices |
| 13 | "read it to you" fails; the same page repeats | Play ★ | TTS queue with retry; repetition detector |
| 14 | Paywalls inside creation (coins to edit fields) and a small library on Android | Play ★★ | Editing is free; paid actions are clearly priced |
| 15 | "Maybe add a **daily sign-in** with extra coins?" | iOS ★★★★ | Daily streak and energy rewards |

### 3.2 What users love (keep and amplify)
- Human-sounding voice-over
- Images and animations that set the mood
- A free first story before paying ("try your first story" is praised)
- Resume where you left off
- Recommendations based on preferences
- A steady stream of new stories
- Many languages
- LGBTQ+ inclusivity
- The feeling that choices matter and that it is "like watching my favorite movie for the first time"

---

## 4. What the YouTube video teaches: the Claude Code "clone-and-improve" workflow

Jason Lee rebuilds **Finch** (a self-care pet app making about $1M/month) as **"Chewy"**, a baby-alligator habit app, in about 25 minutes. The method carries over to any app. Here it is step by step, mapped to our project:

| Step | What he did | How we apply it to the Talefy clone |
|---|---|---|
| 0. Pick a proven app | Found an app that already makes money | Talefy: $22K MRR, with verified demand |
| 1. Gather context in the project folder | (a) a mascot reference image from Pinterest, (b) a **screen recording of the whole target app**, including the 17–18-page onboarding | Record Talefy's app from install through paywall, a playthrough and story creation. Save the quiz funnel table (§2.3) and this report into the repo |
| 2. Plan before building | Pasted the App Store URL: *"check the link, I want to build a similar app… break down the features and the screens… plan before we build anything"*. Claude also read the reviews to find features people want | The build prompt below starts with the same plan-first phase |
| 3. Level 1: main screens | *"Use Higgsfield MCP for any image or video generation"* for the mascot and a style-matched backdrop, then `/design` to build a **phone-mockup preview on localhost** | Home, Library, Player, Create, Profile and Shop, with covers and characters from Higgsfield |
| 4. Level 2: onboarding and paywall | *"Watch the onboarding video and recreate the same flow, all pages and wording, choose the right expression for the mascot on each page"* | Our quiz funnel of about 18 screens plus the paywall (rewritten, not copied) |
| 5. Level 3: animation | Asked Claude to animate the mascot and backdrop with **Seedance 2.5 via Higgsfield** and swap the stills for loops. Refined it with precise directions (walk left to right, pick up a coffee, keep the clouds still) | Animated story covers and character idle loops, which beat Talefy's static covers and fit their new video-chat direction |
| 6. Build the backend in parallel | While videos rendered (10+ min): *"build the functionality with **React Native + Expo EAS Build**… I have an Apple developer account ($99/yr) and Expo account, guide me, ask for API keys"* | Same stack. Use Expo Go only for quick previews and EAS Build for real features (auth, database, IAP) |
| 7. Micro-animations | Downloaded **LottieFiles** confetti, recoloured it to the brand, and dropped it into Claude: *"show this when a goal is completed"* | Confetti on story endings, streaks and coin rewards |
| 8. Iterate visually | Screenshots of bugs, or a **Loom walkthrough with voice comments** that Claude watches | Same loop |
| 9. Ship | App icon generated in Higgsfield, EAS build on the phone, then the App Store | Same |

**Main lesson:** don't hand-write specs. Give Claude **rich context** (a recording of the app, the store URL, the reviews and reference art), have it **plan first**, and build in **levels**: screens, then onboarding and paywall, then animation, then backend.

> ffmpeg note: the sandbox's network policy blocks youtube.com, so yt-dlp and ffmpeg could not download the video or extract frames. I used the full timestamped transcript instead. It covers every step and prompt he spoke aloud. If you want frame-level UI detail, run the `ad-teardown` or `yt-dlp` skill on your local machine.

---

## 5. The improved product: "better than Talefy" spec

Working name: **Loreline** (placeholder; rename freely).

### 5.1 Story State Engine (fixes memory, ignored facts, continuity)
Every turn, the model receives **structured state**, not just recent chat:
- **Canon ledger:** atomic facts with a source step, plus user-pinned facts that can never be contradicted (e.g. "Mara hurt the player in ch.2; the player distrusts her").
- **Character sheets:** name, traits, voice, goals, secrets, and a **relationship meter toward the player**.
- **World and scene:** location, time, inventory, open threads.
- **Rolling summaries:** one per chapter, plus a whole-story synopsis.

The pipeline for each step:
1. **Intent parser (fast model):** turns the player's choice or typed action into a structured intent.
2. **Narrator (quality model):** streams the next beat using the state plus the last N turns.
3. **State extractor (fast model):** outputs a JSON diff of new facts and relationship changes.
4. **Validator:** checks the new text against the canon ledger. If it contradicts anything, regenerate.

The player can open a **"Memory" drawer** to view, edit or pin facts. That turns the #1 complaint into a feature.

### 5.2 No railroading
- Stories use **milestone beats with flexible paths**: the author sets goals ("reach the masquerade", "learn the secret"), not fixed scenes.
- **Loop detector:** if the scene embedding is too similar to one from 1–3 steps ago, or the same offer or dialogue repeats, force a progression.
- **Commitment rule:** once the player accepts or declines something, that is written to canon and cannot be re-asked.
- A per-story **freedom slider**: Guided, Balanced or Sandbox.

### 5.3 Never lose anything
- Each step is committed server-side (Postgres) before it renders, and cached locally for offline reading.
- **Rewind, edit your choice, or branch** from any step, with a branch tree view.
- **Version pinning:** a playthrough references `story_version_id`, so author edits never break an active run. The player can choose "update to the latest version".
- Images and TTS are generated asynchronously with a blurred placeholder, so they never block the story. A failed generation refunds its coins automatically.

### 5.4 Fair, transparent monetisation (still built to convert)
- Web quiz funnel with a Stripe paywall **plus** native iOS/Android IAP through RevenueCat, all in **one entitlement**, with "Manage / Cancel" on every platform.
- Offer a monthly and an annual plan alongside the weekly one. The weekly plan converts but also drives refunds and bad reviews, so show the per-week price honestly.
- Free tier: 1 full free story plus **daily energy**, with a **daily streak** that rewards coins (a reviewer asked for this).
- Coins only for premium extras: custom scene images, **animated scenes (Seedance)**, premium voices and video chat. **Typing your own actions is free**, because it is the core fun.

### 5.5 Cinematic and voiced (our unfair advantage, built from this repo's skills)
- Story covers and key scenes animated with **Seedance 2.5 via Higgsfield** (`cinema-director-v3` writes the prompts). Talefy only has static covers and a few video covers.
- Consistent character art: `banana-pro-director-30` face lock plus a character sheet per lead character, so faces don't drift between illustrations.
- Distinct voices per character for narration; lip-synced **"video message" moments** from the love interest as a premium feature, which answers Talefy's "Start Video Chat" push.

### 5.6 Content and policy guardrails (important)
- Talefy is rated 18+ and advertises spicy romance. **If Claude is the narrator, Anthropic's usage policy does not allow sexually explicit content.** Position the app as **romance and drama with "fade-to-black" intimacy**. That is also the safer route for App Store review (guideline 1.1) and Meta ads approval.
- Because users can publish stories, you need a **report, block and moderate** flow (App Store guideline 1.2), plus an age gate at onboarding.
- Don't clone Talefy's story titles, art or wording. Copy the *model*, not the *assets*.

### 5.7 Performance targets
| Target | Value |
|---|---|
| First token | < 1.5 s |
| Full beat | < 6 s |
| Crash-free sessions | ≥ 99.5% |
| Lost progress | 0 steps (enforced by tests) |
| Rating goal | 4.6★ or higher (Talefy: 3.5 iOS / 2.7 Play) |

---

## 6. Recommended stack

| Layer | Choice | Why |
|---|---|---|
| App | **Expo (React Native) + Expo Router + TypeScript**, EAS Build and Submit | Same as the video; one codebase for iOS and Android |
| UI and motion | NativeWind, Reanimated, `lottie-react-native`, `expo-video` for Seedance loops | Animated covers and confetti |
| Backend | **Supabase** (Postgres, Auth with Apple/Google/email, Storage, Edge Functions, Row Level Security) | Fast to build, relational story state |
| LLM | **Claude API**: a quality model (`claude-sonnet-5`) as narrator; `claude-haiku-4-5-20251001` for intent parsing, state extraction and choice generation; prompt caching on the story bible and system prompt | Quality plus cost control |
| Images and video | **Higgsfield API**: Nano Banana Pro / GPT image for scenes and covers; Seedance 2.5 for animated covers and scenes | Already wired into this project |
| Voice | A streaming TTS provider (e.g. ElevenLabs) with per-character voices | Reviewers love the voice-over |
| Payments | **RevenueCat** (iOS/Android IAP) plus **Stripe** (web funnel), with entitlements synced through webhooks into Supabase | Fixes "paid on web, app doesn't know" |
| Web funnel | Next.js on Vercel: quiz, email, paywall, Stripe Checkout | Keeps web revenue out of Apple's 30% |
| Analytics and stability | PostHog (funnels, A/B tests on the paywall), Sentry (crashes) | Crash-free target |
| Ads | Meta via `ad-strategist` + `ugc` / `cinema-director-v3` | This repo's own pipeline |

---

## 7. Roadmap (about 4 weeks for a solo builder with Claude Code)

| Week | Deliverable |
|---|---|
| 1 | Plan-first session; `/design` mockups in a phone frame; Supabase schema; the Story State Engine working on a CLI harness with 3 test stories and memory regression tests |
| 2 | Expo app: Library, Player (streaming, 4 choices plus free text, rewind and branch), Memory drawer, History, Profile. Higgsfield covers and character art for the first 12 stories |
| 3 | Onboarding quiz (in the app and on the web), paywall, RevenueCat + Stripe, coins ledger, daily streak, Lottie rewards, TTS, Seedance animated covers |
| 4 | Creator tool (story wizard, milestones, characters), moderation and reporting, Sentry and PostHog, TestFlight, App Store submission. Launch the first 10 UGC-style Meta ads |

---

## 8. Ad angles for launch (from the review mining)
Talefy's own quiz lists the objections, so answer them head-on:
1. **"The AI that actually remembers."** Show a character bringing up something from chapter 1.
2. **"Your choice actually changes the story."** Split-screen: two choices lead to two different animated scenes.
3. **"Rewind any choice."** A regret-then-redo hook.
4. **"Your love interest just sent you a video 👀."** Seedance-animated character message, which competes with Talefy's "Start Video Chat" ads.

Build these with `ad-strategist` (angle and hook), then `ugc` or `cinema-director-v3` (video prompts). Every Higgsfield generation still needs a quoted cost and your explicit go-ahead.
