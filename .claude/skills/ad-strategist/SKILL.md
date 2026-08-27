---
name: ad-strategist
description: >
  Master ad-psychology, virality, Meta/Facebook algorithm, and cold-outreach playbook for selling and producing AI UGC ad creative. Use this skill whenever the user wants to: research a brand before pitching or scripting for it; write ad hooks, angles, or scripts; decide what makes an ad stop the scroll or go viral; understand how the Meta/Facebook algorithm ranks and serves ads; plan a creative-testing or scaling strategy; build a landing page or offer; or run cold outreach / DM sequences / emails to land an AI-ads client. This is the strategic brain behind the studio — consult it BEFORE writing any script (feeds seedance-clean / seedance-multishot-prompter) and BEFORE building a UGC ad (feeds ugc) and BEFORE reaching out to a lead (feeds lead-generator). Trigger on: "research this brand", "find the gap", "write me a hook/ad script", "why isn't this ad working", "how do I scale this ad", "write my outreach message", "what's my landing page structure", "explain the meta algorithm", "make this go viral".
---

# Ad Strategist — Psychology, Algorithm & Client-Acquisition Playbook

This is the strategic knowledge base for an AI-ads freelance/agency operation. It does not write final scripts or find leads itself — it feeds the two doing-skills:

- **Research a brand → find the gap → decide the angle/hook** → hand off to **seedance-clean** or **seedance-multishot-prompter** (prompt writing) or **ugc** (full UGC pipeline) to actually build the creative.
- **Build a lead list** → **lead-generator**.
- **Reach out to a lead** → use the outreach playbook in this file directly.

Always do the thinking in this file first. Do not skip straight to prompt-writing or cold-emailing without applying the relevant section below.

---

## 1. THE ONE THING THAT NEVER CHANGES: HUMAN PSYCHOLOGY

AI tools change constantly. The psychology underneath every winning ad does not. Two books anchor everything here: *Scientific Advertising* (Claude Hopkins) and *The 8-Week Copywriting Handbook*. Their core idea, repeated across every source this skill is built from:

> **People buy with emotion and justify with logic.** They buy to move away from a pain, or toward a desired identity/outcome — never because of a feature list.

The universal gap-selling shape:
1. **Current situation** (the pain, stated concretely — not "you're unhappy" but "your teeth are yellow and you're avoiding smiling in photos").
2. **Desired situation** (the outcome, stated as an identity/emotion — "smile like you mean it," "teeth like a Hollywood actor").
3. **The gap** between them.
4. **The product** as the only credible bridge across that gap.

Never sell the product. Sell the click, the identity, the outcome. The product is the mechanism, not the message.

---

## 2. MARKET AWARENESS — MEET THEM WHERE THEY ARE

Every market splits into five awareness states (most-sold to least-sold):

| State | Who they are | What they respond to |
|---|---|---|
| **Most aware** | Ready to buy right now | Product, price, offer/bundle |
| **Product aware** | Know solutions like yours exist | Differentiation, price, offer |
| **Solution aware** | Know they want a solution, haven't picked | Claims + proof, your specific mechanism |
| **Problem aware** | Know they have a problem, haven't researched solutions | Education on the problem, why other solutions fail |
| **Unconscious / unaware** | Don't know they have a problem — the biggest, least-contested market | Story, explanation, entertainment — take them from "who are you" to "shut up and take my money" |

Also frame this as **traffic type**:
- **Demand capture** (Google/search) — people already searching, easy to convert, low ceiling (bounded by search volume).
- **Demand generation** (Meta/TikTok) — you interrupt people who weren't looking, and can create demand out of nothing. Bigger money lives here, but it requires stronger creative/psychology skill.

**Rule:** the ad's opening line and creative angle must match the awareness level you're targeting. A "most aware" audience wants the deal. An "unaware" audience needs a story before they'll tolerate a pitch.

---

## 3. THE HYPERDOPAMINE AD FRAMEWORK (what makes people stop scrolling)

Every high-performing direct-response ad = three ingredients stacked together:

1. **Pattern interrupt** — the image/first frame is *weird*, unexpected, or breaks the visual pattern of the feed. Not polished/corporate — the opposite. A raw phone photo, an odd object, a strange facial expression, a secondary inset image that makes the brain do a double-take.
2. **Burning intrigue** — the headline/hook opens a curiosity gap the brain cannot leave unresolved. Never state everything up front.
3. **A big, specific, targeted benefit** — the intrigue must resolve toward something the target market explicitly wants. Intrigue without a benefit = "blind clickbait" (gets clicks from the wrong people, tanks quality score). Benefit without intrigue = ignored, looks like every other ad.

