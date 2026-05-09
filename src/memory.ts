import fs from "node:fs";
import path from "node:path";

import { isGitRepository, readRecentCommits, summarizeRecentCommits } from "./git.js";
import { extractSection, hasMarkedSection, replaceMarkedSection, replaceMarkedSectionAfterMarker } from "./markdown.js";
import {
  buildMemoryIndex,
  ensureModuleFiles,
  findReference,
  MEMORY_INDEX_PATH,
  readMemoryIndex,
  readReferenceFile,
  saveMemoryIndex
} from "./references.js";
import {
  buildMemoryDefinitions,
  generateGitMemoryPlaceholder,
  generateProjectMemory,
  generateProjectScanSection
} from "./templates.js";
import type { InitMemoryOptions, MemoryFileName, MemoryIndex, MemoryStateFileName, ProjectInfo, SyncMemoryOptions } from "./types.js";

const memoryFiles: MemoryFileName[] = ["PROJECT_MEMORY.md", "AGENTS.md", "CLAUDE.md"];
const stateFiles: MemoryStateFileName[] = ["PROJECT_MEMORY.md", "AGENTS.md", "CLAUDE.md", ".memory/index.json"];

function filePath(rootPath: string, fileName: MemoryStateFileName): string {
  return path.join(rootPath, fileName);
}

function writeMemoryFile(rootPath: string, fileName: MemoryFileName, content: string, force = false): void {
  const targetPath = filePath(rootPath, fileName);
  const existedBefore = fs.existsSync(targetPath);

  if (existedBefore && !force) {
    console.log(`Skipped ${fileName} because it already exists.`);
    return;
  }

  fs.writeFileSync(targetPath, content, "utf8");
  console.log(`${existedBefore ? "Overwrote" : "Generated"} ${fileName}`);
}

function writeReferenceIndex(info: ProjectInfo, options: { force?: boolean; preserveCriticality?: boolean }): MemoryIndex {
  const existingIndex = readMemoryIndex(info.rootPath);
  const indexExists = Boolean(existingIndex);
  const index = buildMemoryIndex(info, {
    existingIndex,
    preserveCriticality: options.preserveCriticality
  });

  if (indexExists && !options.force) {
    console.log(`Skipped ${MEMORY_INDEX_PATH} because it already exists.`);
    return existingIndex!;
  }

  saveMemoryIndex(info.rootPath, index);
  console.log(`${indexExists ? "Updated" : "Generated"} ${MEMORY_INDEX_PATH}`);
  return index;
}

function syncReferenceIndex(info: ProjectInfo): MemoryIndex {
  const existingIndex = readMemoryIndex(info.rootPath);
  const index = buildMemoryIndex(info, {
    existingIndex,
    preserveCriticality: true
  });

  saveMemoryIndex(info.rootPath, index);
  console.log(`${existingIndex ? "Updated" : "Generated"} ${MEMORY_INDEX_PATH}`);
  return index;
}

function ensureReferenceModules(rootPath: string, index: MemoryIndex): void {
  const generatedFiles = ensureModuleFiles(rootPath, index);

  for (const generatedFile of generatedFiles) {
    console.log(`Generated ${generatedFile}`);
  }
}

function ensureGitMemorySection(content: string): string {
  if (hasMarkedSection(content, "GIT-MEMORY")) {
    return content;
  }

  return replaceMarkedSectionAfterMarker(content, "GIT-MEMORY", generateGitMemoryPlaceholder(), "PROJECT-SCAN");
}

function updateGitMemorySection(rootPath: string, content: string, recentCount: number): string {
  const commits = readRecentCommits(rootPath, recentCount);

  if (!commits) {
    console.log("No Git repository detected. Skipping Git memory.");
    return ensureGitMemorySection(content);
  }

  const gitMemory = summarizeRecentCommits(commits, recentCount);
  console.log(`Updated Git memory from ${commits.length} recent commits.`);
  return replaceMarkedSectionAfterMarker(content, "GIT-MEMORY", gitMemory, "PROJECT-SCAN");
}

