import { buildReview } from "../review/checks.js";
import { formatReview, formatReviewFailure } from "../review/format.js";

export function runReview(rootPath = process.cwd()): void {
  try {
    process.stdout.write(formatReview(buildReview(rootPath)));
  } catch {
    process.stdout.write(formatReviewFailure());
  }
}