**Formula check for any ad:** Does it (a) interrupt the pattern, (b) create burning intrigue, (c) promise a specific benefit to a specific audience? All three or it's not done.

### Where to steal headline inspiration
Study the highest-engagement content categories on the platform itself — news/gossip/findings formats (LadBible, Unilad, E-News, TMZ-style headlines, supermarket tabloid covers). These aren't beneath a "serious" brand — even billion-dollar advertisers (e.g. teeth-whitening brands) use tabloid-style hooks ("She was skeptical. Wait until you see her results.") because they work. Swipe the *structure*, not the topic:

- `[Group of people] going wild after [surprising discovery]` → "Aussies going wild after spotting this home loan hack"
- `[Authority figure] advised to do one thing before [X]` → "CEOs advised to do one thing before going home to their family"
- `Secret way to [outcome] without [expected method]`
- `[Person] couldn't believe [result]. Here's what happened.`

### Anatomy of a full ad (in order)
1. Pattern-interrupt image/first-frame
2. Eyeball-grabbing headline (intrigue + benefit)
3. Slippery lead-in line (first line of body copy — its only job is to get the second line read)
4. Intriguing link description
5. "Butter" body copy — long-form is fine and often outperforms short-form (aim ~2200 characters max, the Meta limit), but only if every line earns the next. Write long, then cut aggressively — don't pad to hit a length.
6. Non-threatening CTA — "Learn More" tests best; avoid "Buy Now"/"Inquire Now" as a default.

---

## 4. COPYWRITING RULES

- **Write at a 3rd–5th grade reading level.** Check with a readability tool (Hemingway-style). Simple words, short sentences, short paragraphs, heavy line breaks — 80–90% of readers are on mobile.
- **Speak to one person.** "You," not "our customers." "We/us," not the brand name in third person.
- **Specificity beats vagueness.** "Lose weight" → "lose 10kg in 6 weeks." "Explode your leads" → "get 90 to 480 qualified leads a month." Specific numbers make claims believable.
- **Positive framing outperforms negative ~8/10 times.** "Lose 20-50kg with this one weird hack" beats "Don't gain 50kg this winter" — even in painful markets. Test both, but default positive.
- **Show personality.** Generic, safe copy reads as untrustworthy. Zest and specificity add credibility.
- **One theme per ad.** Once you find the winning headline/angle, make the creative, lead-in, and body copy all reinforce that one angle. Don't split focus.
- **Positive-only direction when scripting video** (also applies to Seedance prompts): describe what happens, never what to avoid.

---

## 5. VIRALITY PSYCHOLOGY — WHY CONTENT (AND ADS) GET SHARED

Six brain-level principles behind organic and paid virality alike:

1. **The brain decides in under a second, before conscious thought.** It asks: have I liked something like this before? Is something unexpected happening? Does this relate to me? A totally novel format confuses rather than excites — it gets scrolled past. **Format-steal, don't invent**: find a structure already proven to go viral in adjacent content (a reaction format, a walk-up-to-a-stranger format, a challenge format) and place your brand/product inside it. This is the *mere exposure effect* — familiarity of structure builds trust fast.
2. **The curiosity trap.** Never lead with the product — the brain instantly tags "product mention = ad" and disengages. Open a gap between what the viewer knows and wants to know in the first two seconds; the brain won't let them leave until it's closed. Let the product appear naturally once they're already watching, not in the hook.
3. **People buy/share identities, not products (means-end theory).** Every product has three layers: (1) attributes — what it is, (2) functional consequences — what it does, (3) psychological/identity value — what it means about the person. Most weak ads live in layer 1. Always ask "why does someone actually care about this?" repeatedly until you land on layer 3 (e.g., supplement → energy → "I'm in control of my life"). Content about the identity outcome doesn't feel like an ad.
4. **The credential shortcut.** A visible authority signal in the first two seconds ("chef," "Harvard student," "25-year-old engineer who sold his company," a professional kitchen, a lab coat) makes the brain accept the content as worth watching without conscious evaluation. Give the creator/context a credential whenever possible — it's not manipulation, it's how attention has always worked.
5. **Shareability is about the sharer's image, not the viewer's enjoyment.** People share what makes *them* look smart, funny, or in-the-know to their friends — not merely what they liked. A shareable hook must be explainable in one sentence. Humor and surprise travel; sadness and anger get views but don't spread as well. When scripting a hook, ask: "what does the person who shares this get to say about themselves?"
6. **Story structure disables critical thinking.** Universal shot/skeleton: **Hook → Problem → Story → Payoff.** Inside a story, people stop fact-checking and start feeling. Every frame/shot must deliver new information or it should be cut — the brain tunes out anything static. Use captions: processing audio + visual text simultaneously activates more neural pathways and boosts retention.

