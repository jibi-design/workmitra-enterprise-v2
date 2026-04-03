// src/features/employee/careerJobs/components/CareerApplicationComponents.tsx
//
// KpiTiles, FilterTabs, EmptyState, AppCard for EmployeeCareerApplicationsPage.

import type { CareerSearchPost } from "../helpers/careerSearchHelpers";
import { fmtJobType, fmtWorkMode } from "../helpers/careerSearchHelpers";
import {
  stageLabel, toneForStage, badgeColors,
  cardLeftColor, cardBgTint, fmtDateTime, explanationForStage,
} from "../helpers/careerApplicationHelpers";
import type { AppLite, Tab, KpiCounts, TabCounts } from "../types/careerApplicationTypes";
import { EmployerTrustBadge } from "../../../../shared/employerProfile/EmployerTrustBadge";
import { DuplicateEmploymentWarning } from "./DuplicateEmploymentWarning";

/* ------------------------------------------------ */
/* Constants                                        */
/* ------------------------------------------------ */
const BLUE = "#1d4ed8";
const MUTED = "#94a3b8";
const TAB_CSS = `.wm-career-app-tabs::-webkit-scrollbar{display:none}`;

const TAB_DEFS: { key: Tab; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "interview", label: "Interview" },
  { key: "offers", label: "Offers" },
  { key: "closed", label: "Closed" },
  { key: "all", label: "All" },
];

const KPI_DEFS: { label: string; field: keyof KpiCounts; bg: string; color: string }[] = [
  { label: "Applied", field: "applied", bg: "#eff6ff", color: BLUE },
  { label: "Shortlisted", field: "shortlisted", bg: "#fefce8", color: "#a16207" },
  { label: "Confirmed", field: "confirmed", bg: "#f0fdf4", color: "#15803d" },
];

