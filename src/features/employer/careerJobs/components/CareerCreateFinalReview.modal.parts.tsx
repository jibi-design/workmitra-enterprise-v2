import { CARD_STYLE, MODAL_OVERLAY_STYLE, MODAL_STYLE } from "./CareerCreateFinalReview.styles";

type PublishModalProps = {
  onClose: () => void;
  onPublish: () => void;
};

export function CareerCreatePublishModal({ onClose, onPublish }: PublishModalProps) {
  return (
    <div style={MODAL_OVERLAY_STYLE}>
      <div style={MODAL_STYLE}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 950,
            color: "var(--wm-er-accent-career)",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginBottom: 4,
          }}
        >
          Final Approval Required
        </div>
        <div style={{ fontSize: 18, fontWeight: 900, color: "var(--wm-er-text)", marginBottom: 8 }}>
          Publish this Career Job?
        </div>
        <div
          style={{
            fontSize: 13,
            color: "var(--wm-er-muted)",
            lineHeight: 1.5,
            marginBottom: 20,
          }}
        >
          Please review all information carefully. Once published, the job post will be live and
          open for applications.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "var(--wm-radius-chip)",
              fontSize: 12.5,
              fontWeight: 800,
              background: "#fff",
              border: "1px solid #e2e8f0",
              cursor: "pointer",
              color: "var(--wm-er-text)",
            }}
          >
            Review Again
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onPublish();
            }}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "var(--wm-radius-chip)",
              fontSize: 12.5,
              fontWeight: 900,
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(37,99,235,0.16)",
            }}
          >
            Publish Job
          </button>
        </div>
      </div>
    </div>
  );
}

export function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(0,0,0,0.05)",
        paddingBottom: 8,
      }}
    >
      <div style={{ fontSize: 12, color: "var(--wm-er-muted)", fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 800, textAlign: "right" }}>{value}</div>
    </div>
  );
}

export { CARD_STYLE };
