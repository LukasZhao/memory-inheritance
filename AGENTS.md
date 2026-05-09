# AGENTS.md

This repository uses Memory Inheritance.

## Required Context

Before making changes, read:
- `PROJECT_MEMORY.md`

`PROJECT_MEMORY.md` is the compact canonical project memory. It contains project intent, detected stack, important files, common commands, manual notes, architecture decisions, current development state, and memory references.

## Token-aware Reading Rule

Do not load all files under `.memory/` by default.
If more detail is needed, consult:
- `.memory/index.json`

Then read only the referenced memory files relevant to the current task.
Prioritize references with higher `criticality` scores when context is limited.

Examples:
- Editing CLI command routing -> read `.memory/modules/cli.md`
- Editing sync or marker behavior -> read `.memory/modules/markdown-sync.md`
- Editing generated templates -> read `.memory/modules/templates.md`
- Editing tests -> read `.memory/modules/testing.md`
- Understanding recent project changes -> read `.memory/modules/git-memory.md`

## Agent Workflow

1. Read `PROJECT_MEMORY.md`.
2. Consult `.memory/index.json` only when detailed context is needed.
3. Follow the project intent and constraints.
4. Keep changes small and focused.
5. Do not overwrite manual memory notes.
6. After meaningful changes, run:

```bash
npx mem-extract sync
```

7. If a change affects architecture, update the manual notes or architecture decision section.

## Rules

- Do not perform broad rewrites unless explicitly requested.
- Prefer incremental, testable changes.
- Explain major changes clearly.
- Do not treat memory files as disposable generated artifacts.
- Do not delete `.memory/` references unless explicitly requested.
