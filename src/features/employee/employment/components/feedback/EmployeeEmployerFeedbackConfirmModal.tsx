// App name: Job Mitra
// File name: EmployeeEmployerFeedbackConfirmModal.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\employment\components\feedback\EmployeeEmployerFeedbackConfirmModal.tsx

import { CenterModal } from "../../../../../shared/components/CenterModal";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const CAREER = "var(--wm-er-accent-career, #1d4ed8)";
const TEXT = "var(--wm-er-text, #1e293b)";
const MUTED = "var(--wm-er-muted, #64748b)";
const WARNING = "#92400e";

export function EmployeeEmployerFeedbackConfirmModal({ open, onClose, onConfirm }: Props) {
  return (
    <CenterModal
      open={open}
      onBackdropClose={onClose}
      ariaLabel="Final employer feedback confirmation"
      maxWidth={390}
    >
      <div
        style={{
          padding: 18,
          borderRadius: 22,
          background:
            "radial-gradient(circle at 95% 0%, rgba(29,78,216,0.12), transparent 32%), linear-gradient(135deg, #ffffff, #f8fafc)",
        }}
      >
        <div
          style={{
            width: "fit-content",
            padding: "4px 9px",
            borderRadius: 999,
            background: "rgba(245,158,11,0.09)",
            border: "1px solid rgba(245,158,11,0.18)",
            color: WARNING,
            fontSize: 9.8,
            fontWeight: 950,
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          Sensitive trust action
        </div>

        <div style={{ marginTop: 9, fontSize: 17, fontWeight: 950, color: TEXT, lineHeight: 1.2 }}>
          Final Feedback Confirmation
        </div>

        <div
          style={{ marginTop: 6, fontSize: 12.2, color: MUTED, lineHeight: 1.5, fontWeight: 700 }}
        >
          This feedback is linked to your closed Career employment record.
        </div>

        <div
          style={{
            marginTop: 12,
            padding: "12px 13px",
            borderRadius: 15,
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.22)",
            color: WARNING,
            fontSize: 12.2,
            fontWeight: 850,
            lineHeight: 1.55,
          }}
        >
          Submit only fair and truthful feedback based on your actual work experience. This can
          affect employer trust in future protected systems.
        </div>

        <div
          style={{
            marginTop: 12,
            display: "grid",
            gap: 8,
          }}
        >
          <TrustPoint
            title="Edit window"
            text="You can edit or undo only within 1 hour after submit."
          />
          <TrustPoint
            title="Locked record"
            text="After 1 hour, this feedback is locked and cannot be deleted here."
          />
          <TrustPoint
            title="Protected visibility"
            text="Raw comments are not public and are not directly shown to the employer now."
          />
        </div>

        <div
          style={{
            marginTop: 12,
            padding: "10px 12px",
            borderRadius: 14,
            background: "rgba(29,78,216,0.055)",
            border: "1px solid rgba(29,78,216,0.12)",
            color: MUTED,
            fontSize: 11.5,
            fontWeight: 750,
            lineHeight: 1.5,
          }}
        >
          Final backend release will add login session checks, re-authentication, audit logs, rate
          limits, abuse flags, and moderation before any public employer reputation is enabled.
        </div>

        <div style={{ marginTop: 15, display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: 9 }}>
          <button type="button" onClick={onClose} style={SECONDARY_BUTTON_STYLE}>
            Review Again
          </button>

          <button type="button" onClick={onConfirm} style={PRIMARY_BUTTON_STYLE}>
            Submit Final Feedback
          </button>
        </div>
      </div>
    </CenterModal>
  );
}

function TrustPoint({ title, text }: { title: string; text: string }) {
  return (
    <div
      style={{
        padding: "9px 10px",
        borderRadius: 13,
        background: "rgba(255,255,255,0.82)",
        border: "1px solid rgba(148,163,184,0.14)",
      }}
    >
      <div style={{ fontSize: 11.4, fontWeight: 950, color: TEXT }}>{title}</div>
      <div
        style={{ marginTop: 2, fontSize: 11.2, fontWeight: 700, color: MUTED, lineHeight: 1.42 }}
      >
        {text}
      </div>
    </div>
  );
}

const SECONDARY_BUTTON_STYLE: React.CSSProperties = {
  padding: "11px 12px",
  borderRadius: 12,
  border: "1px solid rgba(148,163,184,0.24)",
  background: "rgba(255,255,255,0.94)",
  color: TEXT,
  fontSize: 12,
  fontWeight: 900,
  cursor: "pointer",
};

const PRIMARY_BUTTON_STYLE: React.CSSProperties = {
  padding: "11px 12px",
  borderRadius: 12,
  border: "none",
  background: CAREER,
  color: "#fff",
  fontSize: 12,
  fontWeight: 950,
  cursor: "pointer",
  boxShadow: "0 12px 22px rgba(29,78,216,0.2)",
};
