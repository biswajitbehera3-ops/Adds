# AI Ads Agency — project guide

This project turns Claude into a one-person AI-ads agency: it researches brands, decides winning ad angles using real direct-response and virality psychology, builds consistent AI character/product image assets, writes production-grade video prompts, and runs the cold-outreach process to land paying clients.

## The skills, grouped by job

| Group | Skill | Job |
|---|---|---|
| **Strategy** | `ad-strategist` | The brain: ad psychology, market awareness, the "hyperdopamine ad" framework, virality psychology, Meta/Facebook algorithm mechanics, scaling hacks, the 17-step offer structure, brand research method, the 30-day client-acquisition roadmap, and the full cold-outreach playbook. Always consulted before any creative gets written. |
| **Leads** | `lead-generator` | Builds a real, ready-to-send CSV lead list of small, founder-run, physical-product brands to pitch. |
| **World / recurring character** | `story-bible-builder` | *Optional.* Interviews you about a recurring brand character, spokesperson, or mascot (voice, movement, backstory, aesthetic) and outputs an installable canon skill so every future ad for that character/brand stays consistent without re-explaining it each session. Only needed when a character/world recurs across multiple ads or a campaign. |
| **Character & image assets** | `banana-pro-director-30` | The Higgsfield **image**-prompt director. Builds the actual reference images every video prompt needs: a locked character face (Mode 0), an outfit on that character (Mode 1), a 3-panel character sheet (Mode 2), or a full cinematic/environment scene plate (Mode 3) — plus a GPT-2 high-fidelity detail mode and an outfit-swap mode. Everything it outputs is a Nano Banana Pro / GPT-2 / Soul Cinema **image** prompt, never a video prompt. |
| **Video prompts — guided UGC pipeline** | `ugc` | The `/ugc` pipeline: the fastest path to one specific, extremely common ad type — a 15-second UGC selfie-review video (a "creator" talking to camera about a product). Walks model → product/scene → script → assembles the final Seedance master prompt itself. |
| **Video prompts — full cinema grammar** | `cinema-director-v3` | The general-purpose Seedance 2.0/2.5 + Higgsfield **video** prompt engine. Use for anything beyond the UGC-selfie format: narrative/story ads, action or demo sequences, dialogue scenes, lipsync/musical ads, performance/concert-style ads, multi-character ensemble ads, or any ad needing precise camera, physics, or lighting control. Supersedes the two skills below for anything non-trivial. |
| **Video prompts — legacy/simple** | `seedance-clean`, `seedance-multishot-prompter` | Lighter-weight Seedance prompt writers. Kept for quick single-shot prompts or simple multi-reference sequences where `cinema-director-v3`'s full production-document format is more than the job needs. Not the default — see routing rules below. |

## What kind of video actually gets produced

This project can now brief two broad classes of ad video, both ending in a Seedance/Higgsfield-ready prompt:

