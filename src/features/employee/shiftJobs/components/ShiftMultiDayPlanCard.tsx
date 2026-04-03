// src/features/employee/shiftJobs/components/ShiftMultiDayPlanCard.tsx
//
// Multi-day Plan card — shown when employer created shifts via Demand Planner.
// Groups posts by same jobName + companyName.
// Worker can apply for all days at once or view individual days.

type PlanPost = {
  id: string;
  date: string;      // formatted
  payPerDay: number;
  workers: number;   // vacancies
  applied: boolean;
};

type Props = {
  planName: string;
  companyName: string;
  locationName: string;
  category: string;
  posts: PlanPost[];
  allApplied: boolean;
  someApplied: boolean;
  onApplyAll: () => void;
  onOpenDay: (postId: string) => void;
};

export function ShiftMultiDayPlanCard({
  planName, companyName, locationName, category,
  posts, allApplied, someApplied,
  onApplyAll, onOpenDay,
}: Props) {
  const unapplied = posts.filter((p) => !p.applied).length;
  const payRange  = posts.length > 0
    ? (() => {
        const pays = posts.map((p) => p.payPerDay);
        const mn = Math.min(...pays);
        const mx = Math.max(...pays);
        return mn === mx ? `${mn}/day` : `${mn}–${mx}/day`;
      })()
    : "";

  return (
    <div style={{
      borderRadius: 14, overflow: "hidden",
      border: "1.5px solid rgba(22,163,74,0.25)",
      background: "var(--wm-er-card, #fff)",
      boxShadow: "0 2px 8px rgba(22,163,74,0.06)",
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 14px 10px",
        background: "rgba(22,163,74,0.05)",
        borderBottom: "1px solid rgba(22,163,74,0.1)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                background: "rgba(22,163,74,0.12)",
                color: "var(--wm-er-accent-shift, #16a34a)",
                border: "1px solid rgba(22,163,74,0.2)",
              }}>
                &#128197; Multi-day Plan
              </span>
              <span style={{ fontSize: 10, color: "var(--wm-er-muted)", fontWeight: 600 }}>
                {posts.length} days &middot; {category}
              </span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {planName}
            </div>
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 2 }}>
              {companyName} &middot; {locationName}
            </div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-accent-shift, #16a34a)", whiteSpace: "nowrap", flexShrink: 0 }}>
            {payRange}
          </div>
        </div>
      </div>

      {/* Day list */}
      <div style={{ padding: "8px 14px", display: "grid", gap: 6 }}>
        {posts.map((p) => (
          <button key={p.id} type="button"
            onClick={() => onOpenDay(p.id)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "6px 10px", borderRadius: 8, cursor: "pointer",
              background: p.applied ? "rgba(22,163,74,0.06)" : "var(--wm-er-bg, #f8fafc)",
              border: `1px solid ${p.applied ? "rgba(22,163,74,0.2)" : "var(--wm-er-border)"}`,
              width: "100%", textAlign: "left",
            }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--wm-er-text)" }}>
              {p.date}
            </span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>
                {p.payPerDay}/day
              </span>
              {p.applied ? (
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--wm-er-accent-shift, #16a34a)", padding: "2px 8px", borderRadius: 999, background: "rgba(22,163,74,0.1)" }}>
                  Applied
                </span>
              ) : (
                <span style={{ fontSize: 10, fontWeight: 600, color: "var(--wm-er-muted)" }}>
                  View &rsaquo;
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Apply All footer */}
      <div style={{
        padding: "10px 14px",
        borderTop: "1px solid var(--wm-er-border)",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
      }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>
            {allApplied
              ? "You have applied for all days."
              : someApplied
                ? `${unapplied} day${unapplied !== 1 ? "s" : ""} remaining`
                : `${posts.length} days available`}
          </div>
          {!allApplied && unapplied > 0 && (
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-accent-shift, #16a34a)", marginTop: 2 }}>
              Potential earnings: {posts.filter((p) => !p.applied).reduce((sum, p) => sum + p.payPerDay, 0).toLocaleString()}
            </div>
          )}
        </div>
        {!allApplied && (
          <button type="button" onClick={onApplyAll}
            style={{
              fontSize: 12, fontWeight: 700, padding: "7px 16px",
              borderRadius: 8, border: "none",
              background: "var(--wm-er-accent-shift, #16a34a)",
              color: "#fff", cursor: "pointer", whiteSpace: "nowrap",
            }}>
            {someApplied ? `Apply remaining ${unapplied}` : `Apply all ${posts.length} days`}
          </button>
        )}
      </div>
    </div>
  );
}