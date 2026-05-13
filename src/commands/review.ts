import { buildReview } from "../review/checks.js";
import { formatReview, formatReviewFailure, formatReviewFailureJson, formatReviewJson } from "../review/format.js";

type RunReviewOptions = {
  format?: "text" | "json";
};

export function runReview(rootPath = process.cwd(), options: RunReviewOptions = {}): void {
  const format = options.format ?? "text";

  try {
    const categories = buildReview(rootPath);
    process.stdout.write(format === "json" ? formatReviewJson(categories) : formatReview(categories));
  } catch {
    process.stdout.write(format === "json" ? formatReviewFailureJson() : formatReviewFailure());
  }
}
