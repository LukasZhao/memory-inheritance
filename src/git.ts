import { execFileSync } from "node:child_process";

export type GitCommit = {
  hash: string;
  date: string;
  subject: string;
};

type CommitCategory = {
  key: string;
  title: string;
};

const categoryByType: Record<string, CommitCategory> = {
  feat: { key: "feature", title: "Feature work" },
  fix: { key: "fix", title: "Bug fixes" },
  docs: { key: "docs", title: "Documentation" },
  test: { key: "test", title: "Testing" },
  refactor: { key: "refactor", title: "Refactoring" },
  chore: { key: "chore", title: "Maintenance" },
  build: { key: "build", title: "Build/package" },
  ci: { key: "ci", title: "CI/CD" }
};

const categoryOrder = [
  "feature",
  "fix",
  "docs",
  "test",
  "refactor",
  "chore",
  "build",
  "ci",
  "other"
];

function runGit(rootPath: string, args: string[]): string | undefined {
  try {
    return execFileSync("git", ["-C", rootPath, ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
  } catch {
    return undefined;
  }
}

export function isGitRepository(rootPath: string): boolean {
  return runGit(rootPath, ["rev-parse", "--is-inside-work-tree"]) === "true";
}

export function readRecentCommits(rootPath: string, count: number): GitCommit[] | undefined {
  if (!isGitRepository(rootPath)) {
    return undefined;
  }

  const output = runGit(rootPath, ["log", "-n", String(count), "--pretty=format:%h%x09%ad%x09%s", "--date=short"]);

  if (!output) {
    return [];
  }

  return output
    .split("\n")
    .map((line) => line.split("\t"))
    .filter((parts) => parts.length >= 3)
    .map(([hash, date, ...subjectParts]) => ({
      hash,
      date,
      subject: subjectParts.join("\t").trim()
    }));
}

function sentenceCase(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return trimmed;
  }

  const capitalized = `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`;
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}

function categorizeCommit(subject: string): { key: string; title: string; summary: string } {
  const match = /^(?<type>[a-z]+)(?:\([^)]+\))?!?:\s*(?<message>.+)$/i.exec(subject);

  if (!match?.groups) {
    return {
      key: "other",
      title: "Other changes",
      summary: sentenceCase(subject)
    };
  }

  const type = match.groups.type.toLowerCase();
  const category = categoryByType[type] ?? { key: "other", title: "Other changes" };

  return {
    ...category,
    summary: sentenceCase(match.groups.message)
  };
}

export function summarizeRecentCommits(commits: GitCommit[], requestedCount: number): string {
  if (commits.length === 0) {
    return `## Recent Development Memory

No Git commits found yet.`;
  }

  const grouped = new Map<string, { title: string; summaries: string[] }>();

  for (const commit of commits) {
    const category = categorizeCommit(commit.subject);
    const group = grouped.get(category.key) ?? { title: category.title, summaries: [] };

    if (!group.summaries.includes(category.summary)) {
      group.summaries.push(category.summary);
    }

    grouped.set(category.key, group);
  }

  const sections = categoryOrder
    .map((key) => grouped.get(key))
    .filter((group): group is { title: string; summaries: string[] } => Boolean(group))
    .map((group) => {
      const visibleSummaries = group.summaries.slice(0, 6);
      const hiddenCount = group.summaries.length - visibleSummaries.length;
      const bullets = visibleSummaries.map((summary) => `- ${summary}`);

      if (hiddenCount > 0) {
        bullets.push(`- ${hiddenCount} more related changes summarized in Git history.`);
      }

      return `### ${group.title}

${bullets.join("\n")}`;
    });

  return `## Recent Development Memory

Generated from the latest ${requestedCount} Git commits.

${sections.join("\n\n")}`;
}
