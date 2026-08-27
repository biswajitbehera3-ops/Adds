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

## Routing rules — avoiding overlap between skills

Several of these skills cover similar ground on purpose (different levels of control). Default to the more specific/powerful skill unless the user asks for the lighter one by name:

- **Character/outfit/sheet image prompts** → always `banana-pro-director-30`. (There is no separate `character-builder` skill in this project — it was superseded and dropped to avoid duplicate triggers.)
- **Video prompts of any real complexity** (dialogue, physics, multi-character, lipsync, action) → `cinema-director-v3`, not `seedance-clean`/`seedance-multishot-prompter`. Only use the legacy two when the user explicitly names them or the ask is genuinely a single simple shot.
- **A guided, fully-automatic 15s UGC ad** (the user doesn't want to make cinematography decisions) → `ugc`. A more hands-on, cinematically controlled ad → `cinema-director-v3`.
- **Marketing/psychology/algorithm/outreach questions** stay in `ad-strategist` — none of the image/video/character skills invent the marketing angle themselves.

If `story-bible-builder` has produced a canon skill for this project's brand/character, that installed skill becomes the identity/voice/world source and `cinema-director-v3` (or `banana-pro-director-30` for images) pulls from it — see each skill's own "bible handoff" notes.
