/** Admin Moderation — Trust queue for reported Shift and Career posts. */

import { AdminModerationCaseCard } from "../components/AdminModerationCaseCard";
import { useAdminModerationPage } from "../hooks/useAdminModerationPage";

const FILTERS = [
  { id: "queue", label: "Queue" },
  { id: "held", label: "Held" },
  { id: "cleared", label: "Cleared" },
  { id: "removed", label: "Removed" },
  { id: "all", label: "All" },
] as const;

export function AdminModerationPage() {
  const page = useAdminModerationPage();

  return (
    <div className="wm-ad-fadeIn" data-testid="admin-moderation-page" data-ui-state={page.uiState}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 1000, color: "var(--wm-ad-text)", letterSpacing: -0.3 }}>
          Moderation
        </div>
        <div style={{ fontSize: 12, color: "var(--wm-ad-dim)", marginTop: 4 }}>
          Review reported Shift and Career postings. Dismiss false reports. Hide or remove upheld ones.
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={page.filter === item.id ? "wm-primarybtn" : "wm-outlineBtn"}
            onClick={() => page.setFilter(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {page.error ? (
        <div className="wm-ent-error" role="alert" style={{ marginBottom: 12 }}>
          <div className="wm-ent-error__subtitle">{page.error}</div>
          <button type="button" className="wm-outlineBtn" onClick={() => void page.retry()}>
            Try again
          </button>
        </div>
      ) : null}

      {page.uiState === "loading" ? (
        <div className="wm-ent-loading">Loading reports…</div>
      ) : null}

      {page.uiState === "empty" ? (
        <div className="wm-ad-empty" data-testid="admin-moderation-empty">
          No reports in this filter.
        </div>
      ) : null}

      {page.uiState === "active"
        ? page.cases.map((item) => (
            <AdminModerationCaseCard
              key={item.caseId}
              item={item}
              busy={page.busyId === item.caseId}
              onAct={(action) => void page.act(item.caseId, action)}
            />
          ))
        : null}
    </div>
  );
}
