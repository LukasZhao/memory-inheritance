import fs from "node:fs";
import path from "node:path";

import type { MemoryIndex, MemoryReference, ProjectInfo } from "./types.js";

export const MEMORY_INDEX_PATH = ".memory/index.json";
const MEMORY_MODULES_DIR = ".memory/modules";

type ReferenceSeed = Omit<MemoryReference, "criticality" | "priority" | "lastUpdated"> & {
  criticality: number;
};

const referenceSeeds: ReferenceSeed[] = [
  {
    id: "cli",
    title: "CLI Architecture",
    path: ".memory/modules/cli.md",
    category: "module",
    summary: "Command routing, init, sync, status, inspect, and score behavior.",
    readWhen: ["changing CLI commands", "editing src/cli.ts", "adding command options"],
    sourceFiles: ["src/index.ts", "src/cli.ts", "src/targetRoot.ts"],
    risk: "medium",
    stability: "active",
    estimatedTokens: 700,
    criticality: 8
  },
  {
    id: "markdown-sync",
    title: "Markdown Safe Sync",
    path: ".memory/modules/markdown-sync.md",
    category: "module",
    summary: "Marker-based replacement and manual note preservation.",
    readWhen: ["editing sync behavior", "changing PROJECT_MEMORY.md markers", "preserving manual notes"],
    sourceFiles: ["src/markdown.ts", "src/memory.ts"],
    risk: "high",
    stability: "active",
    estimatedTokens: 800,
    criticality: 10
  },
  {
    id: "templates",
    title: "Generated Templates",
    path: ".memory/modules/templates.md",
    category: "module",
    summary: "AGENTS.md, CLAUDE.md, and PROJECT_MEMORY.md generation rules.",
    readWhen: ["editing generated memory files", "changing adapter behavior", "changing project memory structure"],
    sourceFiles: ["src/templates.ts", "templates"],
    risk: "medium",
    stability: "active",
    estimatedTokens: 700,
    criticality: 7
  },
  {
    id: "testing",
    title: "Testing Notes",
    path: ".memory/modules/testing.md",
    category: "process",
    summary: "Commands and expectations for validating packaged CLI behavior.",
    readWhen: ["editing tests", "changing package behavior", "validating npm pack output"],
    sourceFiles: ["package.json", "tests"],
    risk: "medium",
    stability: "active",
    estimatedTokens: 600,
    criticality: 6
  },
  {
    id: "git-memory",
    title: "Git Semantic Memory",
    path: ".memory/modules/git-memory.md",
    category: "process",
    summary: "Recent Git activity summarized into compact AI-readable development memory.",
    readWhen: [
      "understanding recent project changes",
      "continuing previous development work",
      "summarizing recent commits",
      "debugging regressions after recent changes"
    ],
    sourceFiles: [".git", "src/git.ts", "src/memory.ts"],
    risk: "medium",
    stability: "active",
    estimatedTokens: 700,
    criticality: 7
  }
];

function indexPath(rootPath: string): string {
  return path.join(rootPath, MEMORY_INDEX_PATH);
}

function moduleDir(rootPath: string): string {
  return path.join(rootPath, MEMORY_MODULES_DIR);
}

function referencePath(rootPath: string, reference: MemoryReference): string {
  return path.join(rootPath, reference.path);
}

function priorityForCriticality(criticality: number): number {
  return criticality * 10;
}

function placeholderModuleContent(reference: MemoryReference): string {
  const descriptionsById: Record<string, string> = {
    cli: "CLI command behavior.",
    "markdown-sync": "marker-based sync behavior.",
    templates: "generated memory file templates.",
    testing: "validation and packaging behavior.",
    "git-memory": "recent Git-based development context."
  };
  const notesById: Record<string, string[]> = {
    cli: [
      "`init` creates memory files.",
      "`sync` updates generated sections.",
      "`status` reports current memory state.",
      "`inspect <section>` reads a section from `PROJECT_MEMORY.md`.",
      "`score <reference-id> <score>` updates memory reference criticality."
    ],
    "markdown-sync": [
      "Auto-generated sections must use markers.",
      "Manual notes outside markers must be preserved.",
      "Normal `sync` should not overwrite human-written content.",
      "This is a high-trust feature. Breaking it damages the product."
    ],
    templates: [
      "`PROJECT_MEMORY.md` is canonical memory.",
      "`AGENTS.md` is the Codex / generic agent adapter.",
      "`CLAUDE.md` is the Claude Code adapter.",
      "Adapter files should stay short."
    ],
    testing: [
      "Test packaged behavior in a real local project.",
      "Commands must operate on `process.cwd()`.",
      "Memory files should be generated in the target project root."
    ],
    "git-memory": [
      "Git memory should be summarized, not dumped.",
      "`sync --recent <n>` updates the Recent Development Memory section.",
      "Raw commit logs should not be inserted into `PROJECT_MEMORY.md` by default."
    ]
  };
  const notes = notesById[reference.id] ?? ["Add detailed memory notes here."];
  const description = descriptionsById[reference.id] ?? `${reference.title.toLowerCase()}.`;

  return `# ${reference.title}

This file stores detailed memory about ${description}

## Scope

Read this file only when ${reference.readWhen[0] ?? "this context is relevant"}.

## Criticality

${reference.criticality}

## Notes

${notes.map((note) => `- ${note}`).join("\n")}
`;
}

