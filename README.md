# AI Ads Agency

Everything from your source material — the client-acquisition transcript, the Meta ads hacks, the "$200M on Facebook ads" playbook, the algorithm breakdown, the 11-step marketing roadmap, the virality-psychology breakdown, plus your character/image/video-prompt skills — assembled into one Claude Code project.

## Setup

1. Unzip this and open the `AI-Ads-Agency` folder in Claude Code (as its own project).
2. Claude reads `CLAUDE.md` automatically and knows how all the skills fit together.
3. Just talk naturally: "find me 30 skincare brands to pitch," "research [brand] and find their gap," "build me a character for this UGC ad," "write me a cinematic ad for [product]," "write my outreach email for [brand]."

## What's inside

- `.claude/skills/ad-strategist/` — the consolidated psychology/algorithm/outreach playbook built from all the transcripts.
- `.claude/skills/lead-generator/` — builds a CSV lead list of small, founder-run brands to pitch.
- `.claude/skills/story-bible-builder/` — optional: locks a recurring brand character/spokesperson's voice, movement, and world canon across a whole campaign.
- `.claude/skills/banana-pro-director-30/` — builds the actual character/outfit/product/scene **image** references (Higgsfield Nano Banana Pro / GPT-2 / Soul Cinema) that video prompts attach.
- `.claude/skills/ugc/` — the guided pipeline for a 15-second UGC selfie-review ad, start to finish.
- `.claude/skills/cinema-director-v3/` — the full Seedance 2.0/2.5 + Higgsfield **video**-prompt engine for anything more produced than a UGC selfie video (narrative, action, dialogue, lipsync, multi-character).
- `.claude/skills/seedance-clean/` and `.claude/skills/seedance-multishot-prompter/` — lighter-weight fallback video-prompt writers for simple single-shot or multi-reference jobs.

**Note:** the `character-builder` skill you uploaded earlier was dropped from this package — `banana-pro-director-30` supersedes it (same job, more modes, higher fidelity options). Say the word if you want it kept alongside instead.

See `CLAUDE.md` for the full recommended pipeline order: research → strategy → (optional) story bible → character/image assets → video prompt → generate → outreach.
