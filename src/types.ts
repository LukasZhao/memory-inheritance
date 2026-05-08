export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export type MemoryFileName = "PROJECT_MEMORY.md" | "AGENTS.md" | "CLAUDE.md";
export type MemoryStateFileName = MemoryFileName | ".memory/index.json";

export type ProjectInfo = {
  projectName: string;
  rootPath: string;
  detectedStack: string[];
  importantFiles: string[];
  packageManager?: PackageManager;
  commands: string[];
};

export type PackageJson = {
  name?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

export type MemoryDefinition = {
  fileName: MemoryFileName;
  content: string;
};

export type InitMemoryOptions = {
  force?: boolean;
};

export type SyncMemoryOptions = {
  force?: boolean;
};

export type MemoryReference = {
  id: string;
  title: string;
  path: string;
  category: string;
  summary: string;
  readWhen: string[];
  sourceFiles: string[];
  risk: "low" | "medium" | "high";
  stability: "stable" | "active" | "experimental";
  estimatedTokens: number;
  criticality: number;
  priority: number;
  lastUpdated: string;
};

export type MemoryIndex = {
  version: string;
  canonicalMemory: "PROJECT_MEMORY.md";
  generatedAt: string;
  project: {
    name: string;
    stack: string[];
    packageManager?: PackageManager;
  };
  references: MemoryReference[];
};
