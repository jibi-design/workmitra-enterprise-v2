/** Job Mitra | statusBadge.mappers.ts | Tone mapping helpers (non-component exports) */

import type { EnterpriseTone } from "./enterprise.types";

/** Map common career post statuses → tone + label */
export function careerPostStatusToBadge(status: string): { label: string; tone: EnterpriseTone } {
  switch (status) {
    case "active":
      return { label: "Active", tone: "active" };
    case "paused":
      return { label: "Paused", tone: "warning" };
    case "closed":
      return { label: "Closed", tone: "critical" };
    case "filled":
      return { label: "Filled", tone: "active" };
    case "draft":
    default:
      return { label: "Draft", tone: "neutral" };
  }
}

/** Map shift priority tags → tone + label */
export function shiftPriorityToBadge(tag: "priority" | "good" | "review"): {
  label: string;
  tone: EnterpriseTone;
} {
  switch (tag) {
    case "priority":
      return { label: "Best Match", tone: "active" };
    case "good":
      return { label: "Good Fit", tone: "active" };
    case "review":
      return { label: "Review Needed", tone: "warning" };
  }
}
