/** Event folder attendance PDF — print-ready A4 sheet. */

import type { EventFolderAttendanceRow, EventFolderCard } from "./eventDayFolders.helpers";

export async function exportEventFolderAttendancePdf(
  folder: EventFolderCard,
  rows: readonly EventFolderAttendanceRow[],
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  let y = 56;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Event attendance", margin, y);
  y += 22;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(folder.eventName, margin, y);
  y += 16;
  doc.setTextColor(80);
  doc.text(`${folder.venueName} · ${folder.dateLabel}`, margin, y);
  y += 16;
  doc.text(`${rows.length} PIN-confirmed entries`, margin, y);
  y += 24;
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text("Name", margin, y);
  doc.text("Check-in", margin + 180, y);
  doc.text("Status", margin + 360, y);
  y += 8;
  doc.setDrawColor(220);
  doc.line(margin, y, 547, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  for (const row of rows) {
    if (y > 760) {
      doc.addPage();
      y = 56;
    }
    const when = new Date(row.entryAt).toLocaleString();
    doc.text(row.staffName.slice(0, 36), margin, y);
    doc.text(when.slice(0, 28), margin + 180, y);
    doc.text(row.status, margin + 360, y);
    y += 16;
  }

  doc.save(`event-attendance-${folder.folderId}.pdf`);
}
