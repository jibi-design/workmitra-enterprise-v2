// src/features/employer/hrManagement/components/IncidentReportSection.tsx
//
// Employer view of Incident Reports for a specific employee.
// View reports, update status (Reported → Acknowledged → In Progress → Resolved), add notes.

import { useState, useEffect } from "react";
import type { HRCandidateRecord } from "../types/hrManagement.types";
import type { IncidentReport, IncidentStatus } from "../types/incidentReport.types";
import { incidentReportStorage } from "../storage/incidentReport.storage";

const STATUS_CONFIG: Record<IncidentStatus, { label: string; color: string; bg: string }> = {
  reported:     { label: "Reported",     color: "#dc2626", bg: "#fee2e2" },
  acknowledged: { label: "Acknowledged", color: "#d97706", bg: "#fef3c7" },
  in_progress:  { label: "In Progress",  color: "#0369a1", bg: "#eff6ff" },
  resolved:     { label: "Resolved",     color: "#15803d", bg: "#dcfce7" },
};

const URGENCY_CONFIG: Record<string, { label: string; color: string }> = {
  low:      { label: "Low",      color: "#6b7280" },
  medium:   { label: "Medium",   color: "#d97706" },
  high:     { label: "High",     color: "#dc2626" },
  critical: { label: "Critical", color: "#7f1d1d" },
};

const STATUS_FLOW: IncidentStatus[] = ["reported", "acknowledged", "in_progress", "resolved"];

type Props = { record: HRCandidateRecord };

function IncidentCard({ report }: { report: IncidentReport }) {
  const [newNote, setNewNote] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  const sCfg = STATUS_CONFIG[report.status];
  const uCfg = URGENCY_CONFIG[report.urgency] ?? URGENCY_CONFIG.low;

  const dateStr = new Date(report.reportedAt).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });

  const currentIdx = STATUS_FLOW.indexOf(report.status);
  const nextStatus = currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null;

  const handleAdvance = () => {
    if (nextStatus) incidentReportStorage.updateStatus(report.id, nextStatus);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    incidentReportStorage.addNote(report.id, newNote);
    setNewNote("");
  };

  return (
    <div style={{
      padding: 12, borderRadius: 10,
      border: `1px solid ${report.urgency === "critical" ? "#fca5a5" : "var(--wm-er-border, #e5e7eb)"}`,
      background: report.status === "resolved" ? "#fafafa" : "#fff",
      opacity: report.status === "resolved" ? 0.8 : 1,
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)", lineHeight: 1.4 }}>
            {report.description.length > 100 ? report.description.slice(0, 100) + "..." : report.description}
          </div>
          <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 4, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {report.location && <span>📍 {report.location}</span>}
            <span>📅 {dateStr}</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end", flexShrink: 0 }}>
          <span style={{
            padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 800,
            background: sCfg.bg, color: sCfg.color, textTransform: "uppercase",
          }}>{sCfg.label}</span>
          <span style={{
            padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 800,
            background: `${uCfg.color}15`, color: uCfg.color, textTransform: "uppercase",
          }}>{uCfg.label}</span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button type="button" onClick={() => setShowNotes(!showNotes)} style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 11, fontWeight: 700, color: "var(--wm-er-accent-console)", padding: 0,
        }}>
          {showNotes ? "Hide Details" : `Details (${report.employerNotes.length} notes)`}
        </button>
        {nextStatus && (
          <button className="wm-primarybtn" type="button" onClick={handleAdvance}
            style={{ fontSize: 11, padding: "5px 12px" }}>
            Mark as {STATUS_CONFIG[nextStatus].label}
          </button>
        )}
      </div>

      {/* Expanded Notes */}
      {showNotes && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--wm-er-border, #e5e7eb)" }}>
          {report.employerNotes.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
              {report.employerNotes.map((note) => (
                <div key={note.id} style={{
                  padding: "6px 8px", borderRadius: 6, background: "#f9fafb",
                  border: "1px solid var(--wm-er-border, #e5e7eb)",
                }}>
                  <div style={{ fontSize: 12, color: "var(--wm-er-text)" }}>{note.content}</div>
                  <div style={{ fontSize: 10, color: "var(--wm-er-muted)", marginTop: 2 }}>
                    {new Date(note.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 6 }}>
            <input type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddNote(); } }}
              placeholder="Add a note..."
              style={{
                flex: 1, padding: "7px 10px", fontSize: 12,
                border: "1px solid var(--wm-er-border, #e5e7eb)", borderRadius: 6,
                outline: "none", background: "#fff", color: "var(--wm-er-text)", boxSizing: "border-box",
              }} />
            <button type="button" onClick={handleAddNote} disabled={!newNote.trim()} style={{
              padding: "0 12px", border: "1px solid var(--wm-er-border, #e5e7eb)", borderRadius: 6,
              background: newNote.trim() ? "var(--wm-er-accent-console, #0369a1)" : "#f3f4f6",
              color: newNote.trim() ? "#fff" : "var(--wm-er-muted)",
              cursor: newNote.trim() ? "pointer" : "default", fontSize: 12, fontWeight: 700,
            }}>Add</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function IncidentReportSection({ record }: Props) {
  const [reports, setReports] = useState<IncidentReport[]>(() =>
    incidentReportStorage.getForCandidate(record.id),
  );
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const refresh = () => setReports(incidentReportStorage.getForCandidate(record.id));
    refresh();
    return incidentReportStorage.subscribe(refresh);
  }, [record.id]);

  const activeReports = reports.filter((r) => r.status !== "resolved");
  const resolvedReports = reports.filter((r) => r.status === "resolved");
  const displayResolved = showAll ? resolvedReports : resolvedReports.slice(0, 3);

  return (
    <div style={{
      padding: 16, background: "#fff", borderRadius: 12,
      border: "1px solid var(--wm-er-border, #e5e7eb)",
    }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 900, fontSize: 15, color: "var(--wm-er-text)" }}>Incident Reports</div>
        <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>Issues reported by this employee</div>
      </div>

      {activeReports.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 800, fontSize: 12, color: "#dc2626", marginBottom: 6 }}>
            Active ({activeReports.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {activeReports.map((r) => <IncidentCard key={r.id} report={r} />)}
          </div>
        </div>
      )}

      {resolvedReports.length > 0 && (
        <div>
          <div style={{ fontWeight: 800, fontSize: 12, color: "var(--wm-er-muted)", marginBottom: 6 }}>
            Resolved ({resolvedReports.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {displayResolved.map((r) => <IncidentCard key={r.id} report={r} />)}
          </div>
          {resolvedReports.length > 3 && !showAll && (
            <button type="button" onClick={() => setShowAll(true)} style={{
              marginTop: 6, background: "none", border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 800, color: "var(--wm-er-accent-console)", padding: 0,
            }}>View all {resolvedReports.length} resolved →</button>
          )}
        </div>
      )}

      {reports.length === 0 && (
        <div style={{ textAlign: "center", padding: "16px 0", color: "var(--wm-er-muted)", fontSize: 13 }}>
          No incident reports from this employee.
        </div>
      )}
    </div>
  );
}