1. **UGC selfie-review ads** (`ugc`) — a person on their phone reviewing/reacting to the product, front/back camera switches, 15 seconds, iPhone-realism aesthetic. This is the highest-conversion, lowest-production-cost format from the `ad-strategist` research (native-feeling, doesn't look like an ad).
2. **Full cinematic ad video** (`cinema-director-v3`) — anything else: a narrative mini-story, a product-hero/demo sequence, an action or lifestyle sequence, a dialogue-driven scene between two characters, a lipsync/musical ad, a performance/concert-style ad, or an ensemble/multi-character ad. This uses real camera registers (locked-off to violent handheld), true physics, dialogue/lipsync protocols, and can run single continuous shots or full multi-shot sequences up to 30 seconds on Seedance 2.5.

Which one gets used depends entirely on the ad angle decided in `ad-strategist` (Section 9's brand-gap research, Section 3's hyperdopamine framework) — not on which skill happens to be open. A "raw native" or "breaking news" style ad (Section 7 of `ad-strategist`) is almost always a UGC-style ad → `ugc`. A more produced, story-driven, or demo-heavy angle → `cinema-director-v3`.

## The full pipeline, in order

1. **Find prospects** (if needed) → `lead-generator`.
2. **Research the brand + decide the angle** → `ad-strategist` (Meta Ads Library research, gap-finding, hyperdopamine framework, market-awareness targeting). Do this before touching any image or video prompt skill — never skip to prompt-writing with a generic angle.
3. **If a recurring brand character/spokesperson is involved** (a mascot, a repeat creator across many ads, a series/campaign) → run `story-bible-builder` once to lock voice, movement, and aesthetic canon. Skip this for a one-off single ad.
4. **Build the character/product image assets**:
   - New character, no existing reference → `banana-pro-director-30` Mode 0 (face lock), then Mode 1 (outfit).
   - Character sheet for downstream consistency → `banana-pro-director-30` Mode 2.
   - A full environment/scene still (with or without the character) → `banana-pro-director-30` Mode 3.
   - Exception: if you're going straight into the `ugc` pipeline for a simple 15s selfie-review ad, `ugc`'s own Step 1 can generate the headshot/full-body prompts inline — but for anything that needs to stay consistent across *multiple* ads or needs the highest fidelity, route Step 1 through `banana-pro-director-30` instead and feed the resulting locked character reference into `ugc` Step 2.
5. **Write the actual video prompt**:
   - 15s UGC selfie-review ad → `ugc` (assembles its own master prompt end to end).
   - Anything more produced/narrative/action/dialogue/lipsync → `cinema-director-v3`. State the target Seedance version (2.0 or 2.5) up front — it changes reference-count and runtime ceilings.
   - A quick single cinematic shot with no need for the full production-document format → `seedance-clean`.
   - A cut sequence built from several already-uploaded reference images with no need for the full spine → `seedance-multishot-prompter`.
6. **Generate.** If Higgsfield is connected via MCP, Claude can take the finished prompt, stage the reference images (`media_upload`/`media_confirm`), and call `generate_image`/`generate_video` (or the batch variants) directly instead of you pasting into an external tool. Otherwise, copy the delivered prompt into your generator of choice.
7. **Pitch it** → the outreach playbook inside `ad-strategist` (email template, 4-stage DM flow, LinkedIn approach, follow-up cadence).

## Generation & cost policy (locked)

Claude runs the generations on Higgsfield — it does not stop at delivering prompt text. Three rules govern every run:

1. **Quote before spending.** Before any `generate_image` / `generate_video` / batch call, post a cost line in chat: model, duration, resolution, mode, aspect, number of generations, and the estimated credit spend against the current balance (`balance`). No quote, no generation.
2. **Wait for an explicit go-ahead.** The user must say to generate, in reply to that quote. An earlier approval never carries over to a later run — each generation gets its own quote and its own yes. This holds even mid-pipeline.
3. **Inspect and report honestly.** After every run, retrieve the result (`jobs_wait` → `show_generation_by_ids`) and actually look at it. Report what is wrong — drifted face, wrong product, bad lipsync, off-brand lighting — before the user has to spot it. Log the real credits charged (`transactions`) so the next quote is calibrated against real spend, not a guess.

The Higgsfield MCP exposes no per-generation price list, so early quotes are estimates built from the cost levers (duration, resolution, `mode: fast` vs `std`, `bitrate_mode`, batch size). Reconcile each estimate against `transactions` after the run and tighten the next one.

**Meta Ads account `308993292991518` is a test account.** Research (`ads_library_search`, benchmarks, insights) is free to run at any time. Anything that creates, spends, or publishes — campaigns, ad sets, creatives, boosts — needs the same explicit per-action go-ahead as a generation.

## Routing rules — avoiding overlap between skills

Several of these skills cover similar ground on purpose (different levels of control). Default to the more specific/powerful skill unless the user asks for the lighter one by name:

- **Character/outfit/sheet image prompts** → always `banana-pro-director-30`. (There is no separate `character-builder` skill in this project — it was superseded and dropped to avoid duplicate triggers.)
- **Video prompts of any real complexity** (dialogue, physics, multi-character, lipsync, action) → `cinema-director-v3`, not `seedance-clean`/`seedance-multishot-prompter`. Only use the legacy two when the user explicitly names them or the ask is genuinely a single simple shot.
- **A guided, fully-automatic 15s UGC ad** (the user doesn't want to make cinematography decisions) → `ugc`. A more hands-on, cinematically controlled ad → `cinema-director-v3`.
- **Marketing/psychology/algorithm/outreach questions** stay in `ad-strategist` — none of the image/video/character skills invent the marketing angle themselves.

If `story-bible-builder` has produced a canon skill for this project's brand/character, that installed skill becomes the identity/voice/world source and `cinema-director-v3` (or `banana-pro-director-30` for images) pulls from it — see each skill's own "bible handoff" notes.

## Hinglish AI-host podcast channel (`podcast/`)

A second project in this repo: a Hinglish explainer/news video-podcast with two 3D AI hosts (the Genius and the Questioner). Voice, audience and show rules: `podcast/youtube/voice.md`; colours/fonts/loudness: `podcast/brand/brand-kit.json`.

| Job | Skill / tool |
|---|---|
| Ideas, scripts, hooks | `yt-viral`, `yt-script`, `yt-plan` |
| Character faces, expressions, emotion test clips | `podcast/tools/emote/genius_emote.py` (LivePortrait, local CPU) |
| See any video | `pod-watch` |
| Motion graphics (Claude picks the style itself) | `pod-motion-library` → `pod-effects` (HyperFrames, `podcast/effects/`) or `pod-manim` (charts/diagrams) |
| Captions | `pod-captions` (+ `pod-style-caption` for Shorts) — Remotion `PodCaptions` |
| Sound | `pod-sound` |
| Render | `pod-render` (Remotion `podcast/remotion`, always `--browser-executable=/opt/pw-browsers/chromium`) |
| Review before anything ships | `pod-review-gate` |
| Shorts from an episode | `pod-shorts-export` (+ `yt-shorts`) |
| Upload kit | `pod-package` (+ `yt-package`, `yt-seo`, `yt-chapters`) |
| Shell helpers | `python3 -I podcast/tools/pod.py -h` (watch, audio, loudnorm, check, fx, overlay, clip, captions) |
| Ready-made effects, titles, lower-thirds, tickers, transitions, charts, maps | `hyperframes:hyperframes-registry` (check it before hand-building any named visual) |
| Any HyperFrames build or render | `hyperframes:hyperframes` (read first) + `hyperframes:hyperframes-cli` |
| Copy the style of a reference video the user shows | `hyperframes:reverse-any-video` / `hyperframes:style-sampling` |
| Footage/images look dull, need a look or a cut-out | `hyperframes:media-use` |
| Channel/competitor questions | `yt-viral`, `yt-audit`; after publishing: `yt-retention`, `yt-comment` |
| A full explainer insert (10-60 s cut-away from the studio) in a designed film style | `lemo-opuscar` — one skill, 99 code-rendered styles (library cloned at `~/lemo-opuscar`, style index `~/lemo-opuscar/styles/README.md`) |

**Lemo-Opuscar styles to reach for first** (pick by story, don't ask): breaking/world news → `news-package`, `caption-news`, `countdown`; where it happened → `satellite-briefing`, `dataviz` (maps), `transit-map`; what really happened in a viral clip → `visual-investigation`, `telestrator`, `archive-lighttable`; numbers → `dataviz`, `data-physical`, `spreadsheet`; how a machine/tech works (cars, rockets, phones) → `teardown`, `hardcore-info`, `precise-mechanism`, `blueprint`, `iso-infographic`; quick concept explainers → `whiteboard`, `stick-explainer`, `sketchnote`, `ipad-sketch`, `flat-space-explainer`; AI/tech → `dark-keynote`, `hologram-hud`; history/flashback → `newsreel`, `halftone-dossier`, `comic-history`; dramatic/serious → `dark-documentary`, `kino-montage`. Licence: films we make with it are ours, commercial use included; its docs/prompts are CC BY-NC (fine to follow for our films, not to resell). Styles marked ✦ need a paid image generator → quote first.

**Use these skills on your own (user rule, 2026-11-22).** The user installed the `yt-*`, `pod-*`, `hyperframes:*` and `lemo-opuscar` skills so they never have to name them. Whenever a podcast task matches a row above, load that skill and follow it without asking which one; chain them in pipeline order (script → characters → graphics → captions → sound → render → review → package) and say in one line which skills were used. The rules that still need a yes are unchanged: anything paid (Higgsfield), downloads from Epidemic Sound, and publishing anything.

HyperFrames versions: the plugin skills are written for 0.9.x; `podcast/effects/` is pinned to 0.8.147 (tested). Upgrade the pin (and re-test a render) the first time a registry block needs 0.9.

Free first: Kaggle GPU (weekly quota) and local tools; Higgsfield follows the generation & cost policy above.
