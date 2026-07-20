// App name: Job Mitra
// File name: SmartCandidateGroups.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\SmartCandidateGroups.tsx

import { groupApplications } from "../helpers/smartSelectionHelpers";
import type { ScoredApplication } from "../helpers/smartSelectionHelpers";
import type { SmartCandidateGroupProps } from "../types/smartCandidateGroup.types";
import { SmartCandidateBlock } from "./SmartCandidateBlock";
import { SmartCandidateGroupHeader } from "./SmartCandidateGroupHeader";

export function SmartCandidateGroups({
  apps,
  tab,
  isBusy,
  quickQuestions,
  onMoveToShortlist,
  onMoveToWaiting,
  onConfirm,
  onOpenGroup,
  onRemove,
  onReplace,
  onPriorityTag,
  priorityTags,
}: SmartCandidateGroupProps) {
  const grouped = groupApplications(apps);

  const cardProps = {
    tab,
    isBusy,
    quickQuestions,
    onMoveToShortlist,
    onMoveToWaiting,
    onConfirm,
    onOpenGroup,
    onRemove,
    onReplace,
    onPriorityTag,
    priorityTags,
  };

  if (apps.length === 0) {
    return (
      <div className="wm-er-card" style={{ padding: 16, textAlign: "center" }}>
        <div style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>No candidates here.</div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <SmartCandidateSection
        title="Top Picks"
        subtitle="Highly rated candidates with a strong match for this shift"
        count={grouped.top.length}
        color="#15803d"
        bg="rgba(22,163,74,0.04)"
        items={grouped.top}
        cardProps={cardProps}
      />

      <SmartCandidateSection
        title="Good Fit"
        subtitle="Suitable candidates worth considering"
        count={grouped.good.length}
        color="#0369a1"
        bg="rgba(3,105,161,0.04)"
        items={grouped.good}
        cardProps={cardProps}
      />

      <SmartCandidateSection
        title="Others"
        subtitle="Review carefully before shortlisting"
        count={grouped.others.length}
        color="#64748b"
        bg="rgba(100,116,139,0.04)"
        items={grouped.others}
        cardProps={cardProps}
      />
    </div>
  );
}

function SmartCandidateSection({
  title,
  subtitle,
  count,
  color,
  bg,
  items,
  cardProps,
}: {
  title: string;
  subtitle: string;
  count: number;
  color: string;
  bg: string;
  items: ScoredApplication[];
  cardProps: Omit<SmartCandidateGroupProps, "apps">;
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <SmartCandidateGroupHeader
        title={title}
        subtitle={subtitle}
        count={count}
        color={color}
        bg={bg}
      />

      <div style={{ display: "grid", gap: 10 }}>
        {items.map((scored) => (
          <SmartCandidateBlock key={scored.app.id} scored={scored} {...cardProps} />
        ))}
      </div>
    </div>
  );
}
