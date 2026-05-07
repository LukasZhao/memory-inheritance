import fs from "node:fs";
import path from "node:path";

import { extractSection, hasSection, insertSectionsAfterTitle, replaceSection } from "./markdown.js";
import { buildMemoryDefinitions } from "./templates.js";
import type { InitMemoryOptions, MemoryFileName, ProjectInfo } from "./types.js";

const memoryFiles: MemoryFileName[] = ["PROJECT_MEMORY.md", "AGENTS.md", "CLAUDE.md"];

function filePath(rootPath: string, fileName: MemoryFileName): string {
  return path.join(rootPath, fileName);
}

export function initMemory(info: ProjectInfo, options: InitMemoryOptions = {}): void {
  for (const definition of buildMemoryDefinitions(info)) {
    const targetPath = filePath(info.rootPath, definition.fileName);
    const existedBefore = fs.existsSync(targetPath);

    if (existedBefore && !options.force) {
      console.log(`Skipped ${definition.fileName} because it already exists.`);
      continue;
    }

    fs.writeFileSync(targetPath, definition.content, "utf8");
    console.log(`${existedBefore ? "Overwrote" : "Generated"} ${definition.fileName}`);
  }
}

export function syncMemory(info: ProjectInfo): void {
  for (const definition of buildMemoryDefinitions(info)) {
    const targetPath = filePath(info.rootPath, definition.fileName);

    if (!fs.existsSync(targetPath)) {
      fs.writeFileSync(targetPath, definition.content, "utf8");
      console.log(`Generated ${definition.fileName}`);
      continue;
    }

    let content = fs.readFileSync(targetPath, "utf8");

    for (const [heading, body] of Object.entries(definition.autoSections)) {
      content = replaceSection(content, heading, body);
    }

    const missingManualSections = Object.fromEntries(
      Object.entries(definition.manualSections).filter(([heading]) => !hasSection(content, heading))
    );

    if (definition.fileName === "PROJECT_MEMORY.md") {
      for (const [heading, body] of Object.entries(missingManualSections)) {
        content = replaceSection(content, heading, body);
      }
    } else {
      content = insertSectionsAfterTitle(content, missingManualSections);
    }

    fs.writeFileSync(targetPath, content, "utf8");
    console.log(`Updated ${definition.fileName}`);
  }
}

export function getMemoryState(rootPath: string): Record<MemoryFileName, boolean> {
  return memoryFiles.reduce<Record<MemoryFileName, boolean>>(
    (state, fileName) => {
      state[fileName] = fs.existsSync(filePath(rootPath, fileName));
      return state;
    },
    {
      "PROJECT_MEMORY.md": false,
      "AGENTS.md": false,
      "CLAUDE.md": false
    }
  );
}

export function inspectSection(rootPath: string, sectionName: string): string | undefined {
  for (const fileName of memoryFiles) {
    const targetPath = filePath(rootPath, fileName);

    if (!fs.existsSync(targetPath)) {
      continue;
    }

    const section = extractSection(fs.readFileSync(targetPath, "utf8"), sectionName);
    if (section) {
      return section;
    }
  }

  return undefined;
}
