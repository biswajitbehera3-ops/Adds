# AI Ads Agency — project guide

This project turns Claude into a one-person AI-ads agency: it finds prospects, researches brands, tears down competitors' winning ads, decides winning angles using real direct-response and virality psychology, builds consistent AI character/product image assets, writes production-grade video prompts, runs the generations on Higgsfield, and runs the cold-outreach process to land paying clients.

**There is no application here.** This repository is a skill pack plus operator documentation — Markdown instructions Claude Code loads, and three small Python helper scripts. There is no build, no test suite, no dependency manifest, and nothing to compile or run. Do not go looking for one. Changes are edits to Markdown.

## Repository layout

```
CLAUDE.md                  ← this file: pipeline order, routing rules, cost policy
README.md                  ← short pitch/orientation for a new operator
SETUP.md                   ← running locally, MCP servers, yt-dlp/ffmpeg, session memory
HEADTRIXX-BRIEF.md         ← live client handover; read before any Headtrixx work
.claude/skills/            ← the eleven skills, auto-loaded on session start
  <skill>/SKILL.md         ← every skill is one Markdown file with YAML frontmatter
  story-bible-builder/references/   ← long-form material split out of the SKILL.md
  yt-dlp/scripts/*.py      ← the only executable code in the repo
```

## The skills, grouped by job

| Group | Skill | Job |
|---|---|---|
| **Strategy** | `ad-strategist` | The brain: 12 numbered sections covering ad psychology, market awareness, the "hyperdopamine ad" framework, copywriting rules, virality psychology, Meta/Facebook algorithm mechanics, scaling hacks, the 17-step offer structure, the brand-research method (§9), the 30-day client-acquisition roadmap, the cold-outreach playbook (§11), and its own workflow map (§12). Always consulted before any creative gets written. Cite sections by number when handing off. |
| **Competitor research** | `ad-teardown` | Reverse-engineers a competitor's video ad from a URL: Playwright-screenshots the Meta Ads Library creative, pulls the transcript, extracts frames with ffmpeg, then dissects hook/structure/psychology against `ad-strategist`. This is the skill that actually executes `ad-strategist` §9. **Local-only** — needs `yt-dlp`, `ffmpeg`, Playwright MCP and unrestricted network. |
| **Leads** | `lead-generator` | Builds a real, ready-to-send CSV lead list of small, founder-run, physical-product brands to pitch. Web search and fetch only — it never drives a browser or an app on the user's machine. |
| **World / recurring character** | `story-bible-builder` | *Optional.* Interviews you about a recurring brand character, spokesperson, or mascot (voice, movement, backstory, aesthetic) and outputs an installable canon skill so every future ad for that character/brand stays consistent without re-explaining it each session. Only needed when a character/world recurs across multiple ads or a campaign. |
| **Character & image assets** | `banana-pro-director-30` | The Higgsfield **image**-prompt director, six modes: (0) locked character face, (1) an outfit on that character, (2) a 3-panel character sheet (6-panel is legacy, on explicit request only), (3) a full cinematic/environment scene plate, (4) GPT-2 high-fidelity detail, (5) outfit swap from two refs. Everything it outputs is a Nano Banana Pro / GPT-2 / Soul Cinema **image** prompt, never a video prompt. |
| **Video prompts — guided UGC pipeline** | `ugc` | The `/ugc` pipeline: the fastest path to one specific, extremely common ad type — a 15-second UGC selfie-review video (a "creator" talking to camera about a product). Walks model → product/scene → script → assembles the final Seedance master prompt itself. Explicitly stateless: it never reads or writes memory files. |
| **Video prompts — full cinema grammar** | `cinema-director-v3` | The general-purpose Seedance 2.0/2.5 + Higgsfield **video** prompt engine, built on a locked 16-slot spine. Use for anything beyond the UGC-selfie format: narrative/story ads, action or demo sequences, dialogue scenes, lipsync/musical ads, performance ads, multi-character ensembles, or any ad needing precise camera, physics, or lighting control. Supersedes the two skills below for anything non-trivial. |
| **Video prompts — legacy/simple** | `seedance-clean`, `seedance-multishot-prompter` | Lighter-weight Seedance prompt writers. Kept for quick single-shot prompts or simple multi-reference sequences where `cinema-director-v3`'s full production-document format is more than the job needs. Not the default — see routing rules below. |
| **Repurposing** | `whoop-clipper` | Long video in, short vertical clips out — chooses the moments against hook psychology, cuts and captions them, scores them with `virality_predictor` before they ship. Two paths: Higgsfield `personal_clipper_create` (YouTube, automated, 30+ min runtime) or `yt-dlp` + `ffmpeg` (local files, exact timecodes, free). Not for generating new AI video. |
| **Plumbing** | `yt-dlp` | Downloads video and extracts audio from YouTube, X, Vimeo, TikTok, Instagram, Facebook. Ships three CLI scripts in `scripts/` (`download_video.py`, `extract_audio.py`, `extract_urls.py`). Used by `ad-teardown` and `whoop-clipper` rather than on its own. |

