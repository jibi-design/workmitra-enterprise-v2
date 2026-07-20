// App: Job Mitra / WorkMitra_Enterprise_v2
// File: StaffExitActions.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\myStaff\components\staffDetailSections\StaffExitActions.tsx

type ExitActionsProps = {
  onStartExit: () => void;
};

export function ExitActions({ onStartExit }: ExitActionsProps) {
  return (
    <div style={{ padding: "18px 20px 0" }}>
      <div
        style={{
          padding: 14,
          borderRadius: 20,
          background:
            "radial-gradient(circle at 100% 0%, rgba(220,38,38,0.065), transparent 34%), linear-gradient(135deg, rgba(255,255,255,1), rgba(248,250,252,0.98))",
          border: "1px solid rgba(220,38,38,0.13)",
          boxShadow: "0 12px 26px rgba(15,23,42,0.055)",
        }}
      >
        <div
          style={{ fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.5, fontWeight: 760 }}
        >
          Use this only for employer-initiated employment closure such as termination, layoff,
          contract end, mutual agreement, or if the employee left without completing the in-app
          resignation flow.
        </div>

        <button
          type="button"
          onClick={onStartExit}
          style={{
            width: "100%",
            marginTop: 11,
            padding: "13px 18px",
            borderRadius: 15,
            border: "1.5px solid rgba(220,38,38,0.28)",
            background: "rgba(220,38,38,0.055)",
            color: "#dc2626",
            fontWeight: 950,
            fontSize: 13.5,
            cursor: "pointer",
          }}
        >
          End Employment
        </button>
      </div>
    </div>
  );
}
