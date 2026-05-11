import minimist from "minimist";

import { runDecide } from "./commands/decide.js";
import { runNote } from "./commands/note.js";
import { runReview } from "./commands/review.js";
import { collectProjectInfo } from "./scanner.js";
import { renderList } from "./markdown.js";
import { getGitMemoryState, getMemoryState, initMemory, inspectMemory, syncMemory } from "./memory.js";
import { criticalityLabel, readMemoryIndex, sortedTopReferences, updateReferenceCriticality } from "./references.js";
import { resolveTargetRoot } from "./targetRoot.js";

const usage = `Usage:
  mem-extract [init]
  mem-extract init --force
  mem-extract sync
  mem-extract sync --force
  mem-extract sync --recent <n>
  mem-extract status
  mem-extract inspect <section>
  mem-extract inspect ref:<reference-id>
  mem-extract note "..."
  mem-extract decide "..."
  mem-extract review
  mem-extract score <reference-id> <score>
  mem-extract score list
  mem-extract score explain

Commands:
  init       Generate memory files that do not already exist
  sync       Refresh detected sections in memory files
  status     Show detected stack, commands, and memory file state
  inspect    Print one memory section by heading name
  note       Append a human note to PROJECT_MEMORY.md
  decide     Append an architecture decision to PROJECT_MEMORY.md
  review     Check whether project memory is ready for AI agents
  score      List, explain, or update memory reference criticality

Options:
  --force    Overwrite existing memory files during init, or adapter files during sync
  --recent   Update Git semantic memory from the latest n commits during sync
  -h, --help Show this help message
`;

function printStatus(): void {
  const targetRoot = resolveTargetRoot();
  const info = collectProjectInfo(targetRoot);
  const memoryState = getMemoryState(info.rootPath);
  const gitState = getGitMemoryState(info.rootPath);
  const index = readMemoryIndex(info.rootPath);

  console.log(`Project: ${info.projectName}`);
  console.log(`Root: ${info.rootPath}`);
  if (info.packageManager) {
    console.log(`Package Manager: ${info.packageManager}`);
  }
  console.log("\nDetected Tech Stack");
  console.log(renderList(info.detectedStack));
  console.log("\nCommon Commands");
  console.log(renderList(info.commands));
  console.log("\nMemory Files");
  for (const [fileName, exists] of Object.entries(memoryState)) {
    console.log(`- ${fileName}: ${exists ? "present" : "missing"}`);
  }

  console.log("\nGit");
  console.log(`- repository: ${gitState.repository ? "detected" : "not detected"}`);
  if (gitState.repository) {
    console.log(`- recent memory: ${gitState.recentMemory ? "present" : "missing"}`);
  }

  if (index) {
    console.log(`\nMemory References: ${index.references.length}`);
    console.log("\nTop Critical References");
    for (const reference of sortedTopReferences(index)) {
      console.log(`- ${reference.id}: ${reference.criticality}`);
    }
  }
}

function printScanHeader(commandName: string, options: { force?: boolean; recent?: number } = {}): void {
  const targetRoot = resolveTargetRoot();
  const info = collectProjectInfo(targetRoot);
  console.log(`Running ${commandName}: ${info.projectName}`);
  console.log(`Target root: ${info.rootPath}`);
  console.log(`Detected stack: ${info.detectedStack.join(", ")}`);

  if (commandName === "init") {
    initMemory(info, { force: options.force });
  } else {
    syncMemory(info, { force: options.force, recent: options.recent });
  }

  console.log("Done.");

  if (commandName === "init") {
    console.log("✓ Memory files created");
    console.log("Next: capture project context with:");
    console.log('npx mem-extract note "..."');
    console.log('npx mem-extract decide "..."');
    console.log("Then run `npx mem-extract review`");
  } else {
    console.log("✓ PROJECT_MEMORY.md updated");
    console.log("Tip: run `npx mem-extract review` to check if memory is ready for AI agents");
  }
}

export function runCli(argv: string[]): void {
  const args = minimist(argv, {
    alias: {
      h: "help"
    },
    boolean: ["force", "help"],
    string: ["recent"]
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
    const recent = parseRecentOption(args.recent);

    if (recent === false) {
      process.exitCode = 1;
      return;
    }

    printScanHeader("sync", { force: args.force, recent });
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
    const section = inspectMemory(targetRoot, sectionName);

    if (!section) {
      console.error(`Memory section or reference not found: ${sectionName}`);
      console.error("Use `mem-extract status` or `mem-extract score list` to see available memory references.");
      process.exitCode = 1;
      return;
    }

    process.stdout.write(section);
    return;
  }

  if (command === "note") {
    runNote(resolveTargetRoot(), args._.slice(1).join(" "));
    return;
  }

  if (command === "decide") {
    runDecide(resolveTargetRoot(), args._.slice(1).join(" "));
    return;
  }

  if (command === "review") {
    runReview(resolveTargetRoot());
    return;
  }

  if (command === "score") {
    handleScore(args._.slice(1).map(String));
    return;
  }

  console.error(`Unknown command: ${command}`);
  console.error(usage.trimEnd());
  process.exitCode = 1;
}

function printScoreGuide(): void {
  console.log(`Criticality Score Guide
1-3  low: optional context
4-6  medium: read when relevant
7-8  high: strongly recommended when relevant
9-10 critical: must read when relevant`);
}

function parseRecentOption(value: unknown): number | undefined | false {
  if (value === undefined) {
    return undefined;
  }

  const recent = Number(value);

  if (!Number.isInteger(recent) || recent < 1) {
    console.error("--recent must be a positive integer.");
    console.error("Example: mem-extract sync --recent 10");
    return false;
  }

  return recent;
}

function printScoreList(): void {
  const targetRoot = resolveTargetRoot();
  const index = readMemoryIndex(targetRoot);

  if (!index) {
    console.error("No memory index found. Run `npx mem-extract init` or `npx mem-extract sync` first.");
    process.exitCode = 1;
    return;
  }

  console.log("Memory Criticality Scores");
  for (const reference of index.references) {
    console.log(`- ${reference.id}: ${reference.criticality} ${criticalityLabel(reference.criticality)}`);
  }
}

function handleScore(args: string[]): void {
  const subcommand = args[0];

  if (!subcommand || subcommand === "list") {
    printScoreList();
    return;
  }

  if (subcommand === "explain") {
    printScoreGuide();
    return;
  }

  const referenceId = subcommand;
  const score = Number(args[1]);

  if (!Number.isInteger(score) || score < 1 || score > 10) {
    console.error("Score must be an integer between 1 and 10.");
    console.error("Example: mem-extract score markdown-sync 10");
    process.exitCode = 1;
    return;
  }

  const targetRoot = resolveTargetRoot();
  const updatedReference = updateReferenceCriticality(targetRoot, referenceId, score);

  if (!updatedReference) {
    console.error(`Reference not found: ${referenceId}`);
    console.error("Run `npx mem-extract score list` to see available references.");
    process.exitCode = 1;
    return;
  }

  console.log(`Updated memory reference: ${updatedReference.id}`);
  console.log(`Criticality: ${updatedReference.criticality}`);
}
