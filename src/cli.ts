import minimist from "minimist";

import { collectProjectInfo } from "./scanner.js";
import { renderList } from "./markdown.js";
import { getMemoryState, initMemory, inspectSection, syncMemory } from "./memory.js";
import { resolveTargetRoot } from "./targetRoot.js";

const usage = `Usage:
  mem-extract [init]
  mem-extract init --force
  mem-extract sync
  mem-extract status
  mem-extract inspect <section>

Commands:
  init       Generate memory files that do not already exist
  sync       Refresh detected sections in memory files
  status     Show detected stack, commands, and memory file state
  inspect    Print one memory section by heading name

Options:
  --force    Overwrite existing memory files during init
  -h, --help Show this help message
`;

function printStatus(): void {
  const targetRoot = resolveTargetRoot();
  const info = collectProjectInfo(targetRoot);
  const memoryState = getMemoryState(info.rootPath);

  console.log(`Project: ${info.projectName}`);
  console.log(`Root: ${info.rootPath}`);
  console.log("\nDetected Tech Stack");
  console.log(renderList(info.detectedStack));
  console.log("\nCommon Commands");
  console.log(renderList(info.commands));
  console.log("\nMemory Files");
  for (const [fileName, exists] of Object.entries(memoryState)) {
    console.log(`- ${fileName}: ${exists ? "present" : "missing"}`);
  }
}

function printScanHeader(commandName: string, options: { force?: boolean } = {}): void {
  const targetRoot = resolveTargetRoot();
  const info = collectProjectInfo(targetRoot);
  console.log(`Running ${commandName}: ${info.projectName}`);
  console.log(`Target root: ${info.rootPath}`);
  console.log(`Detected stack: ${info.detectedStack.join(", ")}`);

  if (commandName === "init") {
    initMemory(info, { force: options.force });
  } else {
    syncMemory(info);
  }

  console.log("Done.");
}

export function runCli(argv: string[]): void {
  const args = minimist(argv, {
    alias: {
      h: "help"
    },
    boolean: ["force", "help"]
  });

  const command = String(args._[0] ?? "init");

  if (args.help) {
    console.log(usage.trimEnd());
    return;
  }

  if (command === "init") {
    printScanHeader("init", { force: args.force });
    return;
  }

  if (command === "sync") {
    printScanHeader("sync");
    return;
  }

  if (command === "status") {
    printStatus();
    return;
  }

  if (command === "inspect") {
    const sectionName = args._.slice(1).join(" ");

    if (!sectionName) {
      console.error("Missing section name.");
      console.error("Example: mem-extract inspect \"Common Commands\"");
      process.exitCode = 1;
      return;
    }

    const targetRoot = resolveTargetRoot();
    const section = inspectSection(targetRoot, sectionName);

    if (!section) {
      console.error(`Section not found: ${sectionName}`);
      process.exitCode = 1;
      return;
    }

    process.stdout.write(section);
    return;
  }

  console.error(`Unknown command: ${command}`);
  console.error(usage.trimEnd());
  process.exitCode = 1;
}
