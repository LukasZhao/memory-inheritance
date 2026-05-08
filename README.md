# Memory Inheritance
> Git remembers code history.  
> Memory Inheritance remembers project context.
Memory Inheritance is a Node.js + TypeScript CLI tool that generates persistent, AI-readable project memory for coding agents such as Codex, Claude Code, Cursor, Gemini, and ChatGPT.
AI coding agents are powerful, but they often lose context between sessions, long tasks, or context window resets. Memory Inheritance helps your project keep a compact, editable memory layer so agents can understand what the project is, how it works, what decisions matter, and what should not be forgotten.
---
## Why this exists
AI coding tools often struggle with:
- forgetting project intent between sessions
- missing important architecture decisions
- repeating old mistakes
- ignoring existing constraints
- not knowing which files matter
- not knowing the correct commands to run
- overwriting important manual notes
- wasting tokens by reading too much irrelevant context
Memory Inheritance solves this by generating a structured memory system inside your repository.
---
## Core idea
Memory Inheritance does not try to replace Git.
Git tracks code changes.
Memory Inheritance tracks project context, intent, and AI collaboration memory.
```text
Git                 = code history
Memory Inheritance  = project memory

The goal is to help AI agents understand not only what changed, but why the project works this way.

⸻

Quick start

Install and run inside your project:

npx mem-extract init

This generates:

PROJECT_MEMORY.md
AGENTS.md
CLAUDE.md
.memory/
  index.json
  modules/
    cli.md
    markdown-sync.md
    templates.md
    testing.md

Then check the generated memory status:

npx mem-extract status

Inspect a section:

npx mem-extract inspect "Detected Tech Stack"

Inspect a referenced memory module:

npx mem-extract inspect ref:cli

⸻

Generated files

PROJECT_MEMORY.md

The compact canonical memory file.

This is the main file AI agents and humans should read first.

It contains:

* project overview
* detected tech stack
* important files and folders
* common commands
* memory reference table
* manual notes
* architecture decisions
* current development state
* forbidden tech / patterns
* AI collaboration rules

PROJECT_MEMORY.md is intentionally compact. It should not become a giant dump of everything.

⸻

AGENTS.md

Adapter file for Codex and other AI coding agents that support AGENTS.md.

It tells the agent:

* read PROJECT_MEMORY.md first
* do not load all memory files by default
* use .memory/index.json to find relevant details
* preserve manual notes
* keep changes focused
* run npx mem-extract sync after meaningful changes

⸻

CLAUDE.md

Adapter file for Claude Code.

It tells Claude Code:

* read PROJECT_MEMORY.md first
* preserve manual memory sections
* follow existing architecture
* use .memory/index.json only when detailed context is needed
* avoid broad rewrites unless explicitly requested

⸻

.memory/index.json

A lightweight metadata reference index.

It helps AI agents decide which detailed memory file to read.

Example:

{
  "id": "markdown-sync",
  "title": "Markdown Safe Sync",
  "path": ".memory/modules/markdown-sync.md",
  "category": "module",
  "summary": "Marker-based replacement and manual note preservation.",
  "readWhen": [
    "editing sync behavior",
    "preserving manual notes"
  ],
  "sourceFiles": [
    "src/markdown.ts",
    "src/commands/sync.ts"
  ],
  "risk": "high",
  "stability": "active",
  "estimatedTokens": 800,
  "criticality": 10,
  "priority": 100
}

This makes project memory token-aware and reference-based.

Instead of loading every memory file, agents can read only the memory that matches the task.

⸻

.memory/modules/

Detailed memory files loaded on demand.

Example modules:

.memory/modules/cli.md
.memory/modules/markdown-sync.md
.memory/modules/templates.md
.memory/modules/testing.md

These files are not meant to be loaded all at once.

They are referenced by .memory/index.json and should be read only when relevant.

⸻

Token-aware memory

Memory Inheritance is designed around token efficiency.

The reading flow should be:

1. Agent reads AGENTS.md or CLAUDE.md.
2. Adapter tells the agent to read PROJECT_MEMORY.md.
3. PROJECT_MEMORY.md gives compact project context.
4. If more detail is needed, agent checks .memory/index.json.
5. Agent reads only the relevant referenced memory files.

This prevents every task from loading the entire project memory.

Short adapter files
Compact canonical memory
Detailed memory loaded on demand

⸻

Commands

Initialize memory

npx mem-extract init

Generates the memory files and .memory/ structure.

By default, existing files are not overwritten.

Use --force to regenerate:

npx mem-extract init --force

⸻

Sync memory

npx mem-extract sync

Updates the auto-generated project scan section while preserving human-written notes.

Safe sync uses markers:

<!-- AUTO-START:PROJECT-SCAN -->
...
<!-- AUTO-END:PROJECT-SCAN -->

Only content inside these markers is updated.

Everything outside the markers is preserved.

⸻

Check status

npx mem-extract status

Shows:

* project name
* root path
* detected tech stack
* common commands
* memory file status
* metadata reference status
* top critical memory references

⸻

Inspect memory

Inspect a section from PROJECT_MEMORY.md:

npx mem-extract inspect "Detected Tech Stack"

Inspect a referenced memory module:

npx mem-extract inspect ref:cli

Examples:

npx mem-extract inspect ref:markdown-sync
npx mem-extract inspect ref:templates
npx mem-extract inspect ref:testing

⸻

Score memory criticality

Developers can manually score how important a memory reference is.

npx mem-extract score <reference-id> <score>

Example:

npx mem-extract score markdown-sync 10
npx mem-extract score cli 8

List scores:

npx mem-extract score list

Explain scoring:

npx mem-extract score explain

Score guide:

1-3  low: optional context
4-6  medium: read when relevant
7-8  high: strongly recommended when relevant
9-10 critical: must read when relevant

Criticality scores help AI agents prioritize memory when context is limited.

⸻

Why criticality scores matter

Not all memory is equally important.

For example:

markdown-sync = critical
roadmap       = low
templates     = high
testing       = medium

If the agent is editing sync behavior, it should prioritize:

PROJECT_MEMORY.md
.memory/modules/markdown-sync.md

It should not load unrelated files by default.

Criticality scoring lets the project owner tell AI:

This memory matters. Do not forget it.

⸻

Example workflow

Inside your project:

npx mem-extract init
npx mem-extract status
npx mem-extract score markdown-sync 10
npx mem-extract inspect ref:markdown-sync

After meaningful project changes:

npx mem-extract sync

The sync command updates generated memory while preserving manual notes.

⸻

Safe sync philosophy

Memory files are not disposable generated artifacts.

Developers should be able to edit them manually.

Therefore:

* sync must not overwrite manual notes
* .memory/modules/*.md should survive sync
* existing criticality scores should survive sync
* adapter files should not be overwritten unless --force is used

This is the trust foundation of the tool.

⸻

Project philosophy

Memory Inheritance is not a database-first system.

Markdown remains the human-readable interface.

JSON metadata is only a lightweight routing layer.

NPM automates memory extraction.
Markdown stores memory transparently.
Metadata references route AI to relevant details.
AI agents load memory on demand.

⸻

Current roadmap

v0.1 — Basic Memory Generator

* scan project
* detect stack
* detect commands
* generate PROJECT_MEMORY.md
* generate AGENTS.md
* generate CLAUDE.md
* support init, sync, status, inspect

v0.2 — Safe Sync + Agent Adapters

* marker-based safe sync
* manual note preservation
* compact PROJECT_MEMORY.md
* short AGENTS.md and CLAUDE.md adapters
* improved status output

v0.3 — Token-aware Metadata References

* .memory/index.json
* .memory/modules/*.md
* inspect by reference id
* metadata-based memory routing
* developer-controlled criticality scores

v0.4 — Git Semantic Memory

* read Git log
* summarize recent commits
* sync --recent 10
* compressed development memory
* no full history dumps by default

v0.5 — Semantic Conflict Detection

* forbidden pattern checks
* architecture rule warnings
* product direction warnings
* possible CI integration

v0.6 — Ecosystem Adapters

* Cursor adapter
* Gemini adapter
* more agent-specific entry files
* possible IDE integration

⸻

Future ideas

Git log semantic memory

Instead of dumping commit logs, Memory Inheritance should summarize development history.

Example:

Recent work focused on refactoring the sync pipeline and preserving manual notes during project memory updates.

Semantic conflict detection

Future versions may detect when new code conflicts with recorded project memory.

Example:

## Forbidden Tech/Patterns
- Do not use Redux.
- Do not remove generated memory markers.
- Do not overwrite manual memory notes during sync.

If code introduces a forbidden pattern, the CLI could warn the developer.

Memory versioning

Memory should be reviewed like code.

Memory is code. Review it before committing.

⸻

Development

Install dependencies:

npm install

Run in development mode:

npm run dev -- status

Build:

npm run build

Run tests:

npm test

Pack locally:

npm pack

Test in another local project:

cd /path/to/your/project
npm install /path/to/memory-inheritance/mem-extract-1.0.0.tgz
npx mem-extract init
npx mem-extract status

⸻

License

MIT

