import { appendHumanContext } from "./note.js";

export function runDecide(rootPath: string, text: string): void {
  if (!text.trim()) {
    console.error('Usage: mem-extract decide "important architecture decision"');
    process.exitCode = 1;
    return;
  }

  if (!appendHumanContext(rootPath, "Architecture Decisions", text.trim())) {
    process.exitCode = 1;
  }
}