**Practical application:** when writing any ad script or UGC video (feed this into the `ugc` or `seedance-*` skills), the opening 2 seconds must (a) NOT show/mention the product, (b) contain a pattern interrupt or credential signal, and (c) open a curiosity gap tied to an identity outcome, not a feature.

---

## 6. HOW THE META/FACEBOOK ALGORITHM ACTUALLY WORKS

Every impression is decided in ~200ms across four steps:

1. **Retrieval** — from tens of millions of candidate ads down to millions. This is where Meta reads your **creative itself** (hook, format, who's on camera, copy, script, thumbnail, even the landing page) to infer who to show it to. Since the **Andromeda** update, this step leans on creative content far more than manual audience/interest settings.
2. **Light ranking** — millions → thousands.
3. **Heavy ranking** — thousands → a few hundred. This is where the real value equation applies (below).
4. **Auction** — the remaining ads bid; highest total value wins the impression.

### The value equation (from Meta's own released documentation)
```
Total Value = Advertiser Value + Consumer Value/Experience
Advertiser Value = Bid × Estimated Action Rate
Estimated Action Rate (for conversion ads) = Estimated CTR × Estimated Click-to-Conversion Rate
```
In practice: **estimated CTR** is really a bundle of all your "soft metrics" — CTR, CPC, CPM, hook rate, hold rate, cost-per-3-second-view. **Click-to-conversion** is how well your funnel/landing page turns a click into a sale. Consumer experience is Meta protecting its own platform from ads so aggressive they'd wreck user trust.

### What this means practically
- **Your creative IS your targeting.** Stop over-engineering ad sets, interest stacks, and custom audiences — spend that energy on creative. Run **broad targeting** (a country, not an interest stack) and let Advantage+/broad campaigns do the work; the algorithm has more data and better incentives (it wants your ad in front of the right person because that's how Meta makes money) than manual targeting ever will.
- **Long-form copy gives the algorithm more context to find the right audience** — a short, generic ad gives Meta a tiny context window to work with, which narrows who it can find. Rich, specific copy = better audience discovery.
- **The "learning phase" is a myth as a hard on/off switch.** Ads never stop learning. Expect volatility, especially under ~$1,000/day spend — that's normal, not broken. Zoom out to 7-day windows before judging performance; don't make emotional decisions off single-day swings.
- **Signal quality matters but isn't magic.** Send Meta the best data you can (Conversions API / server-side tracking, work on Event Match Quality) but don't over-index on the EMQ score — real accounts run profitably with mediocre EMQ scores too. Take Meta's own in-platform suggestions with a large grain of salt; they're a public company optimizing for your spend, not necessarily your profit.
- **Creative diversity means variations too, not only "new concepts."** Test one concept (one ad set) with multiple **variations** (different hooks, different demographics/copy) — a variation frequently beats the original "net-new" concept it came from. Don't discard variation-testing because of Andromeda hype.

**Three-point takeaway to repeat to yourself before touching ad settings:** (1) creative is the targeting, (2) make genuinely scroll-stopping creative — that's half the battle, (3) don't wreck the user experience.

---

## 7. SCALING & OPTIMIZATION HACKS (once an ad is live)

1. **Feed the algorithm volume — statics over video when volume is the constraint.** Since Andromeda, ad accounts need an "absurd" amount of fresh creative to avoid fatigue. Static image ads are cheaper and faster to produce at volume than video, and Meta's own algorithm has a structural bias toward statics (it can show more of them per session than video). **Block one hour per week, minimum, to produce fresh creative** off your current winning offer.
2. **The one-keyword hack.** Take your winning ad, duplicate it, and insert a niche/identity keyword into the headline or body copy ("Here's how to get 462 leads per week" → "...462 dental leads..."). This is an *identity trigger* — it tells the algorithm which audience pocket to go find and dramatically drops cost-per-lead by unlocking segments a generic ad can't reach.
3. **The winning-format clone.** Don't rest all performance on one winner. Feed your winning ad into an LLM (Claude, etc.) and generate dozens of variations — same underlying ad, rewritten for different demographics (age, gender, niche) so it reads like a different author wrote it for each. Do this for body copy first, then headlines, then creative. Launch them together in a CBO and let Meta's algorithm allocate spend. **Zombie campaign**: ads you have high conviction in that got zero spend — batch them into their own ad set and relaunch; often ~20% turn out to be winners that just needed a fresh auction.
4. **Don't make ads look like ads.** Ad blockers exist because people hate ads. Instead, mimic native content people already consume voluntarily: repurpose a long-form organic video that already has real views/engagement as a paid ad. Or build a **burner social account**, follow the niche's influencers/pages, and let the algorithm surface what's already trending in that niche — that's your creative template.
5. **Broad targeting + hyper-specific creative is "the new meta."** Don't try to out-target Meta's own engineers. A/B test your best creative on full interest-stacked targeting vs. just a country with no other targeting — broad usually wins on CPA within 7 days once the creative itself is dialed in.
6. **Match your ad headline to your landing page headline.** Meta exposes headlines to ~1000x more people than click through, so it's your best (free) split-test data. Take the winning ad headline and mirror it in the landing page headline, sub-headline, and lead-in — expect a 15-20%+ conversion lift just from congruence. Audit this within 24 hours whenever an ad wins.
7. **Retarget with a different offer, not more of the same ad.** If someone didn't buy, the offer — not the ad — was likely the wrong fit. Build a retargeting sequence: (a) an objection-handling ad addressing the actual reasons prospects gave for not buying/booking (get this from sales calls), (b) proof/testimonial carousel ads, (c) ads for adjacent products/services, (d) a value-first audit/consult offer that delivers value even if they don't buy.
8. **Track blended ROAS / net cash flow at the business level, not per-ad ROAS.** A campaign-level ROAS drop from 15 to 11 while total ad spend and total net profit both rose is a win, not a problem. Find the realistic break-even ROAS for the business and scale spend right up to that ceiling — confidence to scale comes from knowing your own numbers cold, not from a dashboard percentage. Block time monthly to personally review the raw numbers, not just a summary dashboard.

---

## 8. THE 17-STEP OFFER / LANDING PAGE STRUCTURE

Use this to structure any landing page, VSL script, or long-form sales copy the client needs:

1. **Call out the audience** — write directly to the ~20% of the market that drives ~80% of revenue.
2. **Headline** — a big, bold, *specific* benefit. Stop the scroll/glance and force the next line to be read.
3. **Sub-headline** — expands the headline, still doesn't give the full picture; glides the reader forward.
4. **Irresistible intrigue** — open a curiosity loop early; never lay out the full hand immediately.
5. **Spotlight the problem** — people move away from pain harder than they move toward pleasure. Build real pressure.
6. **Reveal the solution** — and how it solves what existing alternatives don't.
7. **Credentials** — your authority to sell this: results, case studies, past clients, unquestionable proof.
8. **Benefits, not features** — build a two-column list (feature → corresponding benefit) and write copy from the benefit column only.
9. **Social proof** — as much unquestionable proof as possible.
10. **The "Godfather offer"** — specific enough that it can't be refused (e.g., a guaranteed numeric outcome or full refund).
11. **Stack bonuses** — 2–3 is the sweet spot; more doesn't necessarily convert better.
12. **Stack the value** — show a credible larger price before revealing the real one.
13. **Reveal the price** — framed as a small fraction of the stacked value.
14. **Scarcity** — real, stated constraints (stock, spots, time) — can lift conversion 30%+.
15. **Guarantee** — remove the buyer's risk; this alone often cuts CAC in half.
16. **Call to action** — spelled out in forensic, no-ambiguity detail.
17. **P.S.** — a compressed re-summary + risk reversal; the last nudge for skimmers.

**The highest-leverage 20%:** headline, the offer itself, the sub-headlines sprinkled through the page, and the P.S. Spend disproportionate time there.

---

## 9. BRAND RESEARCH PROCESS (do this before writing any script or reaching out)

Spend 15–20 minutes minimum per brand before producing anything.

1. **Open Meta Ads Library** → set to "All Ads" / Worldwide → search the brand name.
2. **Identify winning ads**: any ad running 30+ consecutive days is, with near-certainty, a winner — brands don't keep spending on losers when winners exist in the same set. Prioritize studying these.
3. **Download and transcribe** the winning ad (right-click → Inspect Element → grab the video URL → open in new tab → download; then feed the file to Claude/Gemini/ChatGPT and ask for a full transcription) to reverse-engineer its script structure.
4. **Dissect the structure** you find: How was attention captured in the first 3 seconds? What problem-angle did they choose? What story/emotional angle? Where does the CTA send traffic (own site / Instagram / WhatsApp — tells you if it's a traffic or sales campaign)?
5. **Study their landing page**: does the headline match the ad? Is the offer clear? What's missing?
6. **Find the gap** — the thing they're *not* doing. Common gaps: an underserved customer segment/avatar (e.g., people who already have decent results but want a small refresh, not just people in acute pain), an unused hook style, a missing long-form storytelling format, an unused problem angle, a headline/landing-page mismatch, no retargeting-with-different-offer sequence, ROAS obsession instead of blended/net-cash tracking. Every brand has at least one gap — the more "expert" they seem, the more likely they've settled into blind spots.
7. **Build the pitch asset around that specific gap** — a script and/or a full creative addressing exactly what they're missing, not a generic pitch.

This research step feeds directly into `seedance-clean` / `seedance-multishot-prompter` (for the prompt) or `ugc` (for the full pipeline) — hand off the chosen angle, hook, and gap once it's identified.

---

## 10. CLIENT ACQUISITION — THE 30-DAY ROADMAP

### Phase 1 (Days 1–3): Learn ad psychology
Read *Scientific Advertising* and *The 8-Week Copywriting Handbook* before worrying about which AI tool to use. Fundamentals compound; tools churn.

### Phase 2: Study winning UGC ads
Use the brand research process above across multiple **problem-solving niches** — skincare (retinol, niacinamide), supplements/weight loss, hair growth (minoxidil), sleep (magnesium glycinate), energy. Avoid pure vanity/non-problem-solving products; problem-solving products convert far better with UGC direct-response.

### Phase 3: Build the lead list
Target **direct-to-consumer, Shopify-store brands running 30+ ad creatives** — that combination signals real ad budget and a real ability to pay >$1,000/client. Use the `lead-generator` skill for this, or outsource list-building to a freelancer on Upwork/Fiverr (~$50–100) with those same three filters, or use Apollo.

### Phase 4: Daily practice + outreach
Every day: write 3–5 AI UGC ad scripts and produce 1–2 full creatives — for **real brands**, not fake practice projects. Research each brand (15–20 min, Section 9) before producing anything. Post the work as content on your own profile (this doubles as the portfolio needed for outreach credibility in Section 11).

By day 30 (realistic, if done consistently): 100–150 scripts/creatives produced, 5–10 live conversations with brand owners, a real portfolio, and — if not before — a strong foundation for the first retainer client even if it lands slightly later than 30 days.

---

## 11. OUTREACH PLAYBOOK

### Profile readiness (do this before sending a single message)
**Instagram:** public account, professional but approachable profile photo (face clearly visible, forehead to chin, smiling, eyes visible — not a logo), optimized bio using the formula `"I help [niche] achieve [specific result] using [method]"` (e.g., "I help e-commerce brands create 20+ AI UGC ads per month, faster and cheaper than hiring creators"), at least 9 posts showing sample work/before-after breakdowns/results, active story sequences, verification if possible.

**LinkedIn:** same headline formula, an About section whose first 1–2 lines (before "See more") are compelling enough to force the click, proof + credibility + a clear CTA in the full About section. LinkedIn is a slower, higher-quality, longer-term channel — pair push (DMs) with pull (daily posting, commenting on niche posts, consistent connection requests with a short non-pitchy note).

**Email:** send from a private domain email (e.g., `you@yourbrand.store`), never a generic Gmail — dramatically improves primary-inbox deliverability. Use a creative, curiosity-driven subject line (not "Quick Ad Idea for X" verbatim — riff on it).

### Email template
```
Subject: [creative, curiosity-driven — riff on "Quick Ad Idea for {Brand}"]

Hey [Founder Name],

I was going through your ads and noticed you're mostly running [observed pattern —
e.g. short UGC creatives targeting 18-40 year olds].

I came up with a different concept targeting a new angle: [the specific gap you found].
I think it could really test well for you.

Here's a quick script/creative I put together: [Google Doc / Drive link]

No strings attached — I just thought it was worth sharing.
```

### The 4-stage DM flow (Instagram and LinkedIn both use this — only "Step Zero," profile prep, differs)

**Stage 1 — Permission message** (personalized, not evergreen; use their name and something specific about their brand):
```
Hey [Name], [Your name] here. Love what you're doing with [specific detail about their product].
I want to be transparent — we help [their category] brands like yours create 20+ AI UGC
ads a month and scale systematically.
If you want, I can send a quick video on how we've helped clients scale to $X/month.
Reply with a 👍 if you want me to send it over.
```
Lowers their guard by asking permission before pitching.

**Stage 2 — Evergreen VSL**: a ~2-minute video, recorded once and reused for every prospect, covering who you help, results, testimonials/social proof, and the offer. End with the same thumbs-up CTA.

**Stage 3 — Book a call**: once they respond positively, send a Calendly (or similar) link, framed as a low-pressure conversation, not a sales pitch.

**Stage 4 — Follow-up**: if they go cold at any stage, send up to **7 follow-ups** (short texts, memes, light check-ins) before marking the lead dead. Expect some people to block you — that's part of the game, not a signal to soften the strategy.

### On LinkedIn specifically
Send the connection request first with a short, non-pitchy personalized note. Wait 24–48 hours after acceptance before sending the Stage 1 permission message. Because of connection-volume limits, favor quality and personalization over Instagram's higher-volume cadence. Master one platform fully before adding a second.

### Volume & realistic benchmarks
Start at ~20 DMs/day and warm the account up gradually — mass generic outreach gets accounts restricted. Realistic funnel math (do not expect better without a real edge): **100 outreached → ~30 see it → ~10 interested → 2–4 book a call → ~1 closes.** This is a normal push-marketing conversion rate, not a sign the strategy is broken.

---

## 12. WORKFLOW MAP — HOW THE SKILLS FIT TOGETHER

1. **Find prospects** → `lead-generator` (builds a CSV of small, founder-run, physical-product brands with public emails).
2. **Research the chosen brand + decide the angle** → Sections 6–9 of this skill (Meta Ads Library research, gap-finding, hyperdopamine framework, awareness-level targeting).
3. **If a recurring brand character/spokesperson/mascot is involved across a campaign** → `story-bible-builder` once, up front, to lock voice/movement/aesthetic canon. Skip for a one-off single ad.
4. **Build the character/product image assets** (the still references the video prompt will attach) → `banana-pro-director-30`: Mode 0 to lock a new character's face, Mode 1 to put an outfit on them, Mode 2 for a multi-angle character sheet, Mode 3 for a full environment/scene plate.
5. **Write the actual video prompt**:
   - A 15-second UGC selfie-review ad (the highest-converting, lowest-cost format from Section 7 — "don't make ads look like ads") → `ugc`, which runs its own guided pipeline end-to-end (character → product/scene → script → master prompt).
   - Anything more produced — narrative/story ads, action or demo sequences, dialogue between characters, lipsync/musical ads, ensemble ads, or any ad needing precise camera/physics/lighting control → `cinema-director-v3`, the full Seedance 2.0/2.5 + Higgsfield video-prompt engine.
   - A quick single cinematic shot or a simple multi-reference sequence with no need for the full production-document format → `seedance-clean` / `seedance-multishot-prompter` respectively.
6. **Generate** — hand the finished prompt (and any staged reference images) to Higgsfield via MCP if connected, or paste it into the generator of choice.
7. **Reach out with the finished asset** → Section 11 outreach playbook of this skill (email template, DM flow, LinkedIn approach).
8. **Once a client is live**, apply Section 7 (scaling hacks) and Section 6 (algorithm mechanics) to their actual ad account, and Section 8 (17-step offer structure) to their landing page/offer if that's in scope.

When in doubt about which skill to reach for: **strategy and psychology questions stay in this file; character/environment image prompts go to `banana-pro-director-30`; recurring-character canon goes to `story-bible-builder`; video prompts go to `ugc` (guided UGC) or `cinema-director-v3` (everything else, with `seedance-*` as lighter fallbacks); list-building goes to `lead-generator`.**
