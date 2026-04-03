// src/features/employer/shiftJobs/components/ShiftCreateFormHeader.tsx
//
// Header section for EmployerShiftCreatePage.
// Page title, template banner, group preview, anti-fraud notice.

import { AntiFraudNotice } from "../../../../shared/employerProfile/AntiFraudNotice";

type Props = {
  isTemplate: boolean;
  groupPreview: string;
};

export function ShiftCreateFormHeader({ isTemplate, groupPreview }: Props) {
  return (
    <>
      {/* Header */}
      <div className="wm-pageHead">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(22,163,74,0.08)", color: "#16a34a",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7Zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.58 8 8-3.59 8-8 8Z" />
            </svg>
          </div>
          <div>
            <div className="wm-pageTitle">{isTemplate ? "New shift from template" : "Create new shift"}</div>
            <div className="wm-pageSub">
              {isTemplate ? "Pre-filled from your template. Update as needed." : "Fill in the details. Workers will see this and apply."}
            </div>
          </div>
        </div>
      </div>

      {/* Template banner */}
      {isTemplate && (
        <div style={{
          marginTop: 10, padding: "8px 14px", borderRadius: 10,
          background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.2)",
          fontSize: 12, color: "var(--wm-er-accent-shift, #16a34a)", fontWeight: 600,
        }}>
          Template pre-filled — review and update the dates before creating.
        </div>
      )}

      {/* Anti-fraud notice */}
      <AntiFraudNotice />

      {/* Group preview */}
      <div style={{
        marginTop: 12, padding: "12px 14px", borderRadius: "var(--wm-radius-14)",
        border: "1px solid rgba(22,163,74,0.2)", background: "rgba(22,163,74,0.04)",
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--wm-er-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
          Group name preview
        </div>
        <div style={{ marginTop: 4, fontSize: 14, fontWeight: 700, color: "#16a34a" }}>{groupPreview}</div>
        <div style={{ marginTop: 4, fontSize: 11, color: "var(--wm-er-muted)" }}>
          Workers will see this name when assigned to a group.
        </div>
      </div>
    </>
  );
}