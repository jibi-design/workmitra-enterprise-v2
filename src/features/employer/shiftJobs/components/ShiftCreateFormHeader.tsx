// App: Job Mitra / WorkMitra_Enterprise_v2
// File: ShiftCreateFormHeader.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\ShiftCreateFormHeader.tsx

import type { CSSProperties } from "react";

type Props = {
  isTemplate: boolean;
  groupPreview: string;
  employerJmId?: string;
};

const SHIFT_GREEN = "#16a34a";

const HERO_STYLE: CSSProperties = {
  marginTop: 2,
  padding: "16px 16px",
  borderRadius: 22,
  border: "1px solid rgba(22,163,74,0.16)",
  background:
    "linear-gradient(135deg, rgba(22,163,74,0.13), rgba(255,255,255,0.98) 48%, rgba(240,253,244,0.86))",
  boxShadow: "0 18px 40px rgba(15,23,42,0.07)",
};

const HERO_TOP_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const ICON_STYLE: CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: 16,
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(180deg, rgba(22,163,74,0.16), rgba(22,163,74,0.07))",
  color: SHIFT_GREEN,
  boxShadow: "inset 0 0 0 1px rgba(22,163,74,0.14)",
};

const HERO_TEXT_STYLE: CSSProperties = {
  marginTop: 12,
  fontSize: 12,
  lineHeight: 1.55,
  color: "var(--wm-er-muted)",
  maxWidth: 420,
};

const TEMPLATE_STYLE: CSSProperties = {
  marginTop: 12,
  padding: "10px 14px",
  borderRadius: 16,
  background: "linear-gradient(180deg, rgba(240,253,244,0.95), rgba(255,255,255,0.98))",
  border: "1px solid rgba(22,163,74,0.2)",
  fontSize: 12,
  color: SHIFT_GREEN,
  fontWeight: 800,
  boxShadow: "0 10px 24px rgba(15,23,42,0.04)",
};

const TRUST_NOTICE_STYLE: CSSProperties = {
  marginTop: 12,
  padding: "11px 14px",
  borderRadius: 16,
  border: "1px solid rgba(22,163,74,0.18)",
  background: "linear-gradient(135deg, rgba(240,253,244,0.96), rgba(255,255,255,0.98))",
  boxShadow: "0 10px 24px rgba(15,23,42,0.04)",
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
};

const TRUST_ICON_STYLE: CSSProperties = {
  width: 26,
  height: 26,
  borderRadius: 10,
  background: "rgba(22,163,74,0.1)",
  color: SHIFT_GREEN,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const GROUP_PREVIEW_STYLE: CSSProperties = {
  marginTop: 12,
  padding: "14px 16px",
  borderRadius: 18,
  border: "1px solid rgba(22,163,74,0.18)",
  background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.97))",
  boxShadow: "0 10px 24px rgba(15,23,42,0.045)",
};

export function ShiftCreateFormHeader({ isTemplate, groupPreview, employerJmId = "" }: Props) {
  return (
    <>
      <section style={HERO_STYLE}>
        <div style={HERO_TOP_STYLE}>
          <div style={ICON_STYLE}>
            <svg width="23" height="23" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7Zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.58 8 8-3.59 8-8 8Z"
              />
            </svg>
          </div>

          <div style={{ minWidth: 0 }}>
            <div className="wm-pageTitle">
              {isTemplate ? "New shift from template" : "Create new shift"}
            </div>
            <div className="wm-pageSub">
              {isTemplate
                ? "Review the template details before publishing."
                : "Build a clear shift post before workers see it."}
            </div>
          </div>
        </div>

        <div style={HERO_TEXT_STYLE}>
          Add the role, worker count, schedule, pay, location, and requirements. You will review the
          post before it goes live.
        </div>
      </section>

      {isTemplate && (
        <div style={TEMPLATE_STYLE}>
          Template pre-filled. Review the date, pay, worker count, and requirements before
          publishing.
        </div>
      )}

      {employerJmId.trim().length > 0 && (
        <div style={TRUST_NOTICE_STYLE}>
          <div style={TRUST_ICON_STYLE}>
            <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 2 4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5l-8-3Zm0 2.18 6 2.25V11c0 4.39-2.75 8.45-6 9.84C8.75 19.45 6 15.39 6 11V6.43l6-2.25Zm-1 11.23 6-6L15.59 8 11 12.59 8.91 10.5 7.5 11.91 11 15.41Z"
              />
            </svg>
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, color: "var(--wm-er-muted)", lineHeight: 1.45 }}>
              Your Job Mitra ID will be visible to applicants.
            </div>
            <div
              style={{
                marginTop: 2,
                fontSize: 12,
                fontWeight: 950,
                color: "var(--wm-er-text)",
                letterSpacing: 0.2,
                wordBreak: "break-word",
              }}
            >
              {employerJmId}
            </div>
          </div>
        </div>
      )}

      <div style={GROUP_PREVIEW_STYLE}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 900,
            color: "var(--wm-er-muted)",
            textTransform: "uppercase",
            letterSpacing: 0.6,
          }}
        >
          Group name preview
        </div>

        <div
          style={{
            marginTop: 5,
            fontSize: 15,
            fontWeight: 950,
            color: SHIFT_GREEN,
            lineHeight: 1.35,
          }}
        >
          {groupPreview}
        </div>

        <div style={{ marginTop: 5, fontSize: 11, color: "var(--wm-er-muted)", lineHeight: 1.45 }}>
          This name is used later if confirmed workers are assigned to a shift group.
        </div>
      </div>
    </>
  );
}
