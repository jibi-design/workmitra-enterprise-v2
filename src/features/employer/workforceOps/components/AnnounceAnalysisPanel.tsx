// src/features/employer/workforceOps/components/AnnounceAnalysisPanel.tsx
//
// Analysis panel for Announcement Dashboard.
// Groups applications by category × shift, ranks by rating.
// Provides auto-select (best candidates) and manual override.

import { useMemo, useCallback } from "react";
import { workforceCategoryService } from "../services/workforceCategoryService";
import type {
  WorkforceAnnouncement,
  WorkforceApplication,
} from "../types/workforceTypes";
import { AnnounceApplicationCard } from "./AnnounceApplicationCard";
import { AMBER, AMBER_BG } from "./workforceStyles";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Props                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */

type Props = {
  announcement: WorkforceAnnouncement;
  applications: WorkforceApplication[];
  onUpdateStatus: (appId: string, status: WorkforceApplication["status"]) => void;
  onAutoSelect: () => void;
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Component                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

export function AnnounceAnalysisPanel({ announcement, applications, onUpdateStatus, onAutoSelect }: Props) {
  const categories = useMemo(() => workforceCategoryService.getAll(), []);
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) map.set(c.id, c.name);
    return map;
  }, [categories]);

  /* ── Group applications by category × shift, ranked by rating ── */
  const grouped = useMemo(() => {
    const result: Array<{
      categoryId: string;
      categoryName: string;
      shiftId: string;
      shiftName: string;
      vacancy: number;
      apps: WorkforceApplication[];
      selectedCount: number;
      waitingCount: number;
    }> = [];

    for (const catId of announcement.targetCategories) {
      for (const shift of announcement.shifts) {
        const vacancy = announcement.vacancyPerCategoryPerShift[catId]?.[shift.id] ?? 0;
        if (vacancy === 0) continue;

        const apps = applications
          .filter((a) => a.categoryId === catId && a.shiftIds.includes(shift.id))
          .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

        result.push({
          categoryId: catId,
          categoryName: categoryMap.get(catId) ?? catId,
          shiftId: shift.id,
          shiftName: shift.name,
          vacancy,
          apps,
          selectedCount: apps.filter((a) => a.status === "selected").length,
          waitingCount: apps.filter((a) => a.status === "waiting").length,
        });
      }
    }

    return result;
  }, [announcement, applications, categoryMap]);

  /* ── Summary stats ── */
  const stats = useMemo(() => {
    const total = applications.length;
    const selected = applications.filter((a) => a.status === "selected").length;
    const waiting = applications.filter((a) => a.status === "waiting").length;
    const rejected = applications.filter((a) => a.status === "not_selected").length;
    const pending = applications.filter((a) => a.status === "applied").length;
    return { total, selected, waiting, rejected, pending };
  }, [applications]);

  const handleSelect = useCallback((appId: string) => {
    onUpdateStatus(appId, "selected");
  }, [onUpdateStatus]);

  const handleReject = useCallback((appId: string) => {
    onUpdateStatus(appId, "not_selected");
  }, [onUpdateStatus]);

  const handleWaiting = useCallback((appId: string) => {
    onUpdateStatus(appId, "waiting");
  }, [onUpdateStatus]);

  const isAnalyzing = announcement.status === "analyzing";

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {/* Summary Bar */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[
          { label: "Applied", value: stats.total, color: "var(--wm-er-text)" },
          { label: "Selected", value: stats.selected, color: "var(--wm-success)" },
          { label: "Waiting", value: stats.waiting, color: "var(--wm-warning)" },
          { label: "Rejected", value: stats.rejected, color: "var(--wm-error)" },
          { label: "Pending", value: stats.pending, color: "var(--wm-er-muted)" },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              flex: "1 1 0",
              minWidth: 60,
              padding: "8px 10px",
              borderRadius: 8,
              background: "var(--wm-er-bg)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 900, color: item.color }}>{item.value}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--wm-er-muted)" }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Auto-Select Button */}
      {isAnalyzing && stats.pending > 0 && (
        <button
          className="wm-primarybtn"
          type="button"
          onClick={onAutoSelect}
          style={{ width: "100%", background: AMBER, fontSize: 13, padding: "10px" }}
        >
          Auto-Select Best Candidates
        </button>
      )}

      {/* No Applications */}
      {applications.length === 0 && (
        <div className="wm-er-card" style={{ textAlign: "center", padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)" }}>No applications yet</div>
          <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4 }}>
            Staff in the selected categories will be notified. Applications will appear here.
          </div>
        </div>
      )}

      {/* Grouped by Category × Shift */}
      {grouped.map((group) => (
        <div key={`${group.categoryId}-${group.shiftId}`} className="wm-er-card">
          {/* Group Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: AMBER }}>{group.categoryName}</div>
              <div style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>
                {group.shiftName} · {group.selectedCount}/{group.vacancy} selected
                {group.waitingCount > 0 && ` · ${group.waitingCount} waiting`}
              </div>
            </div>

            {/* Fill indicator */}
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 900,
                  color: group.selectedCount >= group.vacancy ? "var(--wm-success)" : AMBER,
                }}
              >
                {group.selectedCount}/{group.vacancy}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ height: 4, borderRadius: 2, background: "var(--wm-er-border)", marginBottom: 10 }}>
            <div
              style={{
                height: "100%",
                width: `${Math.min((group.selectedCount / Math.max(group.vacancy, 1)) * 100, 100)}%`,
                background: group.selectedCount >= group.vacancy ? "var(--wm-success)" : AMBER,
                borderRadius: 2,
                transition: "width 0.3s ease",
              }}
            />
          </div>

          {/* Application Cards */}
          {group.apps.length > 0 ? (
            <div style={{ display: "grid", gap: 8 }}>
              {group.apps.map((app, index) => (
                <AnnounceApplicationCard
                  key={app.id}
                  application={app}
                  categoryName={group.categoryName}
                  shifts={announcement.shifts}
                  rank={index + 1}
                  isSelectable={isAnalyzing}
                  onSelect={() => handleSelect(app.id)}
                  onReject={() => handleReject(app.id)}
                  onMoveToWaiting={() => handleWaiting(app.id)}
                />
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", textAlign: "center", padding: 12 }}>
              No applications for this shift yet
            </div>
          )}
        </div>
      ))}

      {/* Hint for non-analyzing status */}
      {!isAnalyzing && applications.length > 0 && (
        <div style={{ padding: 10, borderRadius: 8, background: AMBER_BG, fontSize: 12, color: AMBER, textAlign: "center" }}>
          Change status to "Analyzing" to select and manage applicants.
        </div>
      )}
    </div>
  );
}