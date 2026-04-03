// src/features/employer/shiftJobs/components/ShiftDashboardComponents.tsx
//
// Sub-components for EmployerShiftPostDashboardPage.
// Toggle, PriorityBadge, VacancyProgress, AnalysisBar.

import type { PriorityTag, PostSettings } from "../storage/employerShift.storage";
import type { DashboardTab } from "../helpers/shiftDashboardHelpers";
import { fmtDateTime } from "../helpers/shiftDashboardHelpers";

/* ------------------------------------------------ */
/* Toggle                                           */
/* ------------------------------------------------ */
type ToggleProps = {
  label: string;
  sub: string;
  value: boolean;
  onChange: (v: boolean) => void;
};

export function Toggle({ label, sub, value, onChange }: ToggleProps) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 0", borderBottom: "1px solid var(--wm-er-divider)",
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)" }}>{label}</div>
        <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>{sub}</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        aria-pressed={value}
        style={{
          width: 44, height: 24, borderRadius: 999, border: "none",
          cursor: "pointer", flexShrink: 0,
          background: value ? "var(--wm-er-accent-shift)" : "#d1d5db",
          position: "relative", transition: "background 0.2s",
        }}
      >
        <span style={{
          position: "absolute", top: 3, left: value ? 22 : 3,
          width: 18, height: 18, borderRadius: "50%", background: "#fff",
          transition: "left 0.2s", display: "block",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }} />
      </button>
    </div>
  );
}

/* ------------------------------------------------ */
/* Priority Badge                                   */
/* ------------------------------------------------ */
const PRIORITY_STYLES: Record<PriorityTag, { label: string; color: string; bg: string }> = {
  priority: { label: "Priority", color: "#dc2626", bg: "rgba(220,38,38,0.08)" },
  good:     { label: "Good fit", color: "#16a34a", bg: "rgba(22,163,74,0.08)" },
  review:   { label: "Review",   color: "#d97706", bg: "rgba(217,119,6,0.08)" },
};

export function PriorityBadge({ tag }: { tag?: PriorityTag }) {
  if (!tag) return null;
  const s = PRIORITY_STYLES[tag];
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
      background: s.bg, color: s.color, border: `1px solid ${s.color}33`,
    }}>
      {s.label}
    </span>
  );
}

/* ------------------------------------------------ */
/* Vacancy Progress                                 */
/* ------------------------------------------------ */
type VacancyProgressProps = {
  confirmedCount: number;
  vacancies: number;
  appliedCount: number;
  shortlistCount: number;
  backupCount: number;
  backupSlots: number;
};

export function VacancyProgress({
  confirmedCount, vacancies, appliedCount,
  shortlistCount, backupCount, backupSlots,
}: VacancyProgressProps) {
  const progressPct = vacancies > 0 ? Math.min(100, Math.round((confirmedCount / vacancies) * 100)) : 0;
  const progressColor = progressPct === 100 ? "#16a34a" : progressPct >= 50 ? "#d97706" : "var(--wm-er-accent-shift)";
  const backupPct = backupSlots > 0 ? Math.min(100, Math.round((backupCount / backupSlots) * 100)) : 0;

  return (
    <div style={{
      marginTop: 12, padding: "14px 16px", borderRadius: 14,
      background: "var(--wm-er-surface)", border: "1px solid var(--wm-er-border)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)" }}>Vacancy Progress</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: progressColor }}>
          {confirmedCount} / {vacancies} selected
        </div>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: "var(--wm-er-divider)", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${progressPct}%`, background: progressColor,
          borderRadius: 999, transition: "width 0.4s",
        }} />
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>
          Applied: <b style={{ color: "var(--wm-er-text)" }}>{appliedCount}</b>
        </span>
        <span style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>
          Shortlisted: <b style={{ color: "var(--wm-er-text)" }}>{shortlistCount}</b>
        </span>
        <span style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>
          Backup: <b style={{ color: "var(--wm-er-text)" }}>{backupCount}</b>
          {backupSlots > 0 && <span style={{ color: "var(--wm-er-muted)" }}> / {backupSlots}</span>}
        </span>
      </div>
      {backupSlots > 0 && backupCount > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginBottom: 4 }}>
            Backup slots: {backupCount} / {backupSlots} filled
          </div>
          <div style={{ height: 4, borderRadius: 999, background: "var(--wm-er-divider)", overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${backupPct}%`,
              background: backupPct >= 100 ? "#16a34a" : "#d97706",
              borderRadius: 999, transition: "width 0.4s",
            }} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------ */
/* Analysis Bar                                     */
/* ------------------------------------------------ */
type AnalysisBarProps = {
  alreadyAnalyzed: boolean;
  canAnalyze: boolean;
  isBusy: boolean;
  appliedCount: number;
  analyzedAt?: number;
  onAnalyze: () => void;
  onReset: () => void;
};

