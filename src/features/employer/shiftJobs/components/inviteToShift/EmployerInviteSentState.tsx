// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerInviteSentState.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\inviteToShift\EmployerInviteSentState.tsx

type Props = {
  workerName: string;
  onClose: () => void;
};

export function EmployerInviteSentState({ workerName, onClose }: Props) {
  return (
    <div style={{ textAlign: "center", padding: "12px 0" }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#16a34a", marginBottom: 6 }}>
        Invitation Sent
      </div>

      <div style={{ fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
        {workerName} has been notified about the shift.
      </div>

      <button
        type="button"
        onClick={onClose}
        style={{
          marginTop: 16,
          padding: "9px 24px",
          borderRadius: "var(--wm-radius-10)",
          border: "none",
          background: "var(--wm-er-accent-shift, #16a34a)",
          color: "#fff",
          fontWeight: 600,
          fontSize: 13,
          cursor: "pointer",
        }}
      >
        Done
      </button>
    </div>
  );
}
