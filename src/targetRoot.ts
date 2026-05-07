import path from "node:path";

export function resolveTargetRoot(): string {
  const targetRoot = process.env.INIT_CWD || process.cwd();
  return path.resolve(targetRoot);
}