export function initMemory(info: ProjectInfo, options: InitMemoryOptions = {}): void {
  const index = writeReferenceIndex(info, {
    force: options.force,
    preserveCriticality: !options.force
  });
  ensureReferenceModules(info.rootPath, index);

  for (const definition of buildMemoryDefinitions(info, index)) {
    writeMemoryFile(info.rootPath, definition.fileName, definition.content, options.force);
  }
}

export function syncMemory(info: ProjectInfo, options: SyncMemoryOptions = {}): void {
  const index = syncReferenceIndex(info);
  ensureReferenceModules(info.rootPath, index);

  const projectMemoryPath = filePath(info.rootPath, "PROJECT_MEMORY.md");
  const projectMemoryContent = generateProjectMemory(info, index);

  if (!fs.existsSync(projectMemoryPath)) {
    const content = options.recent
      ? updateGitMemorySection(info.rootPath, projectMemoryContent, options.recent)
      : projectMemoryContent;
    fs.writeFileSync(projectMemoryPath, content, "utf8");
    console.log("Generated PROJECT_MEMORY.md");
  } else {
    const existingContent = fs.readFileSync(projectMemoryPath, "utf8");
    let updatedContent = replaceMarkedSection(existingContent, "PROJECT-SCAN", generateProjectScanSection(info, index));
    updatedContent = options.recent
      ? updateGitMemorySection(info.rootPath, updatedContent, options.recent)
      : ensureGitMemorySection(updatedContent);
    fs.writeFileSync(projectMemoryPath, updatedContent, "utf8");
    console.log("Updated PROJECT_MEMORY.md auto section");
  }

  const adapterDefinitions = buildMemoryDefinitions(info, index).filter((definition) => definition.fileName !== "PROJECT_MEMORY.md");

  for (const definition of adapterDefinitions) {
    const targetPath = filePath(info.rootPath, definition.fileName);

    if (!fs.existsSync(targetPath)) {
      fs.writeFileSync(targetPath, definition.content, "utf8");
      console.log(`Generated ${definition.fileName}`);
      continue;
    }

    if (options.force) {
      fs.writeFileSync(targetPath, definition.content, "utf8");
      console.log(`Overwrote ${definition.fileName}`);
      continue;
    }

    console.log(`Skipped ${definition.fileName} because it already exists.`);
  }
}

export function getMemoryState(rootPath: string): Record<MemoryStateFileName, boolean> {
  return stateFiles.reduce<Record<MemoryStateFileName, boolean>>(
    (state, fileName) => {
      state[fileName] = fs.existsSync(filePath(rootPath, fileName));
      return state;
    },
    {
      "PROJECT_MEMORY.md": false,
      "AGENTS.md": false,
      "CLAUDE.md": false,
      ".memory/index.json": false
    }
  );
}

export function getGitMemoryState(rootPath: string): { repository: boolean; recentMemory: boolean } {
  const projectMemoryPath = filePath(rootPath, "PROJECT_MEMORY.md");
  const content = fs.existsSync(projectMemoryPath) ? fs.readFileSync(projectMemoryPath, "utf8") : "";

  return {
    repository: isGitRepository(rootPath),
    recentMemory: hasMarkedSection(content, "GIT-MEMORY")
  };
}

function inspectReference(rootPath: string, referenceId: string): string | undefined {
  const index = readMemoryIndex(rootPath);

  if (!index) {
    return undefined;
  }

  const reference = findReference(index, referenceId);

  if (!reference) {
    return undefined;
  }

  return readReferenceFile(rootPath, reference);
}

export function inspectMemory(rootPath: string, query: string): string | undefined {
  if (query.startsWith("ref:")) {
    return inspectReference(rootPath, query.slice("ref:".length));
  }

  const projectMemoryPath = filePath(rootPath, "PROJECT_MEMORY.md");

  if (fs.existsSync(projectMemoryPath)) {
    const section = extractSection(fs.readFileSync(projectMemoryPath, "utf8"), query);

    if (section) {
      return section;
    }
  }

  return inspectReference(rootPath, query);
}
