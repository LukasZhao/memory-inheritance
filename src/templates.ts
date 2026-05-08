import { renderList } from "./markdown.js";
import type { MemoryDefinition, MemoryIndex, ProjectInfo } from "./types.js";

function renderReferenceTable(index: MemoryIndex): string {
  const rows = index.references.map((reference) => {
    const whenToRead = reference.readWhen[0] ?? "When relevant";
    return `| ${reference.id} | ${reference.title} | \`${reference.path}\` | ${reference.criticality} | ${whenToRead} |`;
  });

  return ["| ID | Area | Path | Criticality | When to read |", "|---|---|---|---:|---|", ...rows].join("\n");
}

export function generateProjectScanSection(info: ProjectInfo, index: MemoryIndex): string {
  return `## Project Overview

Project name: ${info.projectName}

## Detected Tech Stack

${renderList(info.detectedStack)}

## Important Files and Folders

${renderList(info.importantFiles)}

## Common Commands

${renderList(info.commands)}

## Memory References

Detailed memory files are indexed in \`.memory/index.json\`.

${renderReferenceTable(index)}

## Generated

- Generated at: ${index.generatedAt}`;
}

export function generateProjectMemory(info: ProjectInfo, index: MemoryIndex): string {
  return `# PROJECT_MEMORY.md

Memory Inheritance canonical project memory.
This file is designed to be read by AI coding agents and humans.
This file should stay compact. For detailed context, use \`.memory/index.json\` and read only the referenced memory files relevant to the current task.

<!-- AUTO-START:PROJECT-SCAN -->
${generateProjectScanSection(info, index)}
<!-- AUTO-END:PROJECT-SCAN -->

## Manual Notes

Add human-maintained project intent, architecture notes, constraints, known issues, and TODOs here.

## Architecture Decisions

Add important decisions here.

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
- Do not load all files under \`.memory/\` by default.
- Use \`.memory/index.json\` to find relevant detailed memory.
- Prioritize high-criticality references when context is limited.
- Update memory after meaningful changes.
`;
}

export function generateAgentsMd(): string {
  return `# AGENTS.md

This repository uses Memory Inheritance.

## Required Context

Before making changes, read:
- \`PROJECT_MEMORY.md\`

\`PROJECT_MEMORY.md\` is the compact canonical project memory. It contains project intent, detected stack, important files, common commands, manual notes, architecture decisions, current development state, and memory references.

## Token-aware Reading Rule

Do not load all files under \`.memory/\` by default.
If more detail is needed, consult:
- \`.memory/index.json\`

Then read only the referenced memory files relevant to the current task.
Prioritize references with higher \`criticality\` scores when context is limited.

Examples:
- Editing CLI command routing -> read \`.memory/modules/cli.md\`
- Editing sync or marker behavior -> read \`.memory/modules/markdown-sync.md\`
- Editing generated templates -> read \`.memory/modules/templates.md\`
- Editing tests -> read \`.memory/modules/testing.md\`

## Agent Workflow

1. Read \`PROJECT_MEMORY.md\`.
2. Consult \`.memory/index.json\` only when detailed context is needed.
3. Follow the project intent and constraints.
4. Keep changes small and focused.
5. Do not overwrite manual memory notes.
6. After meaningful changes, run:

\`\`\`bash
npx mem-extract sync
\`\`\`

7. If a change affects architecture, update the manual notes or architecture decision section.

## Rules

- Do not perform broad rewrites unless explicitly requested.
- Prefer incremental, testable changes.
- Explain major changes clearly.
- Do not treat memory files as disposable generated artifacts.
- Do not delete \`.memory/\` references unless explicitly requested.
`;
}

export function generateClaudeMd(): string {
  return `# CLAUDE.md

This repository uses Memory Inheritance.

## Required Context

Before editing this repository, read:
- \`PROJECT_MEMORY.md\`

\`PROJECT_MEMORY.md\` is the compact canonical project memory for this codebase.

## Token-aware Reading Rule

Do not load all files under \`.memory/\` by default.
Use \`.memory/index.json\` as a reference index. Read detailed memory files only when they are directly relevant to the current task.
Prioritize references with higher \`criticality\` scores when context is limited.

Examples:
- Editing CLI command behavior -> read \`.memory/modules/cli.md\`
- Editing safe sync logic -> read \`.memory/modules/markdown-sync.md\`
- Editing memory file templates -> read \`.memory/modules/templates.md\`
- Editing test coverage -> read \`.memory/modules/testing.md\`

## Claude Code Instructions

- Preserve manual notes in \`PROJECT_MEMORY.md\`.
- Follow existing project architecture unless the user explicitly requests a change.
- Keep edits focused and incremental.
- If the task changes the project structure, run:

\`\`\`bash
npx mem-extract sync
\`\`\`

- If the task changes project intent or architecture, update the relevant manual section in \`PROJECT_MEMORY.md\`.

## Do Not

- Do not overwrite human-written memory sections.
- Do not convert the project into a different architecture without asking.
- Do not delete memory files unless explicitly requested.
- Do not read every \`.memory/\` file unless the user explicitly asks for full context.
`;
}

export function buildMemoryDefinitions(info: ProjectInfo, index: MemoryIndex): MemoryDefinition[] {
  return [
    {
      fileName: "PROJECT_MEMORY.md",
      content: generateProjectMemory(info, index)
    },
    {
      fileName: "AGENTS.md",
      content: generateAgentsMd()
    },
    {
      fileName: "CLAUDE.md",
      content: generateClaudeMd()
    }
  ];
}
