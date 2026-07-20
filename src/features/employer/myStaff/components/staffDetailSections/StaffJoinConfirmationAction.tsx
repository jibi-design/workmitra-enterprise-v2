// App: Job Mitra / WorkMitra_Enterprise_v2
// File: StaffJoinConfirmationAction.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\myStaff\components\staffDetailSections\StaffJoinConfirmationAction.tsx

type StaffJoinConfirmationActionProps = {
  employeeName: string;
  onConfirmJoined: () => void;
};

export function StaffJoinConfirmationAction({
  employeeName,
  onConfirmJoined,
}: StaffJoinConfirmationActionProps) {
  return (
    <div style={{ padding: "20px 20px 0" }}>
      <div
        style={{
          padding: "12px 13px",
          borderRadius: 16,
          background: "rgba(29,78,216,0.055)",
          border: "1px solid rgba(29,78,216,0.12)",
          color: "#1e3a8a",
          fontSize: 12,
          fontWeight: 800,
          lineHeight: 1.5,
          marginBottom: 10,
        }}
      >
        Confirm only after {employeeName || "this employee"} has actually joined work. This keeps
        the Career Jobs employment record accurate.
      </div>

      <button
        type="button"
        onClick={onConfirmJoined}
        style={{
          width: "100%",
          padding: "14px 20px",
          borderRadius: 14,
          border: "1px solid rgba(22,163,74,0.28)",
          background: "linear-gradient(135deg, #15803d, #16a34a)",
          color: "#ffffff",
          fontWeight: 950,
          fontSize: 14,
          cursor: "pointer",
          boxShadow: "0 14px 28px rgba(22,163,74,0.18)",
        }}
      >
        Confirm Joined
      </button>
    </div>
  );
}
