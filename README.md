# Memory Inheritance

> Git remembers code history.  
> Memory Inheritance remembers project context.

**Memory Inheritance** is a token-aware project memory CLI for AI coding agents.

It turns your repository structure and recent development context into persistent, AI-readable memory files, so tools like **Codex, Claude Code, Cursor, Gemini, and ChatGPT** can understand your project before making changes.

```bash
npx mem-extract init
```

---

## Why Memory Inheritance?

AI coding agents are powerful, but they often lose context.

They may forget:

- what the project is trying to achieve
- why the architecture is designed this way
- which files are important
- what commands should be used
- what decisions must be preserved
- what changed recently
- which parts of the project are risky to modify

Memory Inheritance creates a structured memory layer inside your repository so AI agents can recover project context quickly and consistently.

```text
Git                 = code history
Memory Inheritance  = project memory
```

It does not replace Git.  
It adds a semantic memory layer for AI-assisted development.

---

## What it generates

Running:

```bash
npx mem-extract init
```

generates:

```text
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
```

### File roles

| File | Purpose |
|---|---|
| `PROJECT_MEMORY.md` | Compact canonical project memory |
| `AGENTS.md` | Adapter for Codex / generic AI coding agents |
| `CLAUDE.md` | Adapter for Claude Code |
| `.memory/index.json` | Metadata reference index for token-aware memory routing |
| `.memory/modules/*.md` | Detailed memory files loaded only when relevant |

---

## Core concept

Memory Inheritance is not just a Markdown generator.

It is a **token-aware, reference-based memory system** for AI coding workflows.

The agent reading flow is:

```text
1. Agent reads AGENTS.md or CLAUDE.md
2. Adapter tells the agent to read PROJECT_MEMORY.md
3. PROJECT_MEMORY.md gives compact project context
4. If more detail is needed, agent checks .memory/index.json
5. Agent reads only the relevant referenced memory files
```

This avoids forcing AI agents to load the entire project memory on every task.

---

## Quick start

### 1. Initialize memory

Inside your project:

```bash
npx mem-extract init
```

### 2. Check status

```bash
npx mem-extract status
```

### 3. Inspect project memory

```bash
npx mem-extract inspect "Detected Tech Stack"
```

### 4. Inspect a referenced memory module

```bash
npx mem-extract inspect ref:cli
```

### 5. Sync memory after meaningful changes

```bash
npx mem-extract sync
```

---

## Main features

### Project memory extraction

Memory Inheritance scans the current project directory and detects:

- project name
- tech stack
- important files and folders
- common commands
- package manager
- memory file status

It writes this into `PROJECT_MEMORY.md` as compact AI-readable context.

---

### Agent adapter files

Memory Inheritance generates short adapter files for AI coding agents.

#### `AGENTS.md`

Used by Codex and other agents that support agent instruction files.

It tells the agent to:

- read `PROJECT_MEMORY.md` first
- keep changes focused
- preserve manual memory notes
- avoid loading all `.memory/` files by default
- use `.memory/index.json` when detailed context is needed

#### `CLAUDE.md`

Used by Claude Code.

It tells Claude Code to:

- read `PROJECT_MEMORY.md` first
- preserve project intent
- avoid broad rewrites
- use detailed memory only when relevant

---

### Safe sync

Memory files are not disposable generated artifacts.

Developers should be able to edit them manually.

`sync` updates only auto-generated sections and preserves manual notes.

Safe sync uses markers:

```md
<!-- AUTO-START:PROJECT-SCAN -->
...
<!-- AUTO-END:PROJECT-SCAN -->
```

Only content inside the markers is updated.

Everything outside the markers is preserved.

```bash
npx mem-extract sync
```

---

### Token-aware metadata references

`.memory/index.json` acts as a lightweight routing layer.

Example:

```json
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
```

This allows agents to read only the memory that matches the current task.

---

### Criticality score

Not all memory is equally important.

Developers can manually score how important a memory reference is:

```bash
npx mem-extract score markdown-sync 10
npx mem-extract score cli 8
```

List scores:

```bash
npx mem-extract score list
```

Explain scoring:

```bash
npx mem-extract score explain
```

Score guide:

```text
1-3   low: optional context
4-6   medium: read when relevant
7-8   high: strongly recommended when relevant
9-10  critical: must read when relevant
```

This lets project owners tell AI agents:

> This memory matters. Do not forget it.

---

## Commands

