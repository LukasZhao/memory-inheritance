# Memory Inheritance

Memory Inheritance is an NPM-based CLI tool that generates persistent Markdown memory files for AI coding assistants. It scans the current project, detects useful context, and writes structured files that agents can read at the start of future sessions. Memory Inheritance also generates a canonical PROJECT_MEMORY.md and adapter files for AI coding agents, so tools like Codex and Claude Code can automatically discover and follow your project context.
Run it from the project directory where you want the memory files to be created:

```sh
cd your-project
npx mem-extract init
```

## What It Generates

- `PROJECT_MEMORY.md`: canonical project memory for humans and AI agents
- `AGENTS.md`: Codex adapter that tells Codex to read `PROJECT_MEMORY.md` first
- `CLAUDE.md`: Claude Code adapter that tells Claude Code to read `PROJECT_MEMORY.md` first

`PROJECT_MEMORY.md` is the source of truth. Adapter files stay small and point each agent back to the canonical memory so project intent, architecture notes, commands, and manual notes do not get split across tools.

Existing files are not overwritten by `init`. Use `init --force` only when you intentionally want to regenerate all three files.

## Install And Run

```sh
npx mem-extract init
```

The default command is `init`, so this is equivalent:

```sh
npx mem-extract
```

## CLI Commands

```sh
npx mem-extract init
npx mem-extract init --force
npx mem-extract sync
npx mem-extract status
npx mem-extract inspect "Common Commands"
```

- `init` creates memory files only when they do not already exist.
- `init --force` overwrites existing memory files.
- `sync` refreshes generated sections while preserving manual-note sections.
- `status` prints detected stack, commands, and memory file state for `PROJECT_MEMORY.md`, `AGENTS.md`, and `CLAUDE.md`.
- `inspect <section>` prints one Markdown section by heading name.

## Detected Context

- Project name from `package.json` or the current folder name
- Tech stack from common manifest/config files and dependencies
- Important files and folders such as `README.md`, `src`, `templates`, and framework configs
- Common commands from package scripts and known ecosystem defaults

## Development

```sh
npm install
npm run dev
npm run build
npm test
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
