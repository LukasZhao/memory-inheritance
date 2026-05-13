export type Severity = "pass" | "warning" | "critical";

export type ReviewCheck = {
  label: string;
  severity: Severity;
  impact?: string;
  nextStepKey?: NextStepKey;
};

export type ReviewCategory = {
  title: string;
  checks: ReviewCheck[];
};

export type NextStepKey =
  | "init"
  | "current-development-state"
  | "manual-notes"
  | "architecture-decisions"
  | "git-memory"
  | "project-memory-too-long"
  | "metadata-references"
  | "ready";

export type MemoryReferenceLike = {
  id?: string;
  criticality?: unknown;
  readWhen?: unknown;
  lastUpdated?: unknown;
};

export type MemoryIndexLike = {
  references?: MemoryReferenceLike[];
};

export type ReviewJsonCheck = {
  label: string;
  severity: Severity;
  impact: string | null;
  nextStepKey: NextStepKey | null;
};

export type ReviewJsonCategory = {
  title: string;
  checks: ReviewJsonCheck[];
};

export type ReviewJsonOutput = {
  overallStatus: string;
  categories: ReviewJsonCategory[];
  suggestedNextSteps: string[];
};
