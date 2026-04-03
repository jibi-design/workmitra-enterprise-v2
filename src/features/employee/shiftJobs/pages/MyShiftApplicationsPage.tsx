// src/features/employee/shiftJobs/pages/MyShiftApplicationsPage.tsx
//
// Employee My Applications — premium redesign.
// KPI tiles, horizontal scroll tabs, status-colored cards.
// Domain: Shift Jobs Green #16a34a.

import { useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { shiftApplicationsStorage } from "../storage/shiftApplications.storage";
import type { ApplicationTab, ShiftApplicationData, ShiftPostData } from "../types/shiftApplicationTypes";
import {
  computeKpi, computeTabCounts, tabMatch, statusLabel,
  getStatusStyle, fmtDateRange, fmtTimestamp, formatPay,
  TAB_COLORS, type KpiCounts, type TabCounts,
} from "../helpers/shiftApplicationHelpers";

/* ------------------------------------------------ */
/* Constants                                        */
/* ------------------------------------------------ */
const GREEN = "#16a34a";
const MUTED = "#94a3b8";
const TABS: { key: ApplicationTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "confirmed", label: "Confirmed" },
  { key: "closed", label: "Closed" },
];

const TAB_CSS = `.wm-app-tabs::-webkit-scrollbar{display:none}`;

/* ------------------------------------------------ */
/* KPI Tiles                                        */
/* ------------------------------------------------ */
const KPI_DEFS: { label: string; field: keyof KpiCounts; bg: string; color: string }[] = [
  { label: "Applied", field: "applied", bg: "#f0fdf4", color: "#15803d" },
  { label: "Shortlisted", field: "shortlisted", bg: "#fefce8", color: "#a16207" },
  { label: "Confirmed", field: "confirmed", bg: "#eff6ff", color: "#1d4ed8" },
];

const ZERO_BG = "#f8fafc";

