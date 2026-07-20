// App name: Job Mitra
// File name: SmartCandidatePriorityRow.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\SmartCandidatePriorityRow.tsx

import type {
  EmployeeShiftApplication,
  PriorityTag,
} from "../../shiftJobs/storage/employerShift.storage";
import { PriorityBadge } from "./ShiftDashboardComponents";

type SmartCandidatePriorityRowProps = {
  app: EmployeeShiftApplication;
  onPriorityTag: (id: string, tag: PriorityTag | undefined) => void;
  priorityTags: Record<string, PriorityTag | undefined>;
};

const TAGS: PriorityTag[] = ["priority", "good", "review"];

const LABELS: Record<PriorityTag, string> = {
  priority: "Priority",
  good: "Good fit",
  review: "Review",
};

export function SmartCandidatePriorityRow({
  app,
  onPriorityTag,
  priorityTags,
}: SmartCandidatePriorityRowProps) {
  const currentTag = priorityTags[app.id] ?? app.priorityTag;

  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4, paddingLeft: 2 }}>
      <PriorityBadge tag={currentTag} />

      <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
        {TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onPriorityTag(app.id, currentTag === tag ? undefined : tag)}
            style={{
              fontSize: 10,
              padding: "2px 8px",
              borderRadius: 999,
              border: "1px solid var(--wm-er-border)",
              background: currentTag === tag ? "var(--wm-er-accent-shift)" : "var(--wm-er-surface)",
              color: currentTag === tag ? "#fff" : "var(--wm-er-muted)",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {LABELS[tag]}
          </button>
        ))}
      </div>
    </div>
  );
}
