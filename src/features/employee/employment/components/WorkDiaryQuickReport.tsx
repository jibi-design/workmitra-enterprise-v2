// App name: Job Mitra
// File name: WorkDiaryQuickReport.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\employment\components\WorkDiaryQuickReport.tsx

import { useState } from "react";
import { workDiaryStorage } from "../storage/workDiary.storage";

type Props = {
  employmentId: string;
  jobTitle: string;
  companyName: string;
};

const CONSOLE_BLUE = "var(--wm-er-accent-console, #0369a1)";
const TEXT = "var(--wm-emp-text, var(--wm-er-text, #1e293b))";
const MUTED = "var(--wm-emp-muted, var(--wm-er-muted, #64748b))";

export function WorkDiaryQuickReport({ employmentId, jobTitle, companyName }: Props) {
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
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleReportAction = () => {
    if (report) {
      setReport(null);
      return;
    }

    if (!canGenerate) return;

    const filtered = workDiaryStorage.getRangeEntries(employmentId, startDate, endDate);

    let daysWorked = 0;
    let totalHours = 0;
    let daysLeave = 0;
    let daysOff = 0;

    for (const entry of filtered) {
      switch (entry.status) {
        case "worked":
          daysWorked++;
          break;
        case "leave":
          daysLeave++;
          break;
        case "off":
          daysOff++;
          break;
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
    border: "1px solid rgba(3,105,161,0.14)",
    borderRadius: 12,
    outline: "none",
    background: "#ffffff",
    color: TEXT,
    boxSizing: "border-box",
    fontWeight: 700,
  };

  return (
    <div className="wm-ee-card" style={{ border: "1px solid rgba(3,105,161,0.13)" }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 950, fontSize: 14, color: TEXT }}>Quick Report</div>
        <div style={{ fontSize: 11.5, color: MUTED, marginTop: 3, lineHeight: 1.45 }}>
          View your personal work summary for this job.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label
            style={{
              fontSize: 12,
              fontWeight: 850,
              color: TEXT,
              display: "block",
              marginBottom: 5,
            }}
          >
            From
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(event) => {
              setStartDate(event.target.value);
              setReport(null);
            }}
            style={inputStyle}
          />
        </div>

        <div>
          <label
            style={{
              fontSize: 12,
              fontWeight: 850,
              color: TEXT,
              display: "block",
              marginBottom: 5,
            }}
          >
            To
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(event) => {
              setEndDate(event.target.value);
              setReport(null);
            }}
            style={inputStyle}
          />
        </div>
      </div>

      {startDate && endDate && startDate > endDate && (
        <div
          style={{
            marginTop: 9,
            padding: "8px 10px",
            borderRadius: 12,
            background: "rgba(220,38,38,0.07)",
            border: "1px solid rgba(220,38,38,0.16)",
            fontSize: 12,
            color: "#dc2626",
            fontWeight: 850,
          }}
        >
          End date must be after start date.
        </div>
      )}

      <button
        type="button"
        onClick={handleReportAction}
        disabled={!report && !canGenerate}
        style={{
          width: "100%",
          marginTop: 12,
          height: 40,
          borderRadius: 13,
          border: report ? "1px solid rgba(3,105,161,0.2)" : "none",
          background: report
            ? "rgba(3,105,161,0.08)"
            : canGenerate
              ? CONSOLE_BLUE
              : "rgba(3,105,161,0.35)",
          color: report ? CONSOLE_BLUE : "#ffffff",
          fontSize: 13,
          fontWeight: 950,
          cursor: report || canGenerate ? "pointer" : "not-allowed",
          boxShadow: !report && canGenerate ? "0 10px 22px rgba(3,105,161,0.16)" : "none",
        }}
      >
        {report ? "Hide Report" : "View Report"}
      </button>

      {report && (
        <div
          style={{
            marginTop: 14,
            padding: 14,
            background: "linear-gradient(135deg, rgba(255,255,255,1), rgba(240,249,255,0.72))",
            borderRadius: 18,
            border: "1px solid rgba(3,105,161,0.13)",
          }}
        >
          <div style={{ fontWeight: 950, fontSize: 13.5, color: TEXT }}>Work Summary</div>

          <div style={{ fontSize: 12, color: MUTED, marginTop: 5, lineHeight: 1.45 }}>
            {report.startDisplay} to {report.endDisplay}
          </div>

          <div
            style={{
              marginTop: 9,
              marginBottom: 12,
              padding: "7px 9px",
              borderRadius: 12,
              background: "rgba(3,105,161,0.07)",
              color: TEXT,
              fontSize: 11.5,
              fontWeight: 850,
            }}
          >
            Report for: {jobTitle} at {companyName}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <ReportStat label="Days Worked" value={String(report.daysWorked)} />
            <ReportStat label="Total Hours" value={`${report.totalHours}h`} />
            <ReportStat label="Leave Days" value={String(report.daysLeave)} />
            <ReportStat label="Off Days" value={String(report.daysOff)} />
          </div>

          <div
            style={{
              marginTop: 11,
              paddingTop: 9,
              borderTop: "1px solid rgba(148,163,184,0.16)",
              fontSize: 10.5,
              color: MUTED,
              textAlign: "center",
              fontWeight: 750,
            }}
          >
            Personal record from your Work Diary
          </div>
        </div>
      )}
    </div>
  );
}

function ReportStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "10px 11px",
        borderRadius: 14,
        background: "rgba(255,255,255,0.86)",
        border: "1px solid rgba(3,105,161,0.1)",
      }}
    >
      <div style={{ fontSize: 10.5, color: MUTED, fontWeight: 850 }}>{label}</div>
      <div style={{ marginTop: 4, fontSize: 15, color: TEXT, fontWeight: 950 }}>{value}</div>
    </div>
  );
}
