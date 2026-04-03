// src/features/employer/hrManagement/components/QuickReportsSection.tsx
//
// Quick Reports / Export — Root Map Section 5.3.D.
// Custom date range attendance report.
// NOT fixed monthly — any range works (1st–31st, 15th–15th, 25th–25th, etc.).
// Downloadable PDF + share via email / WhatsApp.

import { useState } from "react";
import type { HRCandidateRecord } from "../types/hrManagement.types";
import { generateAttendanceReport } from "../helpers/quickReportGenerator";
import type { GeneratedReport } from "../helpers/quickReportGenerator";
import { attendanceLogStorage } from "../storage/attendanceLog.storage";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  record: HRCandidateRecord;
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 13,
  border: "1px solid var(--wm-er-border, #e5e7eb)",
  borderRadius: 8,
  outline: "none",
  background: "#fff",
  color: "var(--wm-er-text)",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: "var(--wm-er-text)",
  display: "block",
  marginBottom: 4,
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function QuickReportsSection({ record }: Props) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewSummary, setPreviewSummary] = useState<{
    daysPresent: number;
    daysAbsent: number;
    daysLeave: number;
    daysOff: number;
    totalHours: number;
  } | null>(null);

  const canGenerate = startDate.length > 0 && endDate.length > 0 && startDate <= endDate;

  // Show preview summary when both dates selected
  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setGeneratedReport(null);

    if (start && end && start <= end) {
      const summary = attendanceLogStorage.getRangeSummary(record.id, start, end);
      setPreviewSummary(summary);
    } else {
      setPreviewSummary(null);
    }
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;

    setIsGenerating(true);

    try {
      const report = await generateAttendanceReport({
        employeeName: record.employeeName,
        employeeId: record.employeeUniqueId,
        jobTitle: record.jobTitle,
        department: record.department,
        startDate,
        endDate,
        hrCandidateId: record.id,
      });

      setGeneratedReport(report);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedReport) return;

    const url = URL.createObjectURL(generatedReport.blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = generatedReport.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShareEmail = () => {
    if (!generatedReport) return;

    const subject = encodeURIComponent(
      `Attendance Report - ${record.employeeName} (${startDate} to ${endDate})`,
    );
    const body = encodeURIComponent(
      `Please find the attendance report for ${record.employeeName}.\n\nPeriod: ${startDate} to ${endDate}\n\nNote: Please download the PDF report from WorkMitra and attach it to this email.`,
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  const handleShareWhatsApp = () => {
    if (!generatedReport) return;

    const text = encodeURIComponent(
      `Attendance Report - ${record.employeeName}\nPeriod: ${startDate} to ${endDate}\n\nGenerated from WorkMitra.`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div
      style={{
        padding: 16,
        background: "#fff",
        borderRadius: 12,
        border: "1px solid var(--wm-er-border, #e5e7eb)",
      }}
    >
      {/* Section Header */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 900, fontSize: 15, color: "var(--wm-er-text)" }}>
          Quick Reports
        </div>
        <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
          Generate attendance report for any date range
        </div>
      </div>

      {/* Date Range Picker */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label style={labelStyle}>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => handleDateChange(e.target.value, endDate)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => handleDateChange(startDate, e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Date validation message */}
      {startDate && endDate && startDate > endDate && (
        <div style={{
          marginTop: 8,
          padding: "6px 10px",
          borderRadius: 6,
          background: "#fee2e2",
          border: "1px solid #fca5a5",
          fontSize: 12,
          color: "#dc2626",
          fontWeight: 600,
        }}>
          End date must be after start date.
        </div>
      )}

      {/* Preview Summary */}
      {previewSummary && canGenerate && (
        <div style={{
          marginTop: 12,
          padding: 12,
          background: "#f8fafc",
          borderRadius: 8,
          border: "1px solid var(--wm-er-border, #e5e7eb)",
        }}>
          <div style={{
            fontWeight: 800,
            fontSize: 11,
            color: "var(--wm-er-muted)",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginBottom: 8,
          }}>
            Preview
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
              <span>✅</span>
              <span style={{ color: "var(--wm-er-muted)" }}>Present:</span>
              <span style={{ fontWeight: 800, color: "#15803d" }}>{previewSummary.daysPresent}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
              <span>🔴</span>
              <span style={{ color: "var(--wm-er-muted)" }}>Absent:</span>
              <span style={{ fontWeight: 800, color: "#dc2626" }}>{previewSummary.daysAbsent}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
              <span>🟡</span>
              <span style={{ color: "var(--wm-er-muted)" }}>Leave:</span>
              <span style={{ fontWeight: 800, color: "#d97706" }}>{previewSummary.daysLeave}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
              <span>⏱</span>
              <span style={{ color: "var(--wm-er-muted)" }}>Hours:</span>
              <span style={{ fontWeight: 800, color: "var(--wm-er-text)" }}>{previewSummary.totalHours}h</span>
            </div>
          </div>
        </div>
      )}

      {/* Generate Button */}
      <div style={{ marginTop: 14 }}>
        <button
          className="wm-primarybtn"
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate || isGenerating}
          style={{
            width: "100%",
            opacity: canGenerate && !isGenerating ? 1 : 0.5,
          }}
        >
          {isGenerating ? "Generating..." : "Generate PDF Report"}
        </button>
      </div>

      {/* Download + Share */}
      {generatedReport && (
        <div style={{
          marginTop: 12,
          padding: 14,
          background: "#f0fdf4",
          borderRadius: 10,
          border: "1px solid #bbf7d0",
        }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: "#15803d", marginBottom: 10 }}>
            Report Ready
          </div>

          {/* Download */}
          <button
            type="button"
            onClick={handleDownload}
            style={{
              width: "100%",
              padding: "10px 0",
              border: "1px solid #15803d",
              borderRadius: 8,
              background: "#fff",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 800,
              color: "#15803d",
            }}
          >
            Download PDF
          </button>

          {/* Share Options */}
          <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button
              type="button"
              onClick={handleShareEmail}
              style={{
                padding: "9px 0",
                border: "1px solid var(--wm-er-border, #e5e7eb)",
                borderRadius: 8,
                background: "#fff",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
                color: "var(--wm-er-text)",
              }}
            >
              Share via Email
            </button>
            <button
              type="button"
              onClick={handleShareWhatsApp}
              style={{
                padding: "9px 0",
                border: "1px solid var(--wm-er-border, #e5e7eb)",
                borderRadius: 8,
                background: "#fff",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
                color: "#25d366",
              }}
            >
              Share via WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  );
}