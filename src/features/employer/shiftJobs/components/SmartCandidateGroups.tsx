// src/features/employer/shiftJobs/components/SmartCandidateGroups.tsx
//
// Smart Selection UI — groups candidates into Top Picks / Good Fit / Others.
// Used in EmployerShiftPostDashboardPage when analysis is complete.

import type { EmployeeShiftApplication } from "../storage/employerShift.storage";
import type { PriorityTag } from "../storage/employerShift.storage";
import { groupApplications, LEVEL_LABEL, LEVEL_COLOR } from "../helpers/smartSelectionHelpers";
import type { ScoredApplication } from "../helpers/smartSelectionHelpers";
import { CandidateCard } from "./CandidateCard";
import { PriorityBadge } from "./ShiftDashboardComponents";
import type { DashboardTab } from "../helpers/shiftDashboardHelpers";

/* ------------------------------------------------ */
/* Group Header                                     */
/* ------------------------------------------------ */
type GroupHeaderProps = {
  icon: string;
  title: string;
  subtitle: string;
  count: number;
  color: string;
  bg: string;
};

function GroupHeader({ icon, title, subtitle, count, color, bg }: GroupHeaderProps) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 14px", borderRadius: 10,
      background: bg, border: `1px solid ${color}22`,
      marginBottom: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color }}>{title}</div>
          <div style={{ fontSize: 11, color, opacity: 0.8, marginTop: 1 }}>{subtitle}</div>
        </div>
      </div>
      <span style={{
        fontSize: 12, fontWeight: 700, color,
        background: `${color}18`, padding: "3px 10px", borderRadius: 999,
      }}>
        {count}
      </span>
    </div>
  );
}

