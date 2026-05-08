import path from "node:path";

export function resolveTargetRoot(): string {
  return path.resolve(process.cwd());
}
