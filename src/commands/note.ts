import fs from "node:fs";
import path from "node:path";

import { appendToMarkdownSection } from "../markdown.js";

const projectMemoryFile = "PROJECT_MEMORY.md";

function localDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function projectMemoryPath(rootPath: string): string {
  return path.join(rootPath, projectMemoryFile);
}

export function appendHumanContext(rootPath: string, sectionHeading: string, text: string): boolean {
  const targetPath = projectMemoryPath(rootPath);

  if (!fs.existsSync(targetPath)) {
    console.error("PROJECT_MEMORY.md not found.");
    console.error("Run `npx mem-extract init` first.");
    return false;
  }

  const content = fs.readFileSync(targetPath, "utf8");
  const lineToAppend = `- [${localDate()}] ${text}`;
  const updatedContent = appendToMarkdownSection(content, sectionHeading, lineToAppend);
  fs.writeFileSync(targetPath, updatedContent, "utf8");
  console.log(`Added to ${sectionHeading}.`);
  return true;
}

export function runNote(rootPath: string, text: string): void {
  if (!text.trim()) {
    console.error('Usage: mem-extract note "important project context"');
    process.exitCode = 1;
    return;
  }

  if (!appendHumanContext(rootPath, "Manual Notes", text.trim())) {
    process.exitCode = 1;
  }
}
