// src/features/employer/hrManagement/components/LetterPreviewCard.tsx
//
// Shared read-only preview card for any HR letter.
// Renders letter content based on kind.

import type { LetterRecord } from "../types/letterTemplates.types";
import { LETTER_KIND_LABELS } from "../types/letterTemplates.types";

type Props = {
  letter: LetterRecord;
  mode: "employer" | "employee";
  onAcknowledge?: () => void;
};

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const statusColors: Record<string, { color: string; bg: string }> = {
  draft: { color: "#64748b", bg: "rgba(100, 116, 139, 0.08)" },
  sent: { color: "#7c3aed", bg: "rgba(124, 58, 237, 0.08)" },
  acknowledged: { color: "#16a34a", bg: "rgba(22, 163, 74, 0.08)" },
  disputed: { color: "#dc2626", bg: "rgba(220, 38, 38, 0.08)" },
};

function renderLetterContent(letter: LetterRecord): React.ReactNode {
  const ld = letter.letterData;
  const lineStyle: React.CSSProperties = { fontSize: 13, color: "var(--wm-er-text)", lineHeight: 1.8 };

  if (ld.kind === "appointment") {
    const d = ld.data;
    return (
      <div style={lineStyle}>
        <div><strong>To:</strong> {d.employeeName}</div>
        <div><strong>Position:</strong> {d.jobTitle}</div>
        {d.department && <div><strong>Department:</strong> {d.department}</div>}
        {d.location && <div><strong>Location:</strong> {d.location}</div>}
        <div style={{ marginTop: 8 }}><strong>Joining Date:</strong> {formatDate(d.joiningDate)}</div>
        <div><strong>Salary:</strong> {d.salary} ({d.salaryFrequency})</div>
        <div><strong>Work Schedule:</strong> {d.workSchedule || "—"}</div>
        {d.reportingTo && <div><strong>Reporting To:</strong> {d.reportingTo}</div>}
        {d.additionalTerms && (
          <div style={{ marginTop: 8 }}>
            <strong>Terms:</strong>
            <div style={{ marginTop: 4, whiteSpace: "pre-wrap" }}>{d.additionalTerms}</div>
          </div>
        )}
      </div>
    );
  }

  if (ld.kind === "warning") {
    const d = ld.data;
    const typeLabel = d.warningType === "verbal" ? "Verbal Warning" : d.warningType === "written" ? "Written Warning" : "Final Warning";
    return (
      <div style={lineStyle}>
        <div><strong>To:</strong> {d.employeeName}</div>
        <div><strong>Position:</strong> {d.jobTitle}</div>
        <div><strong>Warning Type:</strong> {typeLabel}</div>
        <div><strong>Incident Date:</strong> {formatDate(d.incidentDate)}</div>
        <div style={{ marginTop: 8 }}><strong>Reason:</strong> {d.reason}</div>
        <div><strong>Expected Improvement:</strong> {d.expectedImprovement}</div>
        <div><strong>Consequence:</strong> {d.consequenceIfRepeated}</div>
      </div>
    );
  }

  if (ld.kind === "appreciation") {
    const d = ld.data;
    return (
      <div style={lineStyle}>
        <div><strong>To:</strong> {d.employeeName}</div>
        <div><strong>Position:</strong> {d.jobTitle}</div>
        <div style={{ marginTop: 8 }}><strong>Reason:</strong> {d.reason}</div>
        <div><strong>Achievement:</strong> {d.achievement}</div>
        {d.additionalNote && <div><strong>Note:</strong> {d.additionalNote}</div>}
      </div>
    );
  }

  if (ld.kind === "salary_slip") {
    const d = ld.data;
    return (
      <div style={lineStyle}>
        <div><strong>Employee:</strong> {d.employeeName}</div>
        <div><strong>Position:</strong> {d.jobTitle}</div>
        <div><strong>Period:</strong> {d.month} {d.year}</div>
        <div style={{ marginTop: 8 }}><strong>Base Salary:</strong> {d.baseSalary}</div>
        <div><strong>Allowances:</strong> {d.allowances}</div>
        <div><strong>Deductions:</strong> {d.deductions}</div>
        <div style={{ marginTop: 4, fontWeight: 900 }}><strong>Net Pay:</strong> {d.netPay}</div>
        <div><strong>Payment Date:</strong> {formatDate(d.paymentDate)}</div>
        <div><strong>Payment Method:</strong> {d.paymentMethod}</div>
      </div>
    );
  }

  if (ld.kind === "promotion") {
    const d = ld.data;
    return (
      <div style={lineStyle}>
        <div><strong>To:</strong> {d.employeeName}</div>
        <div><strong>Previous Title:</strong> {d.previousTitle}</div>
        <div><strong>New Title:</strong> {d.newTitle}</div>
        {d.newDepartment && <div><strong>New Department:</strong> {d.newDepartment}</div>}
        <div><strong>Effective Date:</strong> {formatDate(d.effectiveDate)}</div>
        {d.newSalary && <div><strong>New Salary:</strong> {d.newSalary}</div>}
        <div><strong>Reason:</strong> {d.reason}</div>
      </div>
    );
  }

  if (ld.kind === "transfer") {
    const d = ld.data;
    return (
      <div style={lineStyle}>
        <div><strong>To:</strong> {d.employeeName}</div>
        <div><strong>Position:</strong> {d.jobTitle}</div>
        <div><strong>From:</strong> {d.fromLocation} ({d.fromDepartment})</div>
        <div><strong>To:</strong> {d.toLocation} ({d.toDepartment})</div>
        <div><strong>Effective Date:</strong> {formatDate(d.effectiveDate)}</div>
        <div><strong>Reason:</strong> {d.reason}</div>
      </div>
    );
  }

  if (ld.kind === "experience") {
    const d = ld.data;
    return (
      <div style={lineStyle}>
        <div><strong>Employee:</strong> {d.employeeName}</div>
        <div><strong>Position:</strong> {d.jobTitle}</div>
        <div><strong>Department:</strong> {d.department}</div>
        <div><strong>Period:</strong> {formatDate(d.joiningDate)} — {formatDate(d.exitDate)}</div>
        <div style={{ marginTop: 8 }}><strong>Duties:</strong> {d.duties}</div>
        <div><strong>Performance:</strong> {d.performance}</div>
      </div>
    );
  }

  return null;
}

