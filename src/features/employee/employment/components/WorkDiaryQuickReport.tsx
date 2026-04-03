// src/features/employee/employment/components/WorkDiaryQuickReport.tsx
//
// Employee Quick Report — simple date range summary.
// No PDF, no download — just view. Notepad style.
// Custom date range → Days Worked, Total Hours, Leave, Off.

import { useState } from "react";


type Props = {
  employmentId: string;
};

export function WorkDiaryQuickReport({ employmentId }: Props) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [report, setReport] = useState<{
    daysWorked: number;
    totalHours: number;
    daysLeave: number;
    daysOff: number;
    startDisplay: string;
    endDisplay: string;
  } | null>(null);

  const canGenerate = startDate.length > 0 && endDate.length > 0 && startDate <= endDate;

  const formatDisplay = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  const handleGenerate = () => {
    if (!canGenerate) return;

    const allEntries = (() => {
      const key = "wm_work_diary_v1";
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    })();

    const filtered = allEntries.filter(
      (e: { employmentId: string; dateKey: string }) =>
        e.employmentId === employmentId &&
        e.dateKey >= startDate &&
        e.dateKey <= endDate,
    );

    let daysWorked = 0;
    let totalHours = 0;
    let daysLeave = 0;
    let daysOff = 0;

    for (const entry of filtered) {
      switch (entry.status) {
        case "worked": daysWorked++; break;
        case "leave": daysLeave++; break;
        case "off": daysOff++; break;
      }
      if (entry.totalHours) totalHours += entry.totalHours;
    }

    setReport({
      daysWorked,
      totalHours: Math.round(totalHours * 100) / 100,
      daysLeave,
      daysOff,
      startDisplay: formatDisplay(startDate),
      endDisplay: formatDisplay(endDate),
    });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    fontSize: 13,
    border: "1px solid var(--wm-emp-border, var(--wm-er-border, #e5e7eb))",
    borderRadius: 8,
    outline: "none",
    background: "#fff",
    color: "var(--wm-emp-text, var(--wm-er-text))",
    boxSizing: "border-box",
  };

  return (
    <div className="wm-ee-card">
      {/* Header */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-emp-text, var(--wm-er-text))" }}>
          Quick Report
        </div>
        <div style={{ fontSize: 11, color: "var(--wm-emp-muted, var(--wm-er-muted))", marginTop: 2 }}>
          View your work summary for any date range
        </div>
      </div>

      {/* Date Range */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 800, color: "var(--wm-emp-text, var(--wm-er-text))", display: "block", marginBottom: 4 }}>
            From
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setReport(null); }}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 800, color: "var(--wm-emp-text, var(--wm-er-text))", display: "block", marginBottom: 4 }}>
            To
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setReport(null); }}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Validation */}
      {startDate && endDate && startDate > endDate && (
        <div style={{
          marginTop: 8, padding: "6px 10px", borderRadius: 6,
          background: "#fee2e2", border: "1px solid #fca5a5",
          fontSize: 12, color: "#dc2626", fontWeight: 600,
        }}>
          End date must be after start date.
        </div>
      )}

      {/* Generate */}
      <button
        className="wm-primarybtn"
        type="button"
        onClick={handleGenerate}
        disabled={!canGenerate}
        style={{ width: "100%", marginTop: 12, opacity: canGenerate ? 1 : 0.5 }}
      >
        View Report
      </button>

      {/* Report Display — Notepad Style */}
      {report && (
        <div style={{
          marginTop: 14,
          padding: 16,
          background: "#fffef5",
          borderRadius: 10,
          border: "1px solid #fde68a",
          fontFamily: "monospace",
        }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: "#92400e", marginBottom: 10 }}>
            Work Summary
          </div>
          <div style={{ fontSize: 12, color: "#78716c", marginBottom: 12 }}>
            {report.startDisplay}  →  {report.endDisplay}
          </div>

          <div style={{ borderTop: "1px dashed #d6d3d1", paddingTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "#57534e" }}>Days Worked</span>
              <span style={{ fontWeight: 800, color: "#15803d" }}>{report.daysWorked}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "#57534e" }}>Total Hours</span>
              <span style={{ fontWeight: 800, color: "#1e40af" }}>{report.totalHours}h</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "#57534e" }}>Leave Days</span>
              <span style={{ fontWeight: 800, color: "#dc2626" }}>{report.daysLeave}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "#57534e" }}>Off Days</span>
              <span style={{ fontWeight: 800, color: "#6b7280" }}>{report.daysOff}</span>
            </div>
          </div>

          <div style={{
            borderTop: "1px dashed #d6d3d1",
            marginTop: 10,
            paddingTop: 8,
            fontSize: 10,
            color: "#a8a29e",
            textAlign: "center",
          }}>
            Personal record — from your Work Diary
          </div>
        </div>
      )}
    </div>
  );
}