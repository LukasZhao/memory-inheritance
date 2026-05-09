# Memory Inheritance

> Git remembers code history. Memory Inheritance remembers project context.

Memory Inheritance is a Node.js + TypeScript CLI that generates persistent, AI-readable project memory for coding agents such as Codex and Claude Code.

## Core Model

```text
PROJECT_MEMORY.md  = compact canonical memory
AGENTS.md          = Codex / generic agent adapter
CLAUDE.md          = Claude Code adapter
.memory/index.json = token-aware reference index with criticality scores
.memory/modules/   = detailed memory files loaded on demand
```

Adapters tell agents to read `PROJECT_MEMORY.md` first. Detailed memory is routed through `.memory/index.json` so agents read only what is relevant.

## Quick Start

```sh
cd your-project
npx mem-extract init
npx mem-extract status
```

## Commands

```sh
npx mem-extract init
npx mem-extract init --force
npx mem-extract sync
npx mem-extract sync --force
npx mem-extract sync --recent 10
npx mem-extract status
npx mem-extract inspect "Detected Tech Stack"
npx mem-extract inspect "Recent Development Memory"
npx mem-extract inspect ref:cli
npx mem-extract inspect ref:git-memory
npx mem-extract score list
npx mem-extract score explain
npx mem-extract score markdown-sync 10
```

- `init` creates top-level memory files, `.memory/index.json`, and placeholder module files without overwriting existing files.
- `sync` updates only generated memory sections and preserves manual notes.
- `sync --recent <n>` summarizes recent local Git commits into compact development memory.
- `status` reports project detection, memory files, Git state, reference count, and top critical references.
- `inspect` reads either a `PROJECT_MEMORY.md` section or a referenced module file.
- `score` lets developers set reference-level criticality on a 1-10 scale.

## Safe Sync

`PROJECT_MEMORY.md` uses explicit markers:

```md
<!-- AUTO-START:PROJECT-SCAN -->
...
<!-- AUTO-END:PROJECT-SCAN -->

<!-- AUTO-START:GIT-MEMORY -->
...
<!-- AUTO-END:GIT-MEMORY -->
```

Normal sync replaces only generated marker sections. Human-written notes outside markers are preserved.

Current sync uses explicit marker-based replacement. If future versions need complex section editing, consider a Markdown AST parser such as remark/mdast.

## Git Semantic Memory

`sync --recent <n>` uses local Git commands only. It does not call AI APIs, require API keys, make network calls, inspect diffs, or dump raw Git history.

Recent commits are grouped by conventional commit type:

- `feat`: Feature work
- `fix`: Bug fixes
- `docs`: Documentation
- `test`: Testing
- `refactor`: Refactoring
- `chore`: Maintenance
- `build`: Build/package
- `ci`: CI/CD
- unknown: Other changes

The result is written to the `Recent Development Memory` section in `PROJECT_MEMORY.md`.

## Criticality Scores

Reference criticality uses a 1-10 scale:

- `1-3` low: optional context
- `4-6` medium: read when relevant
- `7-8` high: strongly recommended when relevant
- `9-10` critical: must read when relevant

Scores are stored in `.memory/index.json` and preserved during sync.

## Development

```sh
npm install
npm run build
npm test
npm run dev -- status
```

## Roadmap

- AI semantic summaries
- embeddings and vector search
- Git diff analysis
- semantic conflict detection
- PR/CI integration
- Cursor adapter: `.cursor/rules/memory-inheritance.mdc`
- Gemini adapter