## What kind of video actually gets produced

Two broad classes of ad video, both ending in a Seedance/Higgsfield-ready prompt:

1. **UGC selfie-review ads** (`ugc`) — a person on their phone reviewing/reacting to the product, front/back camera switches, 15 seconds, iPhone-realism aesthetic. This is the highest-conversion, lowest-production-cost format from the `ad-strategist` research (native-feeling, doesn't look like an ad).
2. **Full cinematic ad video** (`cinema-director-v3`) — anything else: a narrative mini-story, a product-hero/demo sequence, an action or lifestyle sequence, a dialogue-driven scene, a lipsync/musical ad, a performance ad, or an ensemble/multi-character ad. This uses real camera registers (locked-off to violent handheld), true physics, dialogue/lipsync protocols, and can run single continuous shots or full multi-shot sequences.

Seedance version matters and must be established up front: **2.0 caps at 9 image references and 15 seconds; 2.5 allows 50 and 30.**

Which format gets used depends entirely on the ad angle decided in `ad-strategist` (§9's brand-gap research, §3's hyperdopamine framework) — not on which skill happens to be open. A "raw native" or "breaking news" style ad (§7) is almost always a UGC-style ad → `ugc`. A more produced, story-driven, or demo-heavy angle → `cinema-director-v3`.

## The full pipeline, in order

1. **Find prospects** (if needed) → `lead-generator`.
2. **Research the brand + decide the angle** → `ad-strategist` (Meta Ads Library research, gap-finding, hyperdopamine framework, market-awareness targeting). Do this before touching any image or video prompt skill — never skip to prompt-writing with a generic angle.
3. **Tear down what the competition is already running** → `ad-teardown`, on the strongest ad in the category. `ad-strategist` §9 requires this and cannot do it itself. Requires a local session (see below).
4. **If a recurring brand character/spokesperson is involved** (a mascot, a repeat creator across many ads, a series/campaign) → run `story-bible-builder` once to lock voice, movement, and aesthetic canon. Skip this for a one-off single ad.
5. **Build the character/product image assets**:
   - New character, no existing reference → `banana-pro-director-30` Mode 0 (face lock), then Mode 1 (outfit).
   - Character sheet for downstream consistency → Mode 2 (3-panel).
   - A full environment/scene still (with or without the character) → Mode 3.
   - Exception: for a simple 15s selfie-review ad, `ugc`'s own Step 1 can generate the headshot/full-body prompts inline — but for anything that needs to stay consistent across *multiple* ads or needs the highest fidelity, route Step 1 through `banana-pro-director-30` and feed the locked character reference into `ugc` Step 2.
6. **Write the actual video prompt**:
   - 15s UGC selfie-review ad → `ugc` (assembles its own master prompt end to end).
   - Anything more produced/narrative/action/dialogue/lipsync → `cinema-director-v3`. State the target Seedance version (2.0 or 2.5) up front.
   - A quick single cinematic shot with no need for the full production-document format → `seedance-clean`.
   - A cut sequence built from several already-uploaded reference images → `seedance-multishot-prompter`.
7. **Generate.** With Higgsfield connected via MCP, Claude stages the reference images (`media_upload_widget` / `media_upload` → `media_confirm`) and calls `generate_image` / `generate_video` (or the batch variants) directly — subject to the cost policy below. Without it, deliver the prompt text for the user to run.
8. **Repurpose** (optional) → `whoop-clipper` for vertical cutdowns of any long-form footage.
9. **Pitch it** → the outreach playbook in `ad-strategist` §11 (email template, 4-stage DM flow, LinkedIn approach, follow-up cadence).

## Generation & cost policy (locked)

Claude runs the generations on Higgsfield — it does not stop at delivering prompt text. Three rules govern every run:

1. **Quote before spending.** Before any `generate_image` / `generate_video` / batch / `personal_clipper_create` call, post a cost line in chat: model, duration, resolution, mode, aspect, number of generations, and the estimated credit spend against the current balance (`balance`). No quote, no generation.
2. **Wait for an explicit go-ahead.** The user must say to generate, in reply to that quote. An earlier approval never carries over to a later run — each generation gets its own quote and its own yes. This holds even mid-pipeline. Silence is not consent.
3. **Inspect and report honestly.** After every run, retrieve the result (`jobs_wait` → `show_generation_by_ids`) and actually look at it. Report what is wrong — drifted face, wrong product, gibberish label text, bad lipsync, off-brand lighting — before the user has to spot it. Log the real credits charged (`transactions`) so the next quote is calibrated against real spend, not a guess.

The Higgsfield MCP exposes **no per-generation price-list tool** — the levers are `balance`, `transactions` and `show_plans_and_credits`, so an early quote is an estimate built from duration, resolution, `mode: fast` vs `std`, `bitrate_mode`, and batch size. Say plainly that it is an estimate, then reconcile against `transactions` after the run and tighten the next one. (`HEADTRIXX-BRIEF.md` refers to a `get_cost` call; no such tool exists in the current MCP surface — use `balance` + `transactions`.)

Costs verified against real transactions so far:

| What | Real cost |
|---|---|
| Image, `nano_banana_pro` | 2 credits |
| Video, Seedance 2.5 | 65–143 credits per run |
| `personal_clipper_create` | unknown — no preflight; reconcile after the first run |

At a couple hundred credits that is a handful of video generations with no room for retries. Budget accordingly: consider a cheap low-resolution `fast` calibration pass before committing to a full render.

**Meta Ads account `308993292991518` is a test account.** Research (`ads_library_search`, benchmarks, insights) is free to run at any time. Anything that creates, spends, or publishes — campaigns, ad sets, creatives, boosts — needs the same explicit per-action go-ahead as a generation.

## Cloud session vs local machine

This matters more than anything else about the environment, because half the pipeline does not work in a cloud session. A cloud session reaches only GitHub, package registries and MCP endpoints; there is no general egress.

**Works in both:** everything MCP-based — Higgsfield generation, Meta Ads Library research, Firecrawl — because those calls run on the provider's infrastructure either way. Plus all prompt writing, which is pure text.

**Local only:**

- **`ad-teardown` and `yt-dlp`** — video hosts are blocked in the cloud, so competitor ads cannot be downloaded or transcribed.
- **Viewing generated results** — a cloud container cannot fetch its own Higgsfield output back to inspect it. Locally, Playwright opens the result URL and screenshots it.
- **Seeing Meta Ads Library creatives** — the API returns link titles only; the creative lives behind an `ad_snapshot_url` that needs a browser.
- **`WebFetch` on arbitrary live brand pages.**

If a request needs one of these in a cloud session, say so and hand the user the exact local command rather than silently producing a weaker analysis. `SETUP.md` has the full local setup: Claude Code install, the five MCP servers (Higgsfield, Meta Ads, Firecrawl, GitHub, Playwright), `pip install yt-dlp` + `ffmpeg`, and optional MemPalace session memory.

## Routing rules — avoiding overlap between skills

Several skills cover similar ground on purpose (different levels of control). Default to the more specific/powerful skill unless the user asks for the lighter one by name:

- **Character/outfit/sheet image prompts** → always `banana-pro-director-30`. (There is no separate `character-builder` skill in this project — it was superseded and dropped to avoid duplicate triggers.)
- **Video prompts of any real complexity** (dialogue, physics, multi-character, lipsync, action) → `cinema-director-v3`, not `seedance-clean`/`seedance-multishot-prompter`. Only use the legacy two when the user explicitly names them or the ask is genuinely a single simple shot.
- **A guided, fully-automatic 15s UGC ad** (the user doesn't want to make cinematography decisions) → `ugc`. A more hands-on, cinematically controlled ad → `cinema-director-v3`.
- **A competitor's video URL pasted with an ads question** → `ad-teardown`, not bare `yt-dlp`. Downloading is a step inside the teardown, not the deliverable.
- **Cutting existing footage into shorts/reels** → `whoop-clipper`. **Generating new AI video** → `ugc` or `cinema-director-v3`. These never overlap.
- **Marketing/psychology/algorithm/outreach questions** stay in `ad-strategist` — none of the image/video/character skills invent the marketing angle themselves.

If `story-bible-builder` has produced a canon skill for this project's brand/character, that installed skill becomes the identity/voice/world source and `cinema-director-v3` (or `banana-pro-director-30` for images) pulls from it — see each skill's own "bible handoff" notes.

## Working on this repository

### Editing or adding a skill

- One skill = one directory under `.claude/skills/<name>/` containing `SKILL.md`. Claude Code loads them on session start; there is nothing to install or register.
- Frontmatter is exactly two keys: `name` (must match the directory) and `description`. The description is the trigger surface — write it as *when to use this*, packed with the literal phrases a user would type ("tear down this video", "build me a lead list"), and say what the skill is **not** for when a sibling skill covers the adjacent case. Ambiguous descriptions are how two skills end up fighting over the same request.
- Long reference material goes in a `references/` subdirectory (see `story-bible-builder`) rather than bloating `SKILL.md`. Executable helpers go in `scripts/` (see `yt-dlp`).
- When a skill hands off to another, name the target skill in backticks and, for `ad-strategist`, cite the section number. Cross-references are load-bearing.
- A new or renamed skill must be reflected everywhere it is listed or it drifts: the skill table above, the pipeline list, the routing rules, and the skill tables in `README.md` and `SETUP.md`.

### House style for the prose

These documents are the product. Match the existing register: direct, declarative, opinionated, second person. State the rule and the reason for it in the same breath. No filler, no hedging, no marketing voice. Guardrails are stated as hard locks ("No quote, no generation"), not suggestions.

### Client context

`HEADTRIXX-BRIEF.md` is the live client handover — brand, verified prices, founder story in their own words, the identified gap, the competitive picture, claim discipline, open decisions, and two generated images that were never inspected. Read it before any Headtrixx work, and update it when a decision is made or a job is inspected. It is curated by hand on purpose: automatic session memory answers "what did we say about X", a brief answers "what should the next session do".

### Git

- Develop on the assigned feature branch; never push to `main` directly.
- Push with `git push -u origin <branch-name>`; retry network failures with exponential backoff.
- Commit messages: short imperative subject describing the change to the pack ("Add whoop-clipper skill", "Document MemPalace session memory in setup").
- Only open a pull request when explicitly asked.

### Verifying a change

There are no tests. Verification is reading: confirm the frontmatter parses as YAML, the `name` matches the directory, every skill cross-reference names a skill that exists, and the skill lists in this file, `README.md` and `SETUP.md` agree with each other. `/skills` in a live session is the real check that a skill loads — eleven should be listed.
