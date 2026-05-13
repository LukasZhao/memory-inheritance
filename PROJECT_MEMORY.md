# PROJECT_MEMORY.md

Memory Inheritance canonical project memory.
This file is designed to be read by AI coding agents and humans.
This file should stay compact. For detailed context, use `.memory/index.json` and read only the referenced memory files relevant to the current task.

<!-- AUTO-START:PROJECT-SCAN -->
## Project Overview

Project name: mem-extract

## Detected Tech Stack

- Node.js
- TypeScript

## Important Files and Folders

- README.md
- package.json
- tsconfig.json
- src
- templates
- tests

## Common Commands

- npm install
- npm run dev
- npm start
- npm run build
- npm test

## Memory References

Detailed memory files are indexed in `.memory/index.json`.

| ID | Area | Path | Criticality | When to read |
|---|---|---|---:|---|
| cli | CLI Architecture | `.memory/modules/cli.md` | 8 | changing CLI commands |
| markdown-sync | Markdown Safe Sync | `.memory/modules/markdown-sync.md` | 10 | editing sync behavior |
| templates | Generated Templates | `.memory/modules/templates.md` | 7 | editing generated memory files |
| testing | Testing Notes | `.memory/modules/testing.md` | 6 | editing tests |
| git-memory | Git Semantic Memory | `.memory/modules/git-memory.md` | 7 | understanding recent project changes |
| review | Memory Readiness Review | `.memory/modules/review.md` | 7 | implementing or modifying the review command |
| context-capture | Context Capture Commands | `.memory/modules/context-capture.md` | 8 | editing note command |

## Generated

- Generated at: 2026-05-13T06:37:15.543Z
<!-- AUTO-END:PROJECT-SCAN -->

<!-- AUTO-START:GIT-MEMORY -->
## Recent Development Memory

Generated from the latest 5 Git commits.

### Other changes

- Update README.md.
- Enhance README with detailed project information.
- Add Git semantic memory sync support.
- Fullfill token aware ai memory management system.
<!-- AUTO-END:GIT-MEMORY -->

## Manual Notes

Add human-maintained project intent, architecture notes, constraints, known issues, and TODOs here.
- [2026-05-11] customer requires all processing to stay local

## Architecture Decisions

Add important decisions here.
- [2026-05-11] Use Markdown as source of truth instead of a database

## Current Development State

Add current feature status here.

## Forbidden Tech/Patterns

Add hard project constraints here.
Example:
- Do not use Redux.
- Do not remove generated memory markers.
- Do not overwrite manual memory notes during sync.

## AI Collaboration Rules

- Read this file before making changes.
- Preserve project intent and architecture.
- Prefer small, testable changes.
- Do not load all files under `.memory/` by default.
- Use `.memory/index.json` to find relevant detailed memory.
- Prioritize high-criticality references when context is limited.
- Update memory after meaningful changes.
