// src/features/employer/shiftJobs/components/AdvancedSection.tsx
import { useState } from "react";
import type { EmployerShiftActivityEntry, ShiftPost } from "../storage/employerShift.storage";
import { employerShiftStorage } from "../storage/employerShift.storage";
import { fmtTime } from "../helpers/dashboardHelpers";

type Props = {
  post: ShiftPost;
  activity: EmployerShiftActivityEntry[];
  isAnalyzed: boolean;
  onAnalyze: () => void;
  onReset: () => void;
};

export function AdvancedSection({ post, activity, isAnalyzed, onAnalyze, onReset }: Props) {
  const [open, setOpen] = useState(false);
  const p = post;

  return (
    <div className="wm-er-card" style={{ marginTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontWeight: 900, color: "var(--wm-er-text)" }}>Advanced</div>
        <button className="wm-outlineBtn" type="button" onClick={() => setOpen((s) => !s)} style={{ fontSize: 11, height: 28, padding: "0 10px" }}>
          {open ? "Hide" : "Show"}
        </button>
      </div>

      {open && (
        <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
          {/* Activity Log */}
          <div className="wm-er-card" style={{ margin: 0 }}>
            <div style={{ fontWeight: 900, color: "var(--wm-er-text)" }}>Activity Log ({activity.length})</div>
            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              {activity.length === 0 && <div style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>No activity yet.</div>}
              {activity.map((e) => (
                <div key={e.id} style={{ padding: "8px 0", borderTop: "1px solid var(--wm-er-divider)", fontSize: 12 }}>
                  <div style={{ fontWeight: 800, color: "var(--wm-er-text)" }}>{e.title}</div>
                  {e.body && <div style={{ color: "var(--wm-er-muted)", marginTop: 2 }}>{e.body}</div>}
                  <div style={{ color: "var(--wm-er-muted)", marginTop: 2, fontSize: 11 }}>{fmtTime(e.createdAt)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Analysis */}
          <div className="wm-er-card wm-er-accentCard wm-er-vShift" style={{ margin: 0 }}>
            <div className="wm-er-headTint">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ fontWeight: 900 }}>Analysis</div>
                <div style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>{p.analyzedAt ? `Last: ${fmtTime(p.analyzedAt)}` : "Not analyzed"}</div>
              </div>
              <div style={{ marginTop: 10, display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
                <button className="wm-outlineBtn" type="button" onClick={() => employerShiftStorage.setHidden(p.id, !p.isHiddenFromSearch)}>
                  {p.isHiddenFromSearch ? "Show in search" : "Hide from search"}
                </button>
                <button className="wm-primarybtn" type="button" onClick={onAnalyze} disabled={isAnalyzed}>
                  {isAnalyzed ? "Analyzed" : "Find Best Candidates"}
                </button>
                <button className="wm-outlineBtn" type="button" onClick={onReset} style={{ color: "var(--wm-error)" }}>Reset</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