export function AnalysisBar({
  alreadyAnalyzed, canAnalyze, isBusy, appliedCount, analyzedAt, onAnalyze, onReset,
}: AnalysisBarProps) {
  return (
    <div style={{
      marginTop: 12, padding: "14px 16px", borderRadius: 14,
      background: alreadyAnalyzed ? "rgba(22,163,74,0.04)" : "rgba(15,118,110,0.04)",
      border: `1px solid ${alreadyAnalyzed ? "rgba(22,163,74,0.2)" : "rgba(15,118,110,0.2)"}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)" }}>
            {alreadyAnalyzed ? "Analysis Complete" : "Find Best Candidates"}
          </div>
          <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
            {alreadyAnalyzed
              ? `Last analyzed: ${analyzedAt ? fmtDateTime(analyzedAt) : "\u2014"}`
              : appliedCount === 0
              ? "No applications yet."
              : `${appliedCount} application${appliedCount > 1 ? "s" : ""} ready to analyze.`
            }
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {alreadyAnalyzed ? (
            <button className="wm-outlineBtn" type="button" style={{ fontSize: 12 }} onClick={onReset}>
              Reset &amp; Re-analyze
            </button>
          ) : (
            <button
              className="wm-primarybtn" type="button"
              disabled={!canAnalyze || isBusy}
              onClick={onAnalyze}
              style={{ fontSize: 12, padding: "8px 16px" }}
            >
              {isBusy ? "Analyzing..." : "Analyze Now"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------ */
/* Dashboard Tabs                                   */
/* ------------------------------------------------ */
type DashboardTabsProps = {
  activeTab: DashboardTab;
  counts: Record<DashboardTab, number>;
  onChange: (t: DashboardTab) => void;
};

const ALL_TABS: DashboardTab[] = ["applied", "shortlisted", "backup", "selected", "rejected"];
const TAB_LABELS: Record<DashboardTab, string> = {
  applied: "Applied", shortlisted: "Shortlisted",
  backup: "Backup", selected: "Selected", rejected: "Rejected",
};

export function DashboardTabs({ activeTab, counts, onChange }: DashboardTabsProps) {
  return (
    <div style={{
      marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap",
      borderBottom: "2px solid var(--wm-er-divider)",
    }}>
      {ALL_TABS.map((t) => {
        const isActive = activeTab === t;
        const count = counts[t];
        return (
          <button
            key={t} type="button" onClick={() => onChange(t)}
            style={{
              fontSize: 12, fontWeight: isActive ? 700 : 500,
              padding: "8px 12px", border: "none", background: "none",
              cursor: "pointer", marginBottom: -2,
              borderBottom: isActive ? "2px solid var(--wm-er-accent-shift)" : "2px solid transparent",
              color: isActive ? "var(--wm-er-accent-shift)" : "var(--wm-er-muted)",
            }}
          >
            {TAB_LABELS[t]}
            {count > 0 && (
              <span style={{
                marginLeft: 4, fontSize: 10, fontWeight: 600,
                padding: "1px 6px", borderRadius: 999,
                background: isActive ? "var(--wm-er-accent-shift)" : "var(--wm-er-divider)",
                color: isActive ? "#fff" : "var(--wm-er-muted)",
              }}>{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------ */
/* Settings Panel                                   */
/* ------------------------------------------------ */
type SettingsPanelProps = {
  settings: PostSettings;
  backupCount: number;
  onToggle: (key: keyof PostSettings, val: boolean | number) => void;
};

export function SettingsPanel({ settings, backupCount, onToggle }: SettingsPanelProps) {
  const backupSlots = settings.backupSlots ?? 2;
  return (
    <div style={{ padding: "0 16px 16px", background: "var(--wm-er-surface)" }}>
      {/* Backup Slots */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 0", borderBottom: "1px solid var(--wm-er-divider)",
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)" }}>Backup Slots</div>
          <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
            How many backup candidates to keep ({backupCount} currently in backup)
          </div>
        </div>
        <input
          type="number" min={0} max={20}
          value={backupSlots === 0 ? "" : backupSlots}
          placeholder="0"
          onFocus={(e) => { if (e.target.value === "0") e.target.value = ""; }}
          onChange={(e) => {
            const v = e.target.value === "" ? 0 : Math.max(0, Math.min(20, Number(e.target.value)));
            onToggle("backupSlots", v);
          }}
          style={{
            width: 52, textAlign: "center", fontSize: 14, fontWeight: 700,
            padding: "5px 8px", borderRadius: 8,
            border: "1.5px solid var(--wm-er-border)",
            background: "var(--wm-er-bg)", color: "var(--wm-er-text)",
          }}
        />
      </div>
      <Toggle
        label="Auto-promote backup"
        sub="When a selected worker is replaced, first backup candidate automatically moves to Shortlisted."
        value={settings.autoPromoteBackup}
        onChange={(v) => onToggle("autoPromoteBackup", v)}
      />
      <Toggle
        label="Notify backup candidates"
        sub="Backup candidates get notified when their position in the queue changes."
        value={settings.notifyBackup}
        onChange={(v) => onToggle("notifyBackup", v)}
      />
    </div>
  );
}