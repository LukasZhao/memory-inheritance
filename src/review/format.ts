import type { NextStepKey, ReviewCategory, ReviewJsonOutput, Severity } from "./types.js";

export const separator = "────────────────────────────────────────";

function statusIcon(severity: Severity): string {
  if (severity === "pass") return "✅";
  if (severity === "warning") return "⚠️";
  return "❌";
}

function overallStatus(categories: ReviewCategory[]): string {
  const checks = categories.flatMap((category) => category.checks);

  if (checks.some((check) => check.severity === "critical")) {
    return "Incomplete — agent will frequently ask basic questions";
  }

  if (checks.some((check) => check.severity === "warning")) {
    return "Usable — agent can work, but has clear blind spots";
  }

  return "Ready — agent can take over immediately";
}

function nextSteps(categories: ReviewCategory[]): string[] {
  const checks = categories.flatMap((category) => category.checks);
  const failedKeys = new Set(checks.filter((check) => check.severity !== "pass").map((check) => check.nextStepKey));
  const stepsByKey: Record<NextStepKey, string> = {
    init: "Run: npx mem-extract init",
    "current-development-state": "Fill in Current Development State — what are you building right now, what's blocked",
    "manual-notes": 'Run: npx mem-extract note "Add a hidden project constraint or important context"',
    "architecture-decisions": 'Run: npx mem-extract decide "Explain one important technical decision"',
    "git-memory": "Run: npx mem-extract sync --recent 10",
    "project-memory-too-long": "Consider trimming PROJECT_MEMORY.md — it may consume too many tokens per session",
    "metadata-references": "Run: npx mem-extract sync to regenerate metadata references",
    ready: "Memory looks good. Run npx mem-extract sync --recent 10 regularly to keep Git memory fresh."
  };
  const priority: NextStepKey[] = [
    "init",
    "current-development-state",
    "manual-notes",
    "architecture-decisions",
    "git-memory",
    "project-memory-too-long",
    "metadata-references"
  ];
  const steps = priority.filter((key) => failedKeys.has(key)).map((key) => stepsByKey[key]);

  return steps.length > 0 ? steps.slice(0, 4) : [stepsByKey.ready];
}

export function formatReview(categories: ReviewCategory[]): string {
  const lines = ["Memory Readiness Review", separator, `Status: ${overallStatus(categories)}`];

  for (const category of categories) {
    lines.push("", category.title);

    for (const check of category.checks) {
      lines.push(`  ${statusIcon(check.severity)} ${check.label}`);

      if (check.severity !== "pass" && check.impact) {
        lines.push(`    → ${check.impact}`);
      }
    }
  }

  lines.push(separator, "Suggested next steps:");
  nextSteps(categories).forEach((step, index) => {
    lines.push(` ${index + 1}. ${step}`);
  });
  lines.push(separator);

  return `${lines.join("\n")}\n`;
}

export function formatReviewJson(categories: ReviewCategory[]): string {
  const output: ReviewJsonOutput = {
    overallStatus: overallStatus(categories),
    categories: categories.map((category) => ({
      title: category.title,
      checks: category.checks.map((check) => ({
        label: check.label,
        severity: check.severity,
        impact: check.impact ?? null,
        nextStepKey: check.nextStepKey ?? null
      }))
    })),
    suggestedNextSteps: nextSteps(categories)
  };

  return `${JSON.stringify(output, null, 2)}\n`;
}

export function formatReviewFailure(): string {
  return `Memory Readiness Review\n${separator}\nStatus: Incomplete — agent will frequently ask basic questions\n\nStructure\n  ❌ Review could not complete\n    → A local file could not be inspected safely\n${separator}\nSuggested next steps:\n 1. Run: npx mem-extract init\n${separator}\n`;
}

export function formatReviewFailureJson(): string {
  return formatReviewJson([
    {
      title: "Structure",
      checks: [
        {
          label: "Review could not complete",
          severity: "critical",
          impact: "A local file could not be inspected safely",
          nextStepKey: "init"
        }
      ]
    }
  ]);
}
