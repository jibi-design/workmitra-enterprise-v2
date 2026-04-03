// src/features/employer/careerJobs/components/CareerPipelineTabs.tsx
//
// Horizontal tab bar for career pipeline stages.
// Indigo accent (--wm-er-accent-career).
// Pure presentational — no business logic.



// ─────────────────────────────────────────────────────────────────────────────
// Public Tab Type (subset of stages visible as tabs)
// ─────────────────────────────────────────────────────────────────────────────

export type CareerTab =
  | "applied"
  | "shortlisted"
  | "interview"
  | "offered"
  | "hired"
  | "rejected";

const TAB_ORDER: readonly CareerTab[] = [
  "applied",
  "shortlisted",
  "interview",
  "offered",
  "hired",
  "rejected",
] as const;

const TAB_LABELS: Record<CareerTab, string> = {
  applied: "Applied",
  shortlisted: "Shortlisted",
  interview: "Interview",
  offered: "Offered",
  hired: "Hired",
  rejected: "Rejected",
};

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  activeTab: CareerTab;
  counts: Record<CareerTab, number>;
  onTabChange: (tab: CareerTab) => void;
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function CareerPipelineTabs({ activeTab, counts, onTabChange }: Props) {
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        flexWrap: "wrap",
        borderBottom: "2px solid var(--wm-er-divider)",
      }}
    >
      {TAB_ORDER.map((t) => {
        const isActive = activeTab === t;
        const count = counts[t];

        return (
          <button
            key={t}
            type="button"
            onClick={() => onTabChange(t)}
            style={{
              fontSize: 12,
              fontWeight: isActive ? 900 : 700,
              padding: "8px 10px",
              border: "none",
              background: "none",
              cursor: "pointer",
              borderBottom: isActive
                ? "2px solid var(--wm-er-accent-career)"
                : "2px solid transparent",
              color: isActive
                ? "var(--wm-er-accent-career)"
                : "var(--wm-er-muted)",
              marginBottom: -2,
              transition: "color 0.15s, border-color 0.15s",
            }}
          >
            {TAB_LABELS[t]}
            {count > 0 && (
              <span
                style={{
                  marginLeft: 4,
                  fontSize: 10,
                  fontWeight: 900,
                  padding: "1px 6px",
                  borderRadius: 999,
                  background: isActive
                    ? "var(--wm-er-accent-career)"
                    : "var(--wm-er-divider)",
                  color: isActive ? "#fff" : "var(--wm-er-muted)",
                }}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
