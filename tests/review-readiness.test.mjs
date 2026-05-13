import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

import { runReview } from "../dist/commands/review.js";
import { syncMemory } from "../dist/memory.js";
import { collectProjectInfo } from "../dist/scanner.js";

function makeTempProject() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "mem-extract-test-"));
}

function writeFile(rootPath, relativePath, content) {
  const targetPath = path.join(rootPath, relativePath);
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, content, "utf8");
}

function jsonFileContent(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function reviewFixtureOptions(overrides = {}) {
  return {
    timestamp: overrides.timestamp ?? new Date().toISOString(),
    currentDevelopmentState:
      overrides.currentDevelopmentState ??
      "Preparing the v0.5 review readiness work with local deterministic fixture coverage.",
    manualNotes:
      overrides.manualNotes ??
      "- [2026-05-13] customer requires all processing to stay local and transparent.",
    architectureDecisions:
      overrides.architectureDecisions ??
      "- [2026-05-13] Use Markdown marker sections as the source of generated memory truth.",
    gitMemory:
      overrides.gitMemory ??
      `## Recent Development Memory

Generated from deterministic fixture commits.

### Testing

- Add fixture coverage for review readiness.`
  };
}

function projectMemoryFixture({
  timestamp,
  currentDevelopmentState,
  manualNotes,
  architectureDecisions,
  gitMemory
}) {
  return `# PROJECT_MEMORY.md

Memory Inheritance canonical project memory for tests.

<!-- AUTO-START:PROJECT-SCAN -->
## Project Overview

Project name: fixture-project

## Detected Tech Stack

- Node.js
- TypeScript

## Important Files and Folders

- README.md
- package.json
- src

## Common Commands

- npm install
- npm test

## Memory References

Detailed memory files are indexed in \`.memory/index.json\`.

## Generated

- Generated at: ${timestamp}
<!-- AUTO-END:PROJECT-SCAN -->

<!-- AUTO-START:GIT-MEMORY -->
${gitMemory}
<!-- AUTO-END:GIT-MEMORY -->

## Manual Notes

${manualNotes}

## Architecture Decisions

${architectureDecisions}

## Current Development State

${currentDevelopmentState}

## Forbidden Tech/Patterns

- Do not remove generated memory markers.

## AI Collaboration Rules

- Read PROJECT_MEMORY.md before making changes.
- Preserve marker-safe sync behavior.
`;
}

function writeAdapterFixtures(rootPath) {
  writeFile(
    rootPath,
    "AGENTS.md",
    `# AGENTS.md

Before making changes, read PROJECT_MEMORY.md.
Use .memory/index.json only when detailed context is needed.
`
  );

  writeFile(
    rootPath,
    "CLAUDE.md",
    `# CLAUDE.md

Before editing this repository, read PROJECT_MEMORY.md.
Use .memory/index.json as a reference index.
`
  );
}

function writeMemoryIndexFixture(rootPath, timestamp) {
  writeFile(
    rootPath,
    ".memory/index.json",
    jsonFileContent({
      version: "0.4.0",
      canonicalMemory: "PROJECT_MEMORY.md",
      generatedAt: timestamp,
      project: {
        name: "fixture-project",
        stack: ["Node.js", "TypeScript"],
        packageManager: "npm"
      },
      references: [
        {
          id: "review",
          title: "Memory Readiness Review",
          path: ".memory/modules/review.md",
          category: "module",
          summary: "Checks whether memory is ready for AI agents.",
          readWhen: ["testing review readiness"],
          sourceFiles: ["src/commands/review.ts"],
          risk: "low",
          stability: "active",
          estimatedTokens: 600,
          criticality: 7,
          priority: 70,
          lastUpdated: timestamp
        }
      ]
    })
  );
}

function writeMemoryModuleFixtures(rootPath) {
  writeFile(
    rootPath,
    ".memory/modules/review.md",
    `# Memory Readiness Review

Fixture module content for local review readiness tests.
`
  );
}

function writeReviewFixture(rootPath, overrides = {}) {
  const fixture = reviewFixtureOptions(overrides);

  writeFile(rootPath, "PROJECT_MEMORY.md", projectMemoryFixture(fixture));
  writeAdapterFixtures(rootPath);
  writeMemoryIndexFixture(rootPath, fixture.timestamp);
  writeMemoryModuleFixtures(rootPath);
}

function captureReview(rootPath) {
  const originalWrite = process.stdout.write;
  let output = "";

  process.stdout.write = function write(chunk, encoding, callback) {
    output += typeof chunk === "string" ? chunk : chunk.toString();

    if (typeof callback === "function") {
      callback();
    }

    return true;
  };

  try {
    runReview(rootPath);
  } finally {
    process.stdout.write = originalWrite;
  }

  return output;
}

test("review reports Ready when all required memory context is present", () => {
  const rootPath = makeTempProject();
  writeReviewFixture(rootPath);

  const output = captureReview(rootPath);

  assert.match(output, /Status: Ready — agent can take over immediately/);
  assert.doesNotMatch(output, /❌|⚠️/);
});

test("review reports Usable when non-critical context is missing", () => {
  const rootPath = makeTempProject();
  writeReviewFixture(rootPath, {
    manualNotes: ""
  });

  const output = captureReview(rootPath);

  assert.match(output, /Status: Usable — agent can work, but has clear blind spots/);
  assert.match(output, /Manual Notes is empty/);
  assert.doesNotMatch(output, /Status: Incomplete/);
});

test("review reports Incomplete when current development state is missing", () => {
  const rootPath = makeTempProject();
  writeReviewFixture(rootPath, {
    currentDevelopmentState: "Add current feature status here."
  });

  const output = captureReview(rootPath);

  assert.match(output, /Status: Incomplete — agent will frequently ask basic questions/);
  assert.match(output, /Current Development State is empty/);
});

test("sync preserves manual notes and architecture decisions outside generated markers", () => {
  const rootPath = makeTempProject();
  const manualNote = "- [2026-05-13] Keep all memory processing local to the developer machine.";
  const architectureDecision = "- [2026-05-13] Preserve Markdown markers as the safe sync boundary.";

  writeReviewFixture(rootPath, {
    manualNotes: manualNote,
    architectureDecisions: architectureDecision
  });
  writeFile(
    rootPath,
    "package.json",
    jsonFileContent({
      name: "fixture-project",
      scripts: {
        test: "node --test"
      }
    })
  );

  const info = collectProjectInfo(rootPath);
  syncMemory(info);
  const updatedProjectMemory = fs.readFileSync(path.join(rootPath, "PROJECT_MEMORY.md"), "utf8");

  assert.match(updatedProjectMemory, /<!-- AUTO-START:PROJECT-SCAN -->/);
  assert.match(updatedProjectMemory, /<!-- AUTO-END:PROJECT-SCAN -->/);
  assert.match(updatedProjectMemory, /<!-- AUTO-START:GIT-MEMORY -->/);
  assert.match(updatedProjectMemory, /<!-- AUTO-END:GIT-MEMORY -->/);
  assert.ok(updatedProjectMemory.includes(manualNote));
  assert.ok(updatedProjectMemory.includes(architectureDecision));
});
