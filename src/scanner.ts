import fs from "node:fs";
import path from "node:path";

import type { PackageJson, PackageManager, ProjectInfo } from "./types.js";

const importantCandidates = [
  "README.md",
  "package.json",
  "tsconfig.json",
  "vite.config.ts",
  "vite.config.js",
  "next.config.js",
  "next.config.mjs",
  "pubspec.yaml",
  "requirements.txt",
  "pyproject.toml",
  "pom.xml",
  "build.gradle",
  "Cargo.toml",
  "go.mod",
  "src",
  "lib",
  "app",
  "pages",
  "components",
  "services",
  "assets",
  "templates",
  "tests",
  "test"
];

const wellKnownScripts = ["dev", "start", "build", "test", "lint", "typecheck", "format"];

function exists(rootPath: string, relativePath: string): boolean {
  return fs.existsSync(path.join(rootPath, relativePath));
}

function readPackageJson(rootPath: string): PackageJson | undefined {
  const packageJsonPath = path.join(rootPath, "package.json");

  if (!fs.existsSync(packageJsonPath)) {
    return undefined;
  }

  try {
    return JSON.parse(fs.readFileSync(packageJsonPath, "utf8")) as PackageJson;
  } catch {
    return undefined;
  }
}

function hasDependency(packageJson: PackageJson | undefined, name: string): boolean {
  return Boolean(packageJson?.dependencies?.[name] || packageJson?.devDependencies?.[name]);
}

function addUnique(items: string[], value: string): void {
  if (!items.includes(value)) {
    items.push(value);
  }
}

function detectPackageManager(rootPath: string): PackageManager | undefined {
  if (exists(rootPath, "pnpm-lock.yaml")) return "pnpm";
  if (exists(rootPath, "yarn.lock")) return "yarn";
  if (exists(rootPath, "bun.lockb") || exists(rootPath, "bun.lock")) return "bun";
  if (exists(rootPath, "package-lock.json")) return "npm";
  if (exists(rootPath, "package.json")) return "npm";
  return undefined;
}

function detectStack(rootPath: string, packageJson: PackageJson | undefined): string[] {
  const stack: string[] = [];

  if (exists(rootPath, "package.json")) addUnique(stack, "Node.js");
  if (exists(rootPath, "tsconfig.json") || hasDependency(packageJson, "typescript")) {
    addUnique(stack, "TypeScript");
  }
  if (hasDependency(packageJson, "react")) addUnique(stack, "React");
  if (hasDependency(packageJson, "next")) addUnique(stack, "Next.js");
  if (hasDependency(packageJson, "vite") || exists(rootPath, "vite.config.ts") || exists(rootPath, "vite.config.js")) {
    addUnique(stack, "Vite");
  }
  if (hasDependency(packageJson, "vue")) addUnique(stack, "Vue");
  if (hasDependency(packageJson, "svelte") || hasDependency(packageJson, "@sveltejs/kit")) {
    addUnique(stack, "Svelte");
  }
  if (hasDependency(packageJson, "express")) addUnique(stack, "Express");
  if (exists(rootPath, "pubspec.yaml")) addUnique(stack, "Flutter / Dart");
  if (exists(rootPath, "requirements.txt") || exists(rootPath, "pyproject.toml")) addUnique(stack, "Python");
  if (exists(rootPath, "pom.xml")) addUnique(stack, "Java / Maven");
  if (exists(rootPath, "build.gradle") || exists(rootPath, "settings.gradle")) addUnique(stack, "Java / Gradle");
  if (exists(rootPath, "Cargo.toml")) addUnique(stack, "Rust");
  if (exists(rootPath, "go.mod")) addUnique(stack, "Go");

  return stack.length > 0 ? stack : ["Unknown"];
}

function detectImportantFiles(rootPath: string): string[] {
  return importantCandidates.filter((item) => exists(rootPath, item));
}

function installCommand(packageManager: PackageManager): string {
  return `${packageManager} install`;
}

function scriptCommand(packageManager: PackageManager, scriptName: string): string {
  if (packageManager === "npm") {
    if (scriptName === "test") return "npm test";
    if (scriptName === "start") return "npm start";
    return `npm run ${scriptName}`;
  }

  if (packageManager === "yarn") {
    return `yarn ${scriptName}`;
  }

  return `${packageManager} ${scriptName}`;
}

function detectNodeCommands(packageManager: PackageManager | undefined, packageJson: PackageJson | undefined): string[] {
  if (!packageManager || !packageJson) {
    return [];
  }

  const commands = [installCommand(packageManager)];
  const scripts = packageJson.scripts ?? {};

  for (const scriptName of wellKnownScripts) {
    if (scripts[scriptName]) {
      addUnique(commands, scriptCommand(packageManager, scriptName));
    }
  }

  return commands;
}

function detectCommands(
  rootPath: string,
  packageManager: PackageManager | undefined,
  packageJson: PackageJson | undefined,
  detectedStack: string[]
): string[] {
  const commands = detectNodeCommands(packageManager, packageJson);

  if (detectedStack.includes("Flutter / Dart")) {
    addUnique(commands, "flutter pub get");
    addUnique(commands, "flutter run");
    addUnique(commands, "flutter test");
  }

  if (detectedStack.includes("Python")) {
    if (exists(rootPath, "requirements.txt")) addUnique(commands, "pip install -r requirements.txt");
    addUnique(commands, "python main.py");
    addUnique(commands, "pytest");
  }

  if (detectedStack.includes("Rust")) {
    addUnique(commands, "cargo build");
    addUnique(commands, "cargo test");
  }

  if (detectedStack.includes("Go")) {
    addUnique(commands, "go test ./...");
    addUnique(commands, "go run .");
  }

  return commands;
}

function getProjectName(rootPath: string, packageJson: PackageJson | undefined): string {
  return packageJson?.name || path.basename(rootPath);
}

export function collectProjectInfo(rootPath = process.cwd()): ProjectInfo {
  const packageJson = readPackageJson(rootPath);
  const packageManager = detectPackageManager(rootPath);
  const detectedStack = detectStack(rootPath, packageJson);

  return {
    projectName: getProjectName(rootPath, packageJson),
    rootPath,
    detectedStack,
    importantFiles: detectImportantFiles(rootPath),
    packageManager,
    commands: detectCommands(rootPath, packageManager, packageJson, detectedStack)
  };
}
