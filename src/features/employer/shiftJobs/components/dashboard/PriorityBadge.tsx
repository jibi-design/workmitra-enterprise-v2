// App name: Job Mitra
// File name: PriorityBadge.tsx
// Ultra-Enterprise U1 — StatusBadge adapter

import type { PriorityTag } from "../../storage/employerShift.storage";
import { StatusBadge, shiftPriorityToBadge } from "../../../../../shared/components/enterprise";

export function PriorityBadge({ tag }: { tag?: PriorityTag }) {
  if (!tag) return null;
  const mapped = shiftPriorityToBadge(tag);
  return <StatusBadge label={mapped.label} tone={mapped.tone} accent="shift" />;
}
