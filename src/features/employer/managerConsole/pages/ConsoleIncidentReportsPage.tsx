// src/features/employer/managerConsole/pages/ConsoleIncidentReportsPage.tsx
//
// Incident Reports — all employees, company-wide view.
// Filter by status, urgency. Manage from here.
// Color: Ocean Blue #0369a1 (--wm-er-accent-console)

import { useState, useEffect, useMemo } from "react";
import { incidentReportStorage } from "../../hrManagement/storage/incidentReport.storage";
import type { IncidentReport, IncidentStatus } from "../../hrManagement/types/incidentReport.types";
import { AlertTriangle } from "lucide-react";
import type { CSSProperties } from "react";

/* ------------------------------------------------ */
/* Constants                                        */
/* ------------------------------------------------ */
const ICON_BOX: CSSProperties = {
  width: 38, height: 38, borderRadius: 10,
  background: "var(--wm-er-accent-console-light)",
  display: "flex", alignItems: "center", justifyContent: "center",
  color: "var(--wm-er-accent-console)", flexShrink: 0,
};

type FilterTab = "all" | IncidentStatus;

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all",          label: "All" },
  { key: "reported",     label: "Reported" },
  { key: "acknowledged", label: "Acknowledged" },
  { key: "in_progress",  label: "In Progress" },
  { key: "resolved",     label: "Resolved" },
];

const STATUS_STYLE: Record<IncidentStatus, { label: string; color: string; bg: string }> = {
  reported:     { label: "Reported",     color: "#dc2626", bg: "#fee2e2" },
  acknowledged: { label: "Acknowledged", color: "#d97706", bg: "#fef3c7" },
  in_progress:  { label: "In Progress",  color: "#0369a1", bg: "#eff6ff" },
  resolved:     { label: "Resolved",     color: "#15803d", bg: "#dcfce7" },
};

const URGENCY_STYLE: Record<string, { label: string; color: string }> = {
  low:      { label: "Low",      color: "#6b7280" },
  medium:   { label: "Medium",   color: "#d97706" },
  high:     { label: "High",     color: "#dc2626" },
  critical: { label: "Critical", color: "#7f1d1d" },
};

const STATUS_FLOW: IncidentStatus[] = ["reported", "acknowledged", "in_progress", "resolved"];

