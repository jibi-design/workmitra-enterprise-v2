// App name: Job Mitra
// Direct invite card on shift post — opens safety modals (no single-tap accept).

type Props = {
  companyName: string;
  jobName: string;
  shiftDateLabel: string;
  onDecline: () => void;
  onAccept: () => void;
};

export function ShiftDirectInviteAcceptCard({
  companyName,
  jobName,
  shiftDateLabel,
  onDecline,
  onAccept,
}: Props) {
  return (
    <section
      data-testid="shift-direct-invite-accept-card"
      style={{
        marginBottom: 14,
        padding: "14px 16px",
        borderRadius: "var(--wm-radius-button)",
        border: "1px solid rgba(16,185,129,0.28)",
        background: "rgba(236,253,245,0.65)",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 800, color: "#065f46" }}>Direct Shift Invite!</div>
      <div style={{ marginTop: 6, fontSize: 12, color: "#047857", lineHeight: 1.5 }}>
        <strong>{companyName}</strong> has invited you for <strong>{jobName}</strong> on{" "}
        <strong>{shiftDateLabel}</strong>.
      </div>
      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button
          type="button"
          data-testid="shift-direct-invite-decline-btn"
          onClick={onDecline}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: "var(--wm-radius-10)",
            border: "1px solid rgba(148,163,184,0.35)",
            background: "rgba(248,250,252,0.95)",
            color: "#475569",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Decline
        </button>
        <button
          type="button"
          data-testid="shift-direct-invite-accept-btn"
          onClick={onAccept}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: "var(--wm-radius-10)",
            border: "none",
            background: "#059669",
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 0 0 3px rgba(16,185,129,0.22), 0 8px 18px rgba(5,150,105,0.18)",
          }}
        >
          Accept
        </button>
      </div>
    </section>
  );
}
