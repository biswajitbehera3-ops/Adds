# voice.md — Hinglish AI-host podcast channel (read by every yt-* skill)

> Status: first draft (2026-11-22). Items marked **[TBD]** still need the owner's answer — ask once, then fill them in here.

## Who the channel is
A Hinglish video-podcast / explainer / news channel hosted by **two 3D animated characters** sitting in a studio room.
They break down **viral clips and breaking news** with genuinely smart explanations, while joking, teasing and mimicking each other.
The fun is the double act; the value is that the viewer actually understands the story by the end.

### The two hosts
| | **The Genius** | **The Questioner** |
|---|---|---|
| Role | Explains. High intelligence, connects the dots, knows the numbers and the "why". | Asks. High social reasoning — the sharp, valid question the viewer is thinking; reads the room, calls out jargon. |
| Look | Stylized 3D caricature: curly black hair, thick black glasses, big pink nose, cream cardigan + green knit vest (locked: `podcast/assets/characters/genius/genius_hero_locked.png`) | Baseball cap with tilted bill, goatee, track jacket — **being redesigned in the same 3D look** |
| Comic engine | Over-explains, gets excited about details, gets roasted for it; "Aage suno…" | Deflates the Genius, mimics his lecture voice, asks the "seedha bolo" question |
| Names | **[TBD]** | **[TBD]** |

The two never fully agree on everything — light teasing, never mean. Each episode the Questioner wins at least one point.

## Language
**Hinglish**: Hindi sentence structure, English for tech / news / numbers words, natural code-switching the way urban Indian 18-35s talk.
Scripts are written in **Roman Hinglish** for reading, and in **Devanagari** for the TTS voice (Kokoro `hm_omega` / `hm_psi`, voice choice **[TBD]**). On-screen captions: Roman Hinglish.

## Who I am talking to
- **Main viewer:** Indian 16-35 **[TBD — confirm]**, scrolls Shorts/Reels, sees a viral clip or headline and wants to know "ye hua kya actually?" in 60 seconds to 10 minutes.
- They are smart but busy; they hate being lectured and hate jargon left unexplained.
- Not a kids' channel — **not Made for Kids**.

## Content pillars
| Pillar | What it is | Usual format |
|---|---|---|
| **Viral clip decoded** | A clip everyone is sharing → what's really going on, the science/money/tech behind it | Shorts 45-75 s + long cut |
| **Breaking news, simply** | A big news event (e.g. a US flight ground stop) → what happened, why, what it means for us | 5-10 min long-form + 2-3 Shorts |
| **Tech & future explained** | Launches, cars, AI, space (e.g. the Tesla Roadster explainer style) | Long-form with motion graphics |
| **Genius vs Questioner debates** | One question, two takes, viewer votes | Shorts |

## How they actually talk
- Cold open on the most surprising fact or the viral moment itself — no "hello doston, aaj ki video mein".
- Short lines, fast back-and-forth; nobody talks for more than ~3 sentences without the other interrupting.
- Analogies from Indian daily life (traffic, cricket, chai stall, train reservation, EMI) to explain big ideas.
- The Questioner restates the explanation in one desi line; the Genius says "exactly" or corrects it.
- Running bits: the Questioner mimicking the Genius ("Technically speaking…"), the Genius pretending to be offended.

## Words I never use
- "Shocking", "you won't believe", "gone wrong", "100% sach", fake urgency, rage bait.
- Communal, caste, gendered or body-shaming jokes; mocking real private people.
- "Like, share, subscribe karo warna…" style pressure. One light CTA at the end is fine.

## Words / phrases that are ours
"Seedha bolo." · "Ruko, ruko, ruko…" · "Simple bhasha mein?" · "Aage suno." · "Ab samjha!" **[TBD — add as the show finds its catchphrases]**

## What I will not claim
- **No invented facts, numbers, quotes or sources.** Every number in a script is from a named, checkable source; say "about" when rounding; say "abhi tak confirm nahi hai" when it isn't.
- Breaking news: separate what is confirmed from what is reported/rumoured, on screen and in the script.
- No financial, medical or legal advice; no "buy this stock" takes.
- Viral clips: use short excerpts with commentary (fair-use style) or recreate with motion graphics; credit the source; never re-upload someone's full video. No copyrighted music.
- Never present AI-generated visuals as real footage — label recreations ("AI recreation" / "Illustration").

## My format
- **Shorts:** 1080x1920, 45-75 s, hook in the first 2 s, both hosts visible or cut between them, big word-by-word Hinglish captions.
- **Long-form:** 16:9 (studio plate `podcast/assets/studio/studio_4k_v1.jpg`, camera setups in `podcast/remotion`), 5-10 min, chapters, motion graphics in the middle for data/maps/diagrams, cold open → explanation → "toh matlab kya?" takeaway → light outro.
- Upload cadence and capacity: **[TBD]**.
- Thumbnails: the two hosts' faces with a strong expression (from the character sheets) + 2-4 words of text.
- All production is free-first: Kaggle GPU, local tools; Higgsfield only after a cost quote and a yes.