/* ------------------------------------------------ */
/* Incident Card                                    */
/* ------------------------------------------------ */
function IncidentItem({ report }: { report: IncidentReport }) {
  const [expanded, setExpanded] = useState(false);
  const [newNote, setNewNote] = useState("");

  const sCfg = STATUS_STYLE[report.status];
  const uCfg = URGENCY_STYLE[report.urgency] ?? URGENCY_STYLE.low;
  const currentIdx = STATUS_FLOW.indexOf(report.status);
  const nextStatus = currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null;

  const dateStr = new Date(report.reportedAt).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });

  const handleAdvance = () => {
    if (nextStatus) incidentReportStorage.updateStatus(report.id, nextStatus);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    incidentReportStorage.addNote(report.id, newNote.trim());
    setNewNote("");
  };

  return (
    <div style={{
      padding: 14, borderRadius: 12,
      border: `1px solid ${report.urgency === "critical" ? "#fca5a5" : "var(--wm-er-border, #e5e7eb)"}`,
      background: report.status === "resolved" ? "#fafafa" : "#fff",
      opacity: report.status === "resolved" ? 0.75 : 1,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-accent-console)" }}>
            {report.employeeName}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)", marginTop: 4, lineHeight: 1.4 }}>
            {report.description.length > 120
              ? report.description.slice(0, 120) + "..."
              : report.description}
          </div>
          <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 4, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {report.location && <span>&#128205; {report.location}</span>}
            <span>&#128197; {dateStr}</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end", flexShrink: 0 }}>
          <span style={{
            padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700,
            background: sCfg.bg, color: sCfg.color, textTransform: "uppercase",
          }}>{sCfg.label}</span>
          <span style={{
            padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700,
            background: `${uCfg.color}15`, color: uCfg.color, textTransform: "uppercase",
          }}>{uCfg.label}</span>
        </div>
      </div>

      <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button type="button" onClick={() => setExpanded(!expanded)} style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 11, fontWeight: 700, color: "var(--wm-er-accent-console)", padding: 0,
        }}>
          {expanded ? "Hide Details" : `Details (${report.employerNotes.length} notes)`}
        </button>
        {nextStatus && (
          <button type="button" onClick={handleAdvance} style={{
            fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 8,
            border: "none", background: "var(--wm-er-accent-console)", color: "#fff", cursor: "pointer",
          }}>
            Mark as {STATUS_STYLE[nextStatus].label}
          </button>
        )}
      </div>

      {expanded && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--wm-er-border, #e5e7eb)" }}>
          {report.employerNotes.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
              {report.employerNotes.map((note) => (
                <div key={note.id} style={{
                  padding: "6px 8px", borderRadius: 6,
                  background: "#f9fafb", border: "1px solid var(--wm-er-border, #e5e7eb)",
                }}>
                  <div style={{ fontSize: 12, color: "var(--wm-er-text)" }}>{note.content}</div>
                  <div style={{ fontSize: 10, color: "var(--wm-er-muted)", marginTop: 2 }}>
                    {new Date(note.createdAt).toLocaleString("en-GB", {
                      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 6 }}>
            <input
              type="text" value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddNote(); } }}
              placeholder="Add a note..."
              style={{
                flex: 1, padding: "7px 10px", fontSize: 12,
                border: "1px solid var(--wm-er-border, #e5e7eb)", borderRadius: 6,
                outline: "none", background: "#fff", color: "var(--wm-er-text)", boxSizing: "border-box",
              }}
            />
            <button type="button" onClick={handleAddNote} disabled={!newNote.trim()} style={{
              padding: "0 12px", border: "1px solid var(--wm-er-border, #e5e7eb)", borderRadius: 6,
              background: newNote.trim() ? "var(--wm-er-accent-console)" : "#f3f4f6",
              color: newNote.trim() ? "#fff" : "var(--wm-er-muted)",
              cursor: newNote.trim() ? "pointer" : "default", fontSize: 12, fontWeight: 700,
            }}>Add</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------ */
/* Main Page                                        */
/* ------------------------------------------------ */
export function ConsoleIncidentReportsPage() {
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  useEffect(() => {
    const refresh = () => setReports(incidentReportStorage.getAll());
    refresh();
    return incidentReportStorage.subscribe(refresh);
  }, []);

  const filtered = useMemo(() => {
    if (activeTab === "all") return reports;
    return reports.filter((r) => r.status === activeTab);
  }, [reports, activeTab]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: reports.length };
    for (const tab of TABS) {
      if (tab.key !== "all") c[tab.key] = reports.filter((r) => r.status === tab.key).length;
    }
    return c;
  }, [reports]);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={ICON_BOX}>
          <AlertTriangle size={20} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 17, color: "var(--wm-er-text)" }}>Incident Reports</div>
          <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 2 }}>
            All employee-submitted issues and status tracking
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14,
        paddingBottom: 10, borderBottom: "1px solid var(--wm-er-border, #e5e7eb)",
      }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = counts[tab.key] ?? 0;
          return (
            <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} style={{
              padding: "5px 12px", borderRadius: 8,
              border: isActive ? "1px solid var(--wm-er-accent-console)" : "1px solid var(--wm-er-border, #e5e7eb)",
              background: isActive ? "var(--wm-er-accent-console-light)" : "#fff",
              color: isActive ? "var(--wm-er-accent-console)" : "var(--wm-er-muted)",
              fontWeight: 700, fontSize: 12, cursor: "pointer",
            }}>
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Reports List */}
      {filtered.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((r) => <IncidentItem key={r.id} report={r} />)}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--wm-er-muted)", fontSize: 13 }}>
          {activeTab === "all"
            ? "No incident reports yet."
            : `No ${TABS.find((t) => t.key === activeTab)?.label.toLowerCase() ?? ""} reports.`}
        </div>
      )}

      <div style={{ height: 32 }} />
    </div>
  );
}