/* ------------------------------------------------ */
/* KPI Tiles                                        */
/* ------------------------------------------------ */
export function KpiTiles({ kpi }: { kpi: KpiCounts }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
      {KPI_DEFS.map((d) => {
        const count = kpi[d.field];
        const isZero = count === 0;
        return (
          <div key={d.label} style={{
            background: isZero ? "#f8fafc" : d.bg, borderRadius: 8,
            padding: 10, textAlign: "center",
            border: isZero ? "1px solid #e2e8f0" : `1px solid ${d.color}22`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: isZero ? MUTED : d.color }}>{d.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: isZero ? MUTED : d.color, marginTop: 2 }}>{count}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------ */
/* Filter Tabs                                      */
/* ------------------------------------------------ */
export function FilterTabs({ tab, counts, onChange }: {
  tab: Tab;
  counts: TabCounts;
  onChange: (t: Tab) => void;
}) {
  return (
    <>
      <style>{TAB_CSS}</style>
      <div
        className="wm-career-app-tabs"
        style={{
          display: "flex", gap: 6, overflowX: "auto", flexWrap: "nowrap",
          paddingBottom: 12, marginBottom: 14, scrollbarWidth: "none",
          borderBottom: "1px solid var(--wm-er-border, #e5e7eb)",
        }}
      >
        {TAB_DEFS.map((t) => {
          const isActive = tab === t.key;
          const count = counts[t.key];
          const hasItems = count > 0;
          const text = hasItems ? `${t.label} ${count}` : t.label;
          const style: React.CSSProperties = isActive
            ? { background: "#1e293b", color: "#fff", borderColor: "#1e293b" }
            : hasItems
              ? { background: `${BLUE}0F`, color: BLUE, borderColor: BLUE }
              : { background: "transparent", color: MUTED, borderColor: "#e2e8f0" };
          return (
            <button key={t.key} type="button" onClick={() => onChange(t.key)} style={{
              fontSize: 12, fontWeight: isActive ? 600 : 500,
              padding: "5px 12px", borderRadius: 20,
              border: `1px solid ${style.borderColor}`,
              background: style.background, color: style.color,
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
export function EmptyState({ onFind }: { onFind: () => void }) {
  return (
    <div style={{ paddingTop: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
      <div style={{
        width: 64, height: 64, borderRadius: "50%",
        background: "#eff6ff", border: "1px solid rgba(29,78,216,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width={28} height={28} viewBox="0 0 24 24">
          <path fill={BLUE} d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm4 18H6V4h7v5h5v11Z" />
        </svg>
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--wm-er-text, #1e293b)" }}>No applications yet</div>
      <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5, maxWidth: 280 }}>
        Find jobs and apply to start your career journey
      </div>
      <button type="button" onClick={onFind} style={{
        marginTop: 4, background: BLUE, color: "#fff", border: "none",
        padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
      }}>
        Find Jobs
      </button>
    </div>
  );
}

/* ------------------------------------------------ */
/* App Card                                         */
/* ------------------------------------------------ */
export function AppCard({ app, post, onOpen, onWithdraw, onAcceptOffer, onDeclineOffer }: {
  app: AppLite;
  post?: CareerSearchPost;
  onOpen: () => void;
  onWithdraw: () => void;
  onAcceptOffer?: () => void;
  onDeclineOffer?: () => void;
}) {
  const title = post?.jobTitle ?? "Career Position";
  const company = post?.companyName ?? "Company";
  const sub = post
    ? [fmtJobType(post.jobType), fmtWorkMode(post.workMode), post.location].filter(Boolean).join(" · ")
    : "";
  const totalRounds = post?.interviewRounds ?? 0;
  const tone = toneForStage(app.stage);
  const bc = badgeColors(tone);
  const explanation = explanationForStage(app, totalRounds);
  const ec = explanation ? badgeColors(explanation.tone) : null;
  const canWithdraw = ["applied", "shortlisted", "interview", "offered"].includes(app.stage);

  return (
    <div style={{
      marginBottom: 8, padding: 12,
      borderLeft: `3px solid ${cardLeftColor(app.stage)}`,
      borderRadius: "0 8px 8px 0",
      background: cardBgTint(app.stage),
    }}>
      {/* Row 1: Title + Badge */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <button type="button" onClick={onOpen} style={{
          fontSize: 14, fontWeight: 600, color: "var(--wm-er-text, #1e293b)",
          background: "none", border: "none", padding: 0, cursor: "pointer",
          textAlign: "left", overflow: "hidden", textOverflow: "ellipsis",
          whiteSpace: "nowrap", flex: 1,
        }}>
          {title}
        </button>
        <span style={{
          fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 10,
          background: bc.bg, border: `1px solid ${bc.border}`, color: bc.color, flexShrink: 0,
        }}>
          {stageLabel(app.stage)}
        </span>
      </div>

      {/* Row 2: Company + sub */}
     <div style={{ fontSize: 12, fontWeight: 600, color: "var(--wm-er-text, #1e293b)", marginTop: 4 }}>{company}</div>
      <EmployerTrustBadge variant="compact" accentColor="#f59e0b" />
      {sub && <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{sub}</div>}

      {/* Interview progress */}
      {app.stage === "interview" && totalRounds > 0 && (
        <div style={{
          marginTop: 8, padding: "6px 10px", borderRadius: 8,
          background: "rgba(29,78,216,0.04)", border: "1px solid rgba(29,78,216,0.10)",
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: BLUE }}>
            Interview Progress: {app.totalPassed}/{totalRounds} passed
            {app.totalScheduled > 0 ? ` · ${app.totalScheduled} scheduled` : ""}
          </div>
          <div style={{ display: "flex", gap: 3, marginTop: 4 }}>
            {Array.from({ length: totalRounds }, (_, i) => {
              let bg = "#e2e8f0";
              if (i < app.totalPassed) bg = "#16a34a";
              else if (i === app.totalPassed && app.totalScheduled > 0) bg = "#d97706";
              return <div key={i} style={{ flex: 1, height: 5, borderRadius: 999, background: bg }} />;
            })}
          </div>
        </div>
      )}

      {/* Explanation banner */}
      {explanation && ec && (
        <div style={{
          marginTop: 8, padding: "8px 10px", borderRadius: 8,
          background: ec.bg, border: `1px solid ${ec.border}`,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--wm-er-text, #1e293b)" }}>{explanation.title}</div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2, lineHeight: 1.5 }}>{explanation.body}</div>
        </div>
      )}

      {/* Offer Accept/Decline buttons */}
      {app.stage === "offered" && app.offerDetails && (
        <div style={{
          marginTop: 10, padding: "12px 14px", borderRadius: 10,
          background: "rgba(29,78,216,0.04)", border: "1px solid rgba(29,78,216,0.15)",
        }}>
          <DuplicateEmploymentWarning />
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-accent-career, #1d4ed8)", marginBottom: 4 }}>
            Offer Details
          </div>
          <div style={{ fontSize: 12, color: "var(--wm-er-text, #1e293b)", lineHeight: 1.6 }}>
            {app.offerDetails.jobTitle} &middot; Salary: {app.offerDetails.salary.toLocaleString()} / {app.offerDetails.salaryPeriod}
            {app.offerDetails.startDate && <span> &middot; Start: {new Date(app.offerDetails.startDate).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</span>}
          </div>
          {app.offerDetails.message && (
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 4, fontStyle: "italic" }}>
              &ldquo;{app.offerDetails.message}&rdquo;
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button type="button" onClick={(e) => { e.stopPropagation(); onAcceptOffer?.(); }}
              style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", background: "#16a34a", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              &#10003; Accept Offer
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); onDeclineOffer?.(); }}
              style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid #e5e7eb", background: "none", color: "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Decline
            </button>
          </div>
        </div>
      )}

      {/* Row 3: Timestamp + Withdraw */}
      <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 11, color: MUTED }}>Applied {fmtDateTime(app.appliedAt)}</div>
        {canWithdraw && (
          <button type="button" onClick={(e) => { e.stopPropagation(); onWithdraw(); }} style={{
            fontSize: 11, fontWeight: 600, color: "#ef4444",
            background: "none", border: "none", padding: 0, cursor: "pointer",
          }}>
            Withdraw
          </button>
        )}
      </div>
    </div>
  );
}