function existingReferenceById(existingIndex: MemoryIndex | undefined): Map<string, MemoryReference> {
  return new Map((existingIndex?.references ?? []).map((reference) => [reference.id, reference]));
}

export function readMemoryIndex(rootPath: string): MemoryIndex | undefined {
  const targetPath = indexPath(rootPath);

  if (!fs.existsSync(targetPath)) {
    return undefined;
  }

  try {
    return JSON.parse(fs.readFileSync(targetPath, "utf8")) as MemoryIndex;
  } catch {
    return undefined;
  }
}

export function buildMemoryIndex(
  info: ProjectInfo,
  options: { existingIndex?: MemoryIndex; preserveCriticality?: boolean; timestamp?: string } = {}
): MemoryIndex {
  const timestamp = options.timestamp ?? new Date().toISOString();
  const existingReferences = existingReferenceById(options.existingIndex);

  const references = referenceSeeds.map<MemoryReference>((seed) => {
    const existingReference = existingReferences.get(seed.id);
    const criticality =
      options.preserveCriticality && existingReference?.criticality ? existingReference.criticality : seed.criticality;

    return {
      ...seed,
      criticality,
      priority: priorityForCriticality(criticality),
      lastUpdated: timestamp
    };
  });

  return {
    version: "0.4.0",
    canonicalMemory: "PROJECT_MEMORY.md",
    generatedAt: timestamp,
    project: {
      name: info.projectName,
      stack: info.detectedStack,
      packageManager: info.packageManager
    },
    references
  };
}

export function saveMemoryIndex(rootPath: string, index: MemoryIndex): void {
  const targetPath = indexPath(rootPath);
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, `${JSON.stringify(index, null, 2)}\n`, "utf8");
}

export function ensureModuleFiles(rootPath: string, index: MemoryIndex): string[] {
  fs.mkdirSync(moduleDir(rootPath), { recursive: true });

  const generatedFiles: string[] = [];

  for (const reference of index.references) {
    const targetPath = referencePath(rootPath, reference);

    if (fs.existsSync(targetPath)) {
      continue;
    }

    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, placeholderModuleContent(reference), "utf8");
    generatedFiles.push(reference.path);
  }

  return generatedFiles;
}

export function findReference(index: MemoryIndex, referenceId: string): MemoryReference | undefined {
  return index.references.find((reference) => reference.id === referenceId);
}

export function readReferenceFile(rootPath: string, reference: MemoryReference): string | undefined {
  const targetPath = referencePath(rootPath, reference);

  if (!fs.existsSync(targetPath)) {
    return undefined;
  }

  return fs.readFileSync(targetPath, "utf8");
}

export function criticalityLabel(score: number): string {
  if (score <= 3) return "low";
  if (score <= 6) return "medium";
  if (score <= 8) return "high";
  return "critical";
}

export function updateReferenceCriticality(rootPath: string, referenceId: string, score: number): MemoryReference | undefined {
  const index = readMemoryIndex(rootPath);

  if (!index) {
    return undefined;
  }

  const reference = findReference(index, referenceId);

  if (!reference) {
    return undefined;
  }

  reference.criticality = score;
  reference.priority = priorityForCriticality(score);
  reference.lastUpdated = new Date().toISOString();
  saveMemoryIndex(rootPath, index);
  return reference;
}

export function sortedTopReferences(index: MemoryIndex, limit = 3): MemoryReference[] {
  return [...index.references].sort((left, right) => right.criticality - left.criticality).slice(0, limit);
}
