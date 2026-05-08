# Memory Inheritance

Memory Inheritance is an NPM-based CLI tool that generates persistent Markdown memory for AI coding assistants.

Git remembers code history. Memory Inheritance remembers project context.

Run it from the project directory where you want memory files to be created:

```sh
cd your-project
npx mem-extract init
```

## Memory Model

- `PROJECT_MEMORY.md`: compact canonical project memory for humans and AI agents
- `AGENTS.md`: Codex / generic AI coding agent adapter
- `CLAUDE.md`: Claude Code adapter
- `.memory/index.json`: token-aware reference index for detailed memory
- `.memory/modules/*.md`: optional detailed module memory loaded only when relevant

`PROJECT_MEMORY.md` is the source of truth. Adapter files stay short and point agents back to the canonical memory. Detailed memory lives under `.memory/modules/` and is routed through `.memory/index.json` so agents do not waste context reading everything by default.

## Agent Reading Flow

1. Agent reads `AGENTS.md` or `CLAUDE.md`.
2. Adapter tells the agent to read `PROJECT_MEMORY.md`.
3. `PROJECT_MEMORY.md` gives a compact overview.
4. If more detail is needed, agent consults `.memory/index.json`.
5. Agent reads only the referenced memory files relevant to the current task.
6. If context is limited, agent prioritizes references with higher `criticality` scores.

## CLI Commands

```sh
npx mem-extract init
npx mem-extract init --force
npx mem-extract sync
npx mem-extract sync --force
npx mem-extract status
npx mem-extract inspect "Detected Tech Stack"
npx mem-extract inspect ref:cli
npx mem-extract score list
npx mem-extract score explain
npx mem-extract score markdown-sync 10
```

- `init` creates memory files, `.memory/index.json`, and placeholder module memory files without overwriting existing files.
- `init --force` regenerates top-level memory files and the reference index.
- `sync` updates only the marked auto-generated scan in `PROJECT_MEMORY.md`, updates `.memory/index.json`, and preserves manual notes.
- `sync --force` also regenerates adapter files.
- `status` prints detected stack, commands, memory file state, reference count, and top critical references.
- `inspect <section>` prints a section from `PROJECT_MEMORY.md`.
- `inspect ref:<id>` prints a referenced module memory file.
- `score <reference-id> <score>` updates developer-controlled reference criticality.

## Safe Sync

`PROJECT_MEMORY.md` uses explicit generated markers:

```md
<!-- AUTO-START:PROJECT-SCAN -->
...
<!-- AUTO-END:PROJECT-SCAN -->
```

Normal `sync` replaces only content inside that marker pair. Human-written notes outside the markers are preserved.

Current sync uses explicit marker-based replacement. If future versions need complex section editing, consider a Markdown AST parser such as remark/mdast.

## Criticality Scores

Reference criticality uses a 1-10 scale:

- `1-3` low: optional context
- `4-6` medium: read when relevant
- `7-8` high: strongly recommended when relevant
- `9-10` critical: must read when relevant

Criticality helps agents decide which detailed memory files to prioritize when context is limited.

## Development

```sh
npm install
npm run build
npm test
npm run dev -- status
```

## Project Structure

```text
memory-inheritance/
├── README.md
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── cli.ts
│   ├── markdown.ts
│   ├── memory.ts
│   ├── references.ts
│   ├── scanner.ts
│   ├── targetRoot.ts
│   ├── templates.ts
│   └── types.ts
├── templates/
│   ├── PROJECT_MEMORY.md.template
│   ├── AGENTS.md.template
│   └── CLAUDE.md.template
└── PROJECT_MEMORY.md
```

## Roadmap

- Git log semantic memory
- `sync --recent 10`
- Cursor adapter: `.cursor/rules/memory-inheritance.mdc`
- Gemini adapter
- Full semantic conflict detection
- Token-optimized compact/full memory modes
- Vector embedding based memory search
- Markdown AST based section editing
- AI-powered commit clustering