function KpiTiles({ kpi }: { kpi: KpiCounts }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
      {KPI_DEFS.map((d) => {
        const count = kpi[d.field];
        const isZero = count === 0;
        const bg = isZero ? ZERO_BG : d.bg;
        const clr = isZero ? MUTED : d.color;
        return (
          <div key={d.label} style={{
            background: bg, borderRadius: 8, padding: 10, textAlign: "center",
            border: isZero ? "1px solid #e2e8f0" : `1px solid ${d.color}22`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: clr }}>{d.label}</div>
            <div style={{ fontSize: 20, fontWeight: 600, color: clr, marginTop: 2 }}>{count}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------ */
/* Filter Tabs                                      */
/* ------------------------------------------------ */
function FilterTabs({ tab, counts, onChange }: { tab: ApplicationTab; counts: TabCounts; onChange: (t: ApplicationTab) => void }) {
  return (
    <>
      <style>{TAB_CSS}</style>
      <div className="wm-app-tabs" style={{
        display: "flex", gap: 6, overflowX: "auto", flexWrap: "nowrap",
        paddingBottom: 12, marginBottom: 14, scrollbarWidth: "none",
        borderBottom: "1px solid var(--wm-er-border, #e5e7eb)",
      }}>
        {TABS.map((t) => {
          const isActive = tab === t.key;
          const count = counts[t.key];
          const hasItems = count > 0;
          const c = TAB_COLORS[t.key];

          const style: React.CSSProperties = isActive
            ? { background: "#1e293b", color: "#fff", borderColor: "#1e293b" }
            : hasItems
              ? { background: `${c}0F`, color: c, borderColor: c }
              : { background: "transparent", color: MUTED, borderColor: "#e2e8f0" };

          /* Fix 3: explicit space between label and count */
          const text = hasItems ? `${t.label} ${count}` : t.label;

          return (
            <button key={t.key} type="button" onClick={() => onChange(t.key)} style={{
              background: style.background, color: style.color,
              border: `1px solid ${style.borderColor}`,
              fontSize: 12, fontWeight: isActive ? 600 : 500,
              padding: "5px 12px", borderRadius: 20,
              cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap",
            }}>
              {text}
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ------------------------------------------------ */
/* Empty State                                      */
/* ------------------------------------------------ */
function EmptyState({ onFind }: { onFind: () => void }) {
  return (
    <div style={{ paddingTop: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={28} height={28} viewBox="0 0 24 24"><path fill={GREEN} d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm4 18H6V4h7v5h5v11Z" /></svg>
      </div>
      <div style={{ fontSize: 15, fontWeight: 600 }}>No applications yet</div>
      <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5, maxWidth: 280 }}>
        Find shifts and apply to start working
      </div>
      <button type="button" onClick={onFind} style={{
        marginTop: 4, background: GREEN, color: "#fff", border: "none",
        padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
      }}>
        Find Shifts
      </button>
    </div>
  );
}

/* ------------------------------------------------ */
/* Application Card                                 */
/* ------------------------------------------------ */
function AppCard({ app, post, onTap }: { app: ShiftApplicationData; post?: ShiftPostData; onTap: () => void }) {
  const ss = getStatusStyle(app.status);
  const title = post ? `${post.jobName} — ${post.companyName}` : `Shift — ${app.postId.slice(0, 8)}`;

  /* Fix 6: Show job type (not experience). Fallback to date only if no type available. */
  const typeStr = post?.shiftType ?? "";
  const dateStr = post ? fmtDateRange(post.startAt, post.endAt) : "";
  const payStr = post ? formatPay(post.payPerDay) : "";
  const detailParts = [typeStr, dateStr].filter(Boolean);

  return (
    <button type="button" onClick={onTap} style={{
      width: "100%", textAlign: "left", padding: 12, marginBottom: 8,
      borderRadius: "0 8px 8px 0", border: "none", cursor: "pointer",
      borderLeft: `3px solid ${ss.color}`,
      background: ss.bgTint,
    }}>
      {/* Row 1: Title + Badge */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--wm-er-text, #1e293b)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
          {title}
        </span>
        {/* Fix 5: Badge exact values from spec */}
        <span style={{
          fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 10,
          background: ss.badgeBg, color: ss.color, flexShrink: 0,
        }}>
          {statusLabel(app.status)}
        </span>
      </div>

      {/* Row 2: Type | Date | Pay */}
      {(detailParts.length > 0 || payStr) && (
        <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
          {detailParts.join(" | ")}
          {payStr && (
            <>
              {detailParts.length > 0 && <span style={{ color: "#cbd5e1" }}>{" | "}</span>}
              <span style={{ fontWeight: 600, color: "#15803d" }}>{payStr}</span>
            </>
          )}
        </div>
      )}

      {/* Row 3: Timestamp */}
      <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>
        Applied {fmtTimestamp(app.createdAt)}
      </div>
    </button>
  );
}

/* ------------------------------------------------ */
/* Main Component                                   */
/* ------------------------------------------------ */
export function MyShiftApplicationsPage() {
  const nav = useNavigate();
  const [tab, setTab] = useState<ApplicationTab>("all");

  const posts = useSyncExternalStore(shiftApplicationsStorage.subscribe, shiftApplicationsStorage.getPosts, shiftApplicationsStorage.getPosts);
  const apps = useSyncExternalStore(shiftApplicationsStorage.subscribe, shiftApplicationsStorage.getApps, shiftApplicationsStorage.getApps);

  const kpi = useMemo(() => computeKpi(apps), [apps]);
  const counts = useMemo(() => computeTabCounts(apps), [apps]);
  const postMap = useMemo(() => { const m = new Map<string, ShiftPostData>(); for (const p of posts) m.set(p.id, p); return m; }, [posts]);
  const filtered = useMemo(() => apps.filter((a) => tabMatch(a.status, tab)), [apps, tab]);

  const goFind = () => nav(ROUTE_PATHS.employeeShiftSearch);

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width={18} height={18} viewBox="0 0 24 24"><path fill={GREEN} d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm4 18H6V4h7v5h5v11Z" /></svg>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--wm-er-text, #1e293b)" }}>My Applications</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Track your shift applications</div>
          </div>
        </div>
        <button type="button" onClick={goFind} style={{
          padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
          border: `1.5px solid ${GREEN}`,
          color: GREEN,
          background: "transparent",
        }}>
          Find Shifts
        </button>
      </div>

      {/* KPI Tiles */}
      <KpiTiles kpi={kpi} />

      {/* Filter Tabs */}
      <FilterTabs tab={tab} counts={counts} onChange={setTab} />

      {/* Empty State */}
      {filtered.length === 0 && <EmptyState onFind={goFind} />}

      {/* Application Cards */}
      {filtered.length > 0 && filtered.map((a) => (
        <AppCard
          key={a.id}
          app={a}
          post={postMap.get(a.postId)}
          onTap={() => nav(ROUTE_PATHS.employeeShiftPostDetails.replace(":postId", a.postId))}
        />
      ))}

      <div style={{ height: 32 }} />
    </div>
  );
}