/* ------------------------------------------------ */
/* Score Badge                                      */
/* ------------------------------------------------ */
function ScoreBadge({ scored }: { scored: ScoredApplication }) {
  const { avgStars, ratingCount, level, mustHavePct } = scored;
  const levelColor = LEVEL_COLOR[level];

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      flexWrap: "wrap", marginBottom: 4, paddingLeft: 2,
    }}>
      {/* Level badge */}
      <span style={{
        fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 999,
        color: levelColor, background: `${levelColor}12`,
        border: `1px solid ${levelColor}30`,
      }}>
        {LEVEL_LABEL[level]}
      </span>

      {/* Stars */}
      {ratingCount > 0 && (
        <span style={{
          fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 999,
          color: "#b45309", background: "rgba(180,83,9,0.08)",
        }}>
          &#9733; {avgStars.toFixed(1)} ({ratingCount})
        </span>
      )}

      {/* Must-have met */}
      {Object.keys(scored.app.mustHaveAnswers).length > 0 && (
        <span style={{
          fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 999,
          color: mustHavePct === 1 ? "#15803d" : mustHavePct >= 0.5 ? "#d97706" : "#dc2626",
          background: mustHavePct === 1 ? "rgba(22,163,74,0.08)" : mustHavePct >= 0.5 ? "rgba(217,119,6,0.08)" : "rgba(220,38,38,0.08)",
        }}>
          Must-have: {Math.round(mustHavePct * 100)}%
        </span>
      )}

      {/* No ratings note */}
      {ratingCount === 0 && (
        <span style={{
          fontSize: 10, color: "var(--wm-er-muted)", fontStyle: "italic",
        }}>
          No ratings yet
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type Props = {
  apps: EmployeeShiftApplication[];
  tab: DashboardTab;
  isBusy: boolean;
  quickQuestions?: { id: string; text: string }[];
  onMoveToShortlist: (id: string) => void;
  onMoveToWaiting:   (id: string) => void;
  onConfirm:         (id: string) => void;
  onOpenGroup:       (id: string) => void;
  onRemove:          (id: string) => void;
  onReplace:         (id: string) => void;
  onPriorityTag:     (id: string, tag: PriorityTag | undefined) => void;
  priorityTags:      Record<string, PriorityTag | undefined>;
};

/* ------------------------------------------------ */
/* Priority tag row                                 */
/* ------------------------------------------------ */
function PriorityRow({ app, onPriorityTag, priorityTags }: {
  app: EmployeeShiftApplication;
  onPriorityTag: (id: string, tag: PriorityTag | undefined) => void;
  priorityTags: Record<string, PriorityTag | undefined>;
}) {
  const currentTag = priorityTags[app.id] ?? app.priorityTag;
  const TAGS: PriorityTag[] = ["priority", "good", "review"];
  const LABELS: Record<PriorityTag, string> = { priority: "Priority", good: "Good fit", review: "Review" };

  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4, paddingLeft: 2 }}>
      <PriorityBadge tag={currentTag} />
      <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
        {TAGS.map((t) => (
          <button
            key={t} type="button"
            onClick={() => onPriorityTag(app.id, currentTag === t ? undefined : t)}
            style={{
              fontSize: 10, padding: "2px 8px", borderRadius: 999,
              border: "1px solid var(--wm-er-border)",
              background: currentTag === t ? "var(--wm-er-accent-shift)" : "var(--wm-er-surface)",
              color: currentTag === t ? "#fff" : "var(--wm-er-muted)",
              cursor: "pointer", fontWeight: 600,
            }}
          >
            {LABELS[t]}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------ */
/* Single candidate block                           */
/* ------------------------------------------------ */
function CandidateBlock({
  scored, tab, isBusy,
  onMoveToShortlist, onMoveToWaiting, onConfirm,
  onOpenGroup, onRemove, onReplace,
  onPriorityTag, priorityTags,
}: {
  scored: ScoredApplication;
} & Omit<Props, "apps">) {
  const { app } = scored;
  const cardMode = tab === "shortlisted" ? "shortlist"
    : tab === "selected" ? "confirmed"
    : tab === "backup" ? "waiting"
    : tab;

  return (
    <div>
      <ScoreBadge scored={scored} />
      <PriorityRow app={app} onPriorityTag={onPriorityTag} priorityTags={priorityTags} />
      <CandidateCard
        app={app}
        mode={cardMode}
        isBusy={isBusy}
        onMoveToShortlist={onMoveToShortlist}
        onMoveToWaiting={onMoveToWaiting}
        onConfirm={onConfirm}
        onOpenGroup={onOpenGroup}
        onRemove={onRemove}
        onReplace={onReplace}
      />
    </div>
  );
}

/* ------------------------------------------------ */
/* Main component                                   */
/* ------------------------------------------------ */
export function SmartCandidateGroups({
  apps, tab, isBusy,
  quickQuestions,
  onMoveToShortlist, onMoveToWaiting, onConfirm,
  onOpenGroup, onRemove, onReplace,
  onPriorityTag, priorityTags,
}: Props) {
  const grouped = groupApplications(apps);
  const cardProps = {
    tab, isBusy,
    quickQuestions,
    onMoveToShortlist, onMoveToWaiting, onConfirm,
    onOpenGroup, onRemove, onReplace,
    onPriorityTag, priorityTags,
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

      {/* Top Picks */}
      {grouped.top.length > 0 && (
        <div>
          <GroupHeader
            icon="&#127942;"
            title="Top Picks"
            subtitle="Highly rated &mdash; strong match for this shift"
            count={grouped.top.length}
            color="#15803d"
            bg="rgba(22,163,74,0.04)"
          />
          <div style={{ display: "grid", gap: 10 }}>
            {grouped.top.map((s) => (
              <CandidateBlock key={s.app.id} scored={s} {...cardProps} />
            ))}
          </div>
        </div>
      )}

      {/* Good Fit */}
      {grouped.good.length > 0 && (
        <div>
          <GroupHeader
            icon="&#128077;"
            title="Good Fit"
            subtitle="Suitable candidates &mdash; worth considering"
            count={grouped.good.length}
            color="#0369a1"
            bg="rgba(3,105,161,0.04)"
          />
          <div style={{ display: "grid", gap: 10 }}>
            {grouped.good.map((s) => (
              <CandidateBlock key={s.app.id} scored={s} {...cardProps} />
            ))}
          </div>
        </div>
      )}

      {/* Others */}
      {grouped.others.length > 0 && (
        <div>
          <GroupHeader
            icon="&#128203;"
            title="Others"
            subtitle="Review carefully before shortlisting"
            count={grouped.others.length}
            color="#64748b"
            bg="rgba(100,116,139,0.04)"
          />
          <div style={{ display: "grid", gap: 10 }}>
            {grouped.others.map((s) => (
              <CandidateBlock key={s.app.id} scored={s} {...cardProps} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}