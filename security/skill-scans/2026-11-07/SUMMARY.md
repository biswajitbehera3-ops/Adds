# Skill scan, 7 Nov 2026 (SkillSpector e48d771, static scan `--no-llm`)

Every skill in `.claude/skills/` scanned, then each HIGH finding read in its source (skill-inspector method). Account-level skills synced into sessions (Anthropic's docx/pptx/xlsx/pdf, skill-creator, import-memory and others) scored 100 for the same kind of false alarms: `rm -f` of their own output, `os.environ` passed to a local `claude` subprocess, and import-memory quoting "ignore previous instructions" as text to refuse. Not stored here (they are not in this repo).

| Score | Skill | Scanner says | Findings | Review |
|---:|---|---|---|---|
| 100 | security-audit | DO_NOT_INSTALL | 10 high, 3 medium, 1 low | APPROVE: a security reference; mentions of keychain, credentials.json and /etc/passwd are teaching text and test fixtures. |
| 100 | graphify | DO_NOT_INSTALL | 7 high, 7 medium | APPROVE: 'without warning' is a rule to warn the user; rm lines delete its own temp files in graphify-out/. |
| 81 | real-sound | DO_NOT_INSTALL | 6 high, 15 medium | APPROVE: subprocess runs ffmpeg/its own scripts with list arguments (no shell); one download compares a sound with its licensed original. |
| 22 | yt-dlp | CAUTION | 4 medium | APPROVE: runs yt-dlp/ffmpeg to download what the user asks for; that is its job. |
| 21 | story-bible-builder | CAUTION | 1 high | APPROVE: 'Output prompts' is a heading, not prompt extraction. |
| 21 | seedance-multishot-prompter | CAUTION | 1 high | APPROVE: 'Output Rules' is a heading, not prompt extraction. |
| 16 | google-maps-scraper | SAFE | 3 medium | APPROVE: read in full before install (31 Oct); runs the scraper engine on localhost. |
| 8 | ugc | SAFE | 1 medium | APPROVE: no findings that need review. |
| 7 | whoop-clipper | SAFE | 1 medium | APPROVE: no findings that need review. |
| 7 | founder-pricing | SAFE | 1 medium | APPROVE: no findings that need review. |
| 7 | founder-plan | SAFE | 1 medium | APPROVE: no findings that need review. |
| 7 | founder-consumer | SAFE | 1 medium | APPROVE: no findings that need review. |
| 7 | founder-cfo | SAFE | 1 medium | APPROVE: no findings that need review. |
| 7 | cinema-director-v3 | SAFE | 1 medium | APPROVE: no findings that need review. |
| 7 | ad-teardown | SAFE | 1 medium | APPROVE: no findings that need review. |
| 0 | seedance-clean | SAFE | none | APPROVE: no findings that need review. |
| 0 | lead-generator | SAFE | none | APPROVE: no findings that need review. |
| 0 | founder-ops | SAFE | none | APPROVE: no findings that need review. |
| 0 | founder-offer | SAFE | none | APPROVE: no findings that need review. |
| 0 | founder-marketing | SAFE | none | APPROVE: no findings that need review. |
| 0 | founder-launch | SAFE | none | APPROVE: no findings that need review. |
| 0 | founder-competitors | SAFE | none | APPROVE: no findings that need review. |
| 0 | founder-brand | SAFE | none | APPROVE: no findings that need review. |
| 0 | founder-board | SAFE | none | APPROVE: no findings that need review. |
| 0 | earshot | SAFE | none | APPROVE: no findings that need review. |
| 0 | banana-pro-director-30 | SAFE | none | APPROVE: no findings that need review. |
| 0 | apple-design | SAFE | none | APPROVE: no findings that need review. |
| 0 | ad-strategist | SAFE | none | APPROVE: no findings that need review. |

A score is pattern matching, not proof. Re-scan after a skill is updated; scan every new skill before installing it (CLAUDE.md).
