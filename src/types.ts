export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export type MemoryFileName = "PROJECT_MEMORY.md" | "AGENTS.md" | "CLAUDE.md";

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
  autoSections: Record<string, string>;
  manualSections: Record<string, string>;
};

export type InitMemoryOptions = {
  force?: boolean;
};
