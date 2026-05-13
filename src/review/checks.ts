import fs from "node:fs";
import path from "node:path";

import type { MemoryIndexLike, NextStepKey, ReviewCategory, ReviewCheck } from "./types.js";

function safeReadFile(rootPath: string, relativePath: string): string | undefined {
  try {
    return fs.readFileSync(path.join(rootPath, relativePath), "utf8");
  } catch {
    return undefined;
  }
}

function fileExists(rootPath: string, relativePath: string): boolean {
  return fs.existsSync(path.join(rootPath, relativePath));
}

function directoryExists(rootPath: string, relativePath: string): boolean {
  try {
    return fs.statSync(path.join(rootPath, relativePath)).isDirectory();
  } catch {
    return false;
  }
}

function readMemoryIndex(rootPath: string): MemoryIndexLike | undefined {
  const content = safeReadFile(rootPath, ".memory/index.json");

  if (!content) {
    return undefined;
  }

  try {
    return JSON.parse(content) as MemoryIndexLike;
  } catch {
    return undefined;
  }
}

function parseSections(content: string | undefined): Map<string, string> {
  const sections = new Map<string, string>();

  if (!content) {
    return sections;
  }

  const matches = [...content.matchAll(/^##[ \t]+(.+?)[ \t]*$/gm)];

  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const nextMatch = matches[index + 1];
    const heading = match[1].trim();
    const headingEnd = (match.index ?? 0) + match[0].length;
    const bodyStart = content[headingEnd] === "\r" && content[headingEnd + 1] === "\n" ? headingEnd + 2 : headingEnd + 1;
    const bodyEnd = nextMatch?.index ?? content.length;
    sections.set(heading.toLowerCase(), content.slice(bodyStart, bodyEnd));
  }

  return sections;
}

function findSection(sections: Map<string, string>, headingName: string): string | undefined {
  const query = headingName.toLowerCase();

  for (const [heading, body] of sections) {
    if (heading === query || heading.includes(query) || query.includes(heading)) {
      return body;
    }
  }

  return undefined;
}

function meaningfulTextLength(sectionBody: string | undefined): number {
  if (!sectionBody) {
    return 0;
  }

  const text = sectionBody
    .replace(/<!--[\s\S]*?-->/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !/^example:?$/i.test(line))
    .filter((line) => !/^add .+ here\.?$/i.test(line))
    .filter((line) => !/^-\s*do not use redux\.?$/i.test(line))
    .join("\n")
    .trim();

  return text.length;
}

function markedContentLength(content: string | undefined, markerName: string): number {
  if (!content) {
    return 0;
  }

  const markerPattern = new RegExp(`<!-- AUTO-START:${markerName} -->([\\s\\S]*?)<!-- AUTO-END:${markerName} -->`);
  const match = markerPattern.exec(content);

  if (!match) {
    return 0;
  }

  const body = match[1]
    .replace(/^##[ \t]+Recent Development Memory[ \t]*$/gim, "")
    .replace("No Git memory generated yet.", "");

  return meaningfulTextLength(body);
}

function hasMarkedSection(content: string | undefined, markerName: string): boolean {
  if (!content) {
    return false;
  }

  return content.includes(`<!-- AUTO-START:${markerName} -->`) && content.includes(`<!-- AUTO-END:${markerName} -->`);
}

function checkTextContains(content: string | undefined, value: string): boolean {
  return Boolean(content?.includes(value));
}

function pass(label: string): ReviewCheck {
  return { label, severity: "pass" };
}

function warning(label: string, impact: string, nextStepKey?: NextStepKey): ReviewCheck {
  return { label, severity: "warning", impact, nextStepKey };
}

function critical(label: string, impact: string, nextStepKey?: NextStepKey): ReviewCheck {
  return { label, severity: "critical", impact, nextStepKey };
}

function checkSection(
  sections: Map<string, string>,
  headingName: string,
  level: "critical" | "warning",
  passLabel: string,
  failLabel: string,
  impact: string,
  nextStepKey?: NextStepKey
): ReviewCheck {
  const section = findSection(sections, headingName);
  const isPresent = meaningfulTextLength(section) >= 20;

  if (isPresent) {
    return pass(passLabel);
  }

  return level === "critical" ? critical(failLabel, impact, nextStepKey) : warning(failLabel, impact, nextStepKey);
}

function newestReferenceTimestamp(index: MemoryIndexLike | undefined): Date | undefined {
  const timestamps = (index?.references ?? [])
    .map((reference) => (typeof reference.lastUpdated === "string" ? Date.parse(reference.lastUpdated) : Number.NaN))
    .filter((timestamp) => Number.isFinite(timestamp));

  if (timestamps.length === 0) {
    return undefined;
  }

  return new Date(Math.max(...timestamps));
}

function memoryAgeDays(index: MemoryIndexLike | undefined): number | undefined {
  const newestTimestamp = newestReferenceTimestamp(index);

  if (!newestTimestamp) {
    return undefined;
  }

  const ageMs = Date.now() - newestTimestamp.getTime();
  return Math.max(0, Math.floor(ageMs / 86_400_000));
}

export function buildReview(rootPath: string): ReviewCategory[] {
  const projectMemory = safeReadFile(rootPath, "PROJECT_MEMORY.md");
  const claude = safeReadFile(rootPath, "CLAUDE.md");
  const agents = safeReadFile(rootPath, "AGENTS.md");
  const index = readMemoryIndex(rootPath);
  const references = index?.references ?? [];
  const sections = parseSections(projectMemory);
  const projectMemoryLineCount = projectMemory?.split(/\r?\n/).length ?? 0;

  const structure: ReviewCategory = {
    title: "Structure",
    checks: [
      fileExists(rootPath, "PROJECT_MEMORY.md")
        ? pass("PROJECT_MEMORY.md exists")
        : critical("PROJECT_MEMORY.md is missing", "Agent cannot load canonical memory", "init"),
      fileExists(rootPath, "CLAUDE.md")
        ? pass("CLAUDE.md exists")
        : warning("CLAUDE.md is missing", "Claude Code may not load project memory automatically", "init"),
      fileExists(rootPath, "AGENTS.md")
        ? pass("AGENTS.md exists")
        : warning("AGENTS.md is missing", "Codex or generic agents may not load project memory automatically", "init"),
      fileExists(rootPath, ".memory/index.json")
        ? pass(".memory/index.json exists")
        : warning(".memory/index.json is missing", "Agent cannot use metadata routing", "metadata-references"),
      directoryExists(rootPath, ".memory/modules")
        ? pass(".memory/modules/ exists")
        : warning(".memory/modules/ is missing", "Detailed memory references cannot be loaded", "metadata-references")
    ]
  };

  const adapterReadiness: ReviewCategory = {
    title: "Agent Adapter Readiness",
    checks: [
      checkTextContains(claude, "PROJECT_MEMORY.md")
        ? pass("CLAUDE.md correctly references PROJECT_MEMORY.md")
        : critical("CLAUDE.md does not reference PROJECT_MEMORY.md", "Claude Code won't know to read canonical memory", "init"),
      checkTextContains(agents, "PROJECT_MEMORY.md")
        ? pass("AGENTS.md correctly references PROJECT_MEMORY.md")
        : warning("AGENTS.md does not reference PROJECT_MEMORY.md", "Codex won't know to read canonical memory", "init"),
      checkTextContains(claude, "index.json")
        ? pass("CLAUDE.md references .memory/index.json")
        : warning("CLAUDE.md does not reference .memory/index.json", "Agent won't know to use metadata routing")
    ]
  };

  const contextRichness: ReviewCategory = {
    title: "Context Richness",
    checks: [
      checkSection(
        sections,
        "Project Overview",
        "critical",
        "Project Overview is present",
        "Project Overview is empty",
        "Agent won't know what this project is",
        "init"
      ),
      checkSection(
        sections,
        "Current Development State",
        "critical",
        "Current Development State is present",
        "Current Development State is empty",
        "Agent won't know what you're currently working on",
        "current-development-state"
      ),
      checkSection(
        sections,
        "Manual Notes",
        "warning",
        "Manual Notes is present",
        "Manual Notes is empty",
        "Agent won't know hidden constraints",
        "manual-notes"
      ),
      checkSection(
        sections,
        "Architecture Decisions",
        "warning",
        "Architecture Decisions is present",
        "Architecture Decisions has very little content",
        "Agent may remove intentional design choices",
        "architecture-decisions"
      ),
      checkSection(
        sections,
        "AI Collaboration Rules",
        "warning",
        "AI Collaboration Rules exists",
        "AI Collaboration Rules is missing or empty",
        "Agent has no behavioral guardrails"
      )
    ]
  };

  const tokenAwareOrganization: ReviewCategory = {
    title: "Token-Aware Organization",
    checks: [
      references.length > 0
        ? pass(".memory/index.json has references")
        : warning(".memory/index.json has no references", "Agent loads everything or nothing", "metadata-references"),
      references.every((reference) => typeof reference.criticality === "number")
        ? pass("References include criticality scores")
        : warning("Some references are missing criticality scores", "Agent can't prioritize what to read"),
      references.every((reference) => Array.isArray(reference.readWhen) && reference.readWhen.length > 0)
        ? pass("References include readWhen")
        : warning("Some references are missing readWhen", "Agent doesn't know when to load detail memory"),
      projectMemoryLineCount <= 800
        ? pass("PROJECT_MEMORY.md is compact")
        : warning("PROJECT_MEMORY.md is too long", "Wastes tokens on every session start", "project-memory-too-long")
    ]
  };

  const gitMemoryExists = hasMarkedSection(projectMemory, "GIT-MEMORY");
  const gitMemoryHasContent = markedContentLength(projectMemory, "GIT-MEMORY") >= 20;
  const ageDays = memoryAgeDays(index);
  const freshnessChecks: ReviewCheck[] = [
    gitMemoryExists
      ? pass("Git memory section exists")
      : warning("Git memory section is missing", "Agent doesn't know recent work", "git-memory"),
    gitMemoryHasContent
      ? pass("Git memory is present")
      : warning("Git memory is empty", "Agent doesn't know recent work", "git-memory")
  ];

  if (ageDays !== undefined) {
    if (ageDays > 14) {
      freshnessChecks.push(
        critical(`Memory is stale (${ageDays} days old)`, "Agent may be working from outdated context", "git-memory")
      );
    } else if (ageDays >= 7) {
      freshnessChecks.push(
        warning(
          `Git memory is ${ageDays} days old — consider running sync --recent 10`,
          "Agent may be working from outdated context",
          "git-memory"
        )
      );
    } else {
      freshnessChecks.push(pass("Memory is fresh"));
    }
  }

  return [structure, adapterReadiness, contextRichness, tokenAwareOrganization, { title: "Freshness", checks: freshnessChecks }];
}
