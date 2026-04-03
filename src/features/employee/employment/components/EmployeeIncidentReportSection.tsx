// src/features/employee/employment/components/EmployeeIncidentReportSection.tsx
//
// Employee side — Report Issue (Root Map 6.1.4).
// Submit incident reports + view previously submitted reports.

import { useState, useEffect } from "react";
import { incidentReportStorage } from "../../../employer/hrManagement/storage/incidentReport.storage";
import type { IncidentReport, IncidentUrgency, IncidentFormData } from "../../../employer/hrManagement/types/incidentReport.types";
import { CenterModal } from "../../../../shared/components/CenterModal";

const URGENCY_OPTIONS: { value: IncidentUrgency; label: string; color: string; description: string }[] = [
  { value: "low", label: "Low", color: "#6b7280", description: "Not urgent — can be addressed later" },
  { value: "medium", label: "Medium", color: "#d97706", description: "Needs attention within a day or two" },
  { value: "high", label: "High", color: "#dc2626", description: "Urgent — needs immediate attention" },
  { value: "critical", label: "Critical", color: "#7f1d1d", description: "Emergency — safety risk or major damage" },
];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  reported: { label: "Reported", color: "#dc2626" },
  acknowledged: { label: "Acknowledged", color: "#d97706" },
  in_progress: { label: "In Progress", color: "#2563eb" },
  resolved: { label: "Resolved", color: "#15803d" },
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", fontSize: 13,
  border: "1px solid var(--wm-emp-border, var(--wm-er-border, #e5e7eb))",
  borderRadius: 8, outline: "none", background: "#fff",
  color: "var(--wm-emp-text, var(--wm-er-text))", boxSizing: "border-box",
};

type Props = {
  employmentId: string;
  hrCandidateId: string | null;
  employeeName: string;
};

export function EmployeeIncidentReportSection({ employmentId, hrCandidateId, employeeName }: Props) {
  const [reports, setReports] = useState<IncidentReport[]>(
    () => incidentReportStorage.getForEmployment(employmentId),
  );
  const [showModal, setShowModal] = useState(false);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [urgency, setUrgency] = useState<IncidentUrgency>("medium");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const refresh = () => setReports(incidentReportStorage.getForEmployment(employmentId));
    refresh();
    return incidentReportStorage.subscribe(refresh);
  }, [employmentId]);

  const handleSubmit = () => {
    if (!description.trim() || !hrCandidateId) return;

    const form: IncidentFormData = { description, location, urgency };
    incidentReportStorage.submitReport({
      hrCandidateId,
      employmentId,
      employeeName,
      form,
    });

    setDescription("");
    setLocation("");
    setUrgency("medium");
    setShowModal(false);
    setSuccessMsg("Issue reported successfully! Your employer will be notified.");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const canSubmit = description.trim().length > 0 && hrCandidateId;

  return (
    <div className="wm-ee-card">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-emp-text, var(--wm-er-text))" }}>
            Report Issue
          </div>
          <div style={{ fontSize: 11, color: "var(--wm-emp-muted, var(--wm-er-muted))", marginTop: 2 }}>
            Report problems or incidents from your workplace
          </div>
        </div>
        <button className="wm-primarybtn" type="button" onClick={() => setShowModal(true)}
          style={{ fontSize: 12, padding: "7px 14px" }}>
          + Report
        </button>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div style={{
          marginBottom: 10, padding: "8px 12px", borderRadius: 8,
          background: "#f0fdf4", border: "1px solid #bbf7d0",
          fontSize: 12, fontWeight: 700, color: "#15803d",
        }}>{successMsg}</div>
      )}

      {/* Previous Reports */}
      {reports.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {reports.map((report) => {
            const sCfg = STATUS_LABELS[report.status] ?? STATUS_LABELS.reported;
            const dateStr = new Date(report.reportedAt).toLocaleDateString("en-GB", {
              day: "2-digit", month: "short", year: "numeric",
            });
            return (
              <div key={report.id} style={{
                padding: "10px 12px", borderRadius: 8,
                border: "1px solid var(--wm-emp-border, var(--wm-er-border, #e5e7eb))",
                background: report.status === "resolved" ? "#fafafa" : "#fff",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--wm-emp-text, var(--wm-er-text))", lineHeight: 1.4, flex: 1 }}>
                    {report.description.length > 80 ? report.description.slice(0, 80) + "..." : report.description}
                  </div>
                  <span style={{
                    padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 800,
                    background: `${sCfg.color}15`, color: sCfg.color, textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}>{sCfg.label}</span>
                </div>
                <div style={{ fontSize: 11, color: "var(--wm-emp-muted, var(--wm-er-muted))", marginTop: 4, display: "flex", gap: 8 }}>
                  {report.location && <span>📍 {report.location}</span>}
                  <span>📅 {dateStr}</span>
                </div>
                {report.employerNotes.length > 0 && (
                  <div style={{
                    marginTop: 6, padding: "6px 8px", borderRadius: 6,
                    background: "#f0f9ff", border: "1px solid #bae6fd",
                    fontSize: 12, color: "#0369a1",
                  }}>
                    Employer: {report.employerNotes[report.employerNotes.length - 1].content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "16px 0", color: "var(--wm-emp-muted, var(--wm-er-muted))", fontSize: 13 }}>
          No issues reported yet.
        </div>
      )}

      {/* Report Modal */}
      <CenterModal open={showModal} onBackdropClose={() => setShowModal(false)} ariaLabel="Report Issue" maxWidth={440}>
        <div style={{ padding: 20 }}>
          <div style={{ fontWeight: 900, fontSize: 15, color: "var(--wm-emp-text, var(--wm-er-text))" }}>Report Issue</div>
          <div style={{ fontSize: 12, color: "var(--wm-emp-muted, var(--wm-er-muted))", marginTop: 2, marginBottom: 16 }}>
            Describe the problem. Your employer will be notified immediately.
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: "var(--wm-emp-text, var(--wm-er-text))", display: "block", marginBottom: 4 }}>
              What happened? *
            </label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..." rows={4}
              style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          {/* Location */}
          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 800, color: "var(--wm-emp-text, var(--wm-er-text))", display: "block", marginBottom: 4 }}>
              Location / Site
            </label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Site A, Main Office" style={inputStyle} />
          </div>

          {/* Urgency */}
          <div style={{ marginTop: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 800, color: "var(--wm-emp-text, var(--wm-er-text))", display: "block", marginBottom: 6 }}>
              Urgency Level
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {URGENCY_OPTIONS.map((opt) => {
                const isActive = urgency === opt.value;
                return (
                  <button key={opt.value} type="button" onClick={() => setUrgency(opt.value)} style={{
                    padding: "8px 10px", textAlign: "left",
                    border: isActive ? `2px solid ${opt.color}` : "1px solid var(--wm-emp-border, var(--wm-er-border, #e5e7eb))",
                    borderRadius: 8, background: isActive ? `${opt.color}10` : "#fff", cursor: "pointer",
                  }}>
                    <div style={{ fontWeight: isActive ? 800 : 600, fontSize: 12, color: opt.color }}>{opt.label}</div>
                    <div style={{ fontSize: 10, color: "var(--wm-emp-muted, var(--wm-er-muted))", marginTop: 2 }}>{opt.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button className="wm-outlineBtn" type="button" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="wm-primarybtn" type="button" onClick={handleSubmit}
              disabled={!canSubmit} style={{ opacity: canSubmit ? 1 : 0.5 }}>
              Submit Report
            </button>
          </div>
        </div>
      </CenterModal>
    </div>
  );
}