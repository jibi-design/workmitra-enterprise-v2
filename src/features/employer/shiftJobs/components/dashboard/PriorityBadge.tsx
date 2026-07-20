// App name: Job Mitra
// File name: PriorityBadge.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\dashboard\PriorityBadge.tsx

import type { PriorityTag } from "../../storage/employerShift.storage";

const PRIORITY_STYLES: Record<PriorityTag, { label: string; color: string; bg: string }> = {
  priority: {
    label: "Best Match",
    color: "#15803d",
    bg: "rgba(22,163,74,0.1)",
  },
  good: {
    label: "Good Fit",
    color: "#16a34a",
    bg: "rgba(22,163,74,0.08)",
  },
  review: {
    label: "Review Needed",
    color: "#d97706",
    bg: "rgba(217,119,6,0.08)",
  },
};

export function PriorityBadge({ tag }: { tag?: PriorityTag }) {
  if (!tag) return null;

  const style = PRIORITY_STYLES[tag];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 10,
        fontWeight: 950,
        padding: "4px 9px",
        borderRadius: 999,
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.color}33`,
        whiteSpace: "nowrap",
      }}
    >
      {style.label}
    </span>
  );
}