| Command | Description |
|---|---|
| `npx mem-extract init` | Generate memory files |
| `npx mem-extract init --force` | Regenerate memory files |
| `npx mem-extract sync` | Update generated memory while preserving manual notes |
| `npx mem-extract status` | Show project and memory status |
| `npx mem-extract inspect <section>` | Inspect a section from `PROJECT_MEMORY.md` |
| `npx mem-extract inspect ref:<id>` | Inspect a referenced memory module |
| `npx mem-extract score <id> <score>` | Set criticality score for a memory reference |
| `npx mem-extract score list` | List memory criticality scores |
| `npx mem-extract score explain` | Explain the scoring system |

---

## Git semantic memory

Memory Inheritance can also summarize recent Git activity into AI-readable development memory.

Instead of dumping raw commit logs, it groups recent commits into compact categories such as:

- feature work
- bug fixes
- documentation
- tests
- refactoring
- maintenance
- build/package changes
- CI/CD

Example:

```bash
npx mem-extract sync --recent 10
```

This helps agents understand what recently changed and where the project is moving.

---

## Commit message recommendation

Memory Inheritance generates better Git semantic memory when commit messages use clear category prefixes.

We strongly recommend using simple conventional prefixes:

```text
feat: add memory reference index
fix: preserve manual notes during sync
docs: update README usage guide
test: add packaged CLI test
refactor: split markdown sync logic
chore: clean npm package artifacts
build: update package configuration
ci: update release workflow
```

Recommended prefixes:

| Prefix | Meaning |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation change |
| `test:` | Test-related change |
| `refactor:` | Code restructuring without behavior change |
| `chore:` | Maintenance task |
| `build:` | Build or package change |
| `ci:` | CI/CD change |

You can define your own categories, but consistent prefixes make it easier for Memory Inheritance to classify recent Git activity into compact AI-readable development memory.

Better commit messages create better agent context.

---

## Example workflow

```bash
npx mem-extract init
npx mem-extract status
npx mem-extract score markdown-sync 10
npx mem-extract inspect ref:markdown-sync
```

After meaningful project changes:

```bash
npx mem-extract sync
```

After recent Git commits:

```bash
npx mem-extract sync --recent 10
```

---

## Philosophy

Memory Inheritance is not a database-first system.

Markdown remains the human-readable interface.

JSON metadata is only a lightweight routing layer.

```text
NPM automates memory extraction.
Markdown stores memory transparently.
Metadata references route AI to relevant details.
AI agents load memory on demand.
```

Memory should be reviewed like code.

```text
Memory is code. Review it before committing.
```

---

## Roadmap

### v0.1 — Basic memory generator

- scan project
- detect tech stack
- detect commands
- generate `PROJECT_MEMORY.md`
- generate `AGENTS.md`
- generate `CLAUDE.md`
- support `init`, `sync`, `status`, `inspect`

### v0.2 — Safe sync + agent adapters

- marker-based safe sync
- manual note preservation
- compact `PROJECT_MEMORY.md`
- short `AGENTS.md` and `CLAUDE.md` adapter files
- improved status output

### v0.3 — Token-aware metadata references

- `.memory/index.json`
- `.memory/modules/*.md`
- inspect by reference id
- metadata-based memory routing
- developer-controlled criticality scores

### v0.4 — Git semantic memory

- read recent Git commits
- summarize recent development activity
- `sync --recent 10`
- compressed development memory
- no full history dumps by default

### v0.5 — Semantic conflict detection

- forbidden pattern checks
- architecture rule warnings
- product direction warnings
- possible CI integration

### v0.6 — Ecosystem adapters

- Cursor adapter
- Gemini adapter
- more agent-specific entry files
- possible IDE integration

---

## Future ideas

### Semantic conflict detection

Future versions may detect when new code conflicts with recorded project memory.

Example:

```md
## Forbidden Tech/Patterns

- Do not use Redux.
- Do not remove generated memory markers.
- Do not overwrite manual memory notes during sync.
```

If code introduces a forbidden pattern, the CLI could warn the developer.

---

### Memory versioning

Because memory files live inside the repository, they can be reviewed and versioned with Git.

This makes project memory auditable.

---

### Agent ecosystem adapters

Future versions may support additional agent entry files, such as:

```text
.cursor/rules/memory-inheritance.mdc
GEMINI.md
```

The goal is to make one project memory system work across multiple AI coding tools.

---

## Development

Install dependencies:

```bash
npm install
```

Run in development mode:

```bash
npm run dev -- status
```

Build:

```bash
npm run build
```

Run tests:

```bash
npm test
```

Pack locally:

```bash
npm pack
```

Test in another local project:

```bash
cd /path/to/your/project
npm install /path/to/memory-inheritance/mem-extract-1.0.0.tgz
npx mem-extract init
npx mem-extract status
```

---

## License

MIT
