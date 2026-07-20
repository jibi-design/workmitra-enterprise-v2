// App: Job Mitra / WorkMitra_Enterprise_v2
// File: FirstVisitGuide.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\hrPageSections\FirstVisitGuide.tsx

type Props = {
  onDismiss: () => void;
};

export function FirstVisitGuide({ onDismiss }: Props) {
  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: 10,
        border: "1px solid rgba(124, 58, 237, 0.15)",
        background: "rgba(124, 58, 237, 0.03)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 900, fontSize: 12, color: "var(--wm-er-accent-hr, #7c3aed)" }}>
          New to Staff Lifecycle?
        </div>

        <div style={{ fontSize: 11, color: "var(--wm-er-muted, #64748b)", marginTop: 2 }}>
          Manage your team from hiring to exit – all in one place.
        </div>
      </div>

      <button
        className="wm-primarybtn"
        type="button"
        onClick={onDismiss}
        style={{ fontSize: 11, padding: "5px 14px", flexShrink: 0 }}
      >
        Got it
      </button>
    </div>
  );
}
