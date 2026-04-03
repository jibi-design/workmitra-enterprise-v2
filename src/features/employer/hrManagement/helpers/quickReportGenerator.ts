// src/features/employer/hrManagement/helpers/quickReportGenerator.ts
//
// PDF report generator for Quick Reports (Root Map Section 5.3.D).
// Generates downloadable attendance report for custom date range.
// Uses jsPDF — no server dependency.
// Report includes: present days, absent, leave, total hours.

async function loadJsPDF() {
  const { jsPDF } = await import("jspdf");
  return jsPDF;
}
import { attendanceLogStorage } from "../storage/attendanceLog.storage";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ReportData = {
  employeeName: string;
  employeeId: string;
  jobTitle: string;
  department: string;
  startDate: string;
  endDate: string;
  hrCandidateId: string;
};

export type GeneratedReport = {
  blob: Blob;
  filename: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Date Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatDisplayDate(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF Generator
// ─────────────────────────────────────────────────────────────────────────────

export async function generateAttendanceReport(data: ReportData): Promise<GeneratedReport> {
  const summary = attendanceLogStorage.getRangeSummary(
    data.hrCandidateId,
    data.startDate,
    data.endDate,
  );

  const entries = attendanceLogStorage.getAllForCandidate(data.hrCandidateId)
    .filter((e) => e.dateKey >= data.startDate && e.dateKey <= data.endDate)
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey));

    const JsPDF = await loadJsPDF();
  const doc = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ── Header ──
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 82, 118);
  doc.text("WorkMitra", margin, y);

  y += 8;
  doc.setFontSize(13);
  doc.setTextColor(46, 134, 193);
  doc.text("Attendance Report", margin, y);

  y += 6;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(93, 109, 126);
  doc.text(
    `Period: ${formatDisplayDate(data.startDate)} to ${formatDisplayDate(data.endDate)}`,
    margin,
    y,
  );

  y += 4;
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`,
    margin,
    y,
  );

  // ── Divider ──
  y += 6;
  doc.setDrawColor(174, 214, 241);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);

  // ── Employee Info ──
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(27, 79, 114);
  doc.text("Employee Details", margin, y);

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);

  const infoRows = [
    ["Name", data.employeeName],
    ["ID", data.employeeId],
    ["Job Title", data.jobTitle],
    ["Department", data.department || "—"],
  ];

  for (const [label, value] of infoRows) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(93, 109, 126);
    doc.text(`${label}:`, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(value, margin + 30, y);
    y += 5;
  }

  // ── Summary Box ──
  y += 4;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(27, 79, 114);
  doc.text("Summary", margin, y);

  y += 4;
  const boxY = y;
  const boxH = 28;
  doc.setFillColor(235, 245, 251);
  doc.setDrawColor(174, 214, 241);
  doc.roundedRect(margin, boxY, contentWidth, boxH, 3, 3, "FD");

  y += 7;
  doc.setFontSize(9);

  const summaryItems = [
    { label: "Days Present", value: String(summary.daysPresent), color: [21, 128, 61] },
    { label: "Days Absent", value: String(summary.daysAbsent), color: [220, 38, 38] },
    { label: "Leave", value: String(summary.daysLeave), color: [217, 119, 6] },
    { label: "Off/Holiday", value: String(summary.daysOff), color: [107, 114, 128] },
    { label: "Total Hours", value: `${summary.totalHours}h`, color: [26, 82, 118] },
  ];

  const colWidth = contentWidth / summaryItems.length;

  for (let i = 0; i < summaryItems.length; i++) {
    const item = summaryItems[i];
    const x = margin + colWidth * i + colWidth / 2;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(93, 109, 126);
    doc.text(item.label, x, y, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(item.color[0], item.color[1], item.color[2]);
    doc.text(item.value, x, y + 7, { align: "center" });

    doc.setFontSize(9);
  }

  y = boxY + boxH + 8;

  // ── Daily Breakdown Table ──
  if (entries.length > 0) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(27, 79, 114);
    doc.text("Daily Breakdown", margin, y);

    y += 6;

    // Table header
    const cols = [
      { label: "Date", x: margin, w: 28 },
      { label: "Status", x: margin + 28, w: 22 },
      { label: "Sign In", x: margin + 50, w: 20 },
      { label: "Sign Out", x: margin + 70, w: 20 },
      { label: "Hours", x: margin + 90, w: 18 },
      { label: "Location", x: margin + 108, w: 35 },
      { label: "Note", x: margin + 143, w: contentWidth - 143 },
    ];

    doc.setFillColor(26, 82, 118);
    doc.rect(margin, y, contentWidth, 6, "F");

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);

    for (const col of cols) {
      doc.text(col.label, col.x + 1, y + 4);
    }

    y += 6;

    // Table rows
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);

    const statusLabels: Record<string, string> = {
      present: "Present",
      absent: "Absent",
      leave: "Leave",
      off: "Off",
    };

    for (let i = 0; i < entries.length; i++) {
      // New page check
      if (y > 270) {
        doc.addPage();
        y = margin;
      }

      const entry = entries[i];
      const isEven = i % 2 === 0;

      if (isEven) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, contentWidth, 5, "F");
      }

      doc.setTextColor(0, 0, 0);

      const dateStr = formatDisplayDate(entry.dateKey);
      const statusStr = statusLabels[entry.status] ?? entry.status;
      const signInStr = entry.signInTime ?? "—";
      const signOutStr = entry.signOutTime ?? "—";
      const hoursStr = entry.totalHours ? `${entry.totalHours}h` : "—";
      const locationStr = entry.location ?? "—";
      const noteStr = entry.note ?? "";

      doc.text(dateStr, cols[0].x + 1, y + 3.5);
      doc.text(statusStr, cols[1].x + 1, y + 3.5);
      doc.text(signInStr, cols[2].x + 1, y + 3.5);
      doc.text(signOutStr, cols[3].x + 1, y + 3.5);
      doc.text(hoursStr, cols[4].x + 1, y + 3.5);
      doc.text(locationStr.substring(0, 18), cols[5].x + 1, y + 3.5);
      doc.text(noteStr.substring(0, 20), cols[6].x + 1, y + 3.5);

      y += 5;
    }
  }

  // ── Footer ──
  y += 10;
  if (y > 270) {
    doc.addPage();
    y = margin;
  }

  doc.setDrawColor(174, 214, 241);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);

  y += 5;
  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(93, 109, 126);
  doc.text("WorkMitra © 2026 | This report is generated by the employer and is for internal use only.", margin, y);

  // ── Generate ──
  const filename = `WorkMitra_Attendance_${data.employeeName.replace(/\s+/g, "_")}_${data.startDate}_to_${data.endDate}.pdf`;
  const blob = doc.output("blob");

  return { blob, filename };
}