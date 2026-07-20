// App: Job Mitra / WorkMitra_Enterprise_v2
// File: QuickReportsSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\QuickReportsSection.tsx

import { useState } from "react";
import { generateAttendanceReport, type GeneratedReport } from "../helpers/quickReportGenerator";
import { attendanceLogStorage } from "../storage/attendanceLog.storage";
import type { HRCandidateRecord } from "../types/hrManagement.types";
import { QuickReportsDateRangeFields } from "./quickReports/QuickReportsDateRangeFields";
import { QuickReportsPreviewSummary } from "./quickReports/QuickReportsPreviewSummary";
import { QuickReportsReadyActions } from "./quickReports/QuickReportsReadyActions";

type Props = {
  record: HRCandidateRecord;
};

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

  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setGeneratedReport(null);

    if (start && end && start <= end) {
      const summary = attendanceLogStorage.getRangeSummary(record.id, start, end);
      setPreviewSummary(summary);
      return;
    }

    setPreviewSummary(null);
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
      `Please find the attendance report for ${record.employeeName}.\n\nPeriod: ${startDate} to ${endDate}\n\nNote: Please download the PDF report from Job Mitra and attach it to this email.`,
    );

    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  const handleShareWhatsApp = () => {
    if (!generatedReport) return;

    const text = encodeURIComponent(
      `Attendance Report - ${record.employeeName}\nPeriod: ${startDate} to ${endDate}\n\nGenerated from Job Mitra.`,
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
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 900, fontSize: 15, color: "var(--wm-er-text)" }}>
          Quick Reports
        </div>

        <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
          Generate attendance report for any date range
        </div>
      </div>

      <QuickReportsDateRangeFields
        startDate={startDate}
        endDate={endDate}
        hasInvalidRange={Boolean(startDate && endDate && startDate > endDate)}
        onStartDateChange={(value) => handleDateChange(value, endDate)}
        onEndDateChange={(value) => handleDateChange(startDate, value)}
      />

      <QuickReportsPreviewSummary previewSummary={previewSummary} canGenerate={canGenerate} />

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

      <QuickReportsReadyActions
        isReady={Boolean(generatedReport)}
        onDownload={handleDownload}
        onShareEmail={handleShareEmail}
        onShareWhatsApp={handleShareWhatsApp}
      />
    </div>
  );
}