export function LetterPreviewCard({ letter, mode, onAcknowledge }: Props) {
  const sc = statusColors[letter.status] ?? statusColors.sent;
  const showAcknowledge = mode === "employee" && letter.status === "sent" && onAcknowledge;

  return (
    <div style={{ padding: 16, background: "#fff", borderRadius: 12, border: "1px solid var(--wm-er-border, #e5e7eb)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: "var(--wm-er-text)" }}>
          {LETTER_KIND_LABELS[letter.kind]}
        </div>
        <span style={{ fontSize: 10, fontWeight: 900, padding: "2px 8px", borderRadius: 999, background: sc.bg, color: sc.color, border: `1px solid ${sc.color}22` }}>
          {letter.status.charAt(0).toUpperCase() + letter.status.slice(1)}
        </span>
      </div>

      {renderLetterContent(letter)}

      <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(0,0,0,0.04)", fontSize: 10, color: "var(--wm-er-muted)", display: "flex", flexDirection: "column", gap: 2 }}>
        {letter.sentAt && <div>Sent: {formatDate(letter.sentAt)}</div>}
        {letter.acknowledgedAt && <div>Acknowledged: {formatDate(letter.acknowledgedAt)}</div>}
        {letter.disputedAt && <div style={{ color: "#dc2626" }}>Disputed: {formatDate(letter.disputedAt)} — {letter.disputeReason}</div>}
      </div>

      {showAcknowledge && (
        <div style={{ marginTop: 12 }}>
          <button className="wm-primarybtn" type="button" onClick={onAcknowledge} style={{ fontSize: 12, background: "#16a34a" }}>
            Acknowledge Letter
          </button>
        </div>
      )}
    </div>
  );
}
