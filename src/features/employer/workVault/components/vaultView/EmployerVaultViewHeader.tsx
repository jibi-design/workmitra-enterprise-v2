// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerVaultViewHeader.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workVault\components\vaultView\EmployerVaultViewHeader.tsx

type Props = {
  isActive: boolean;
  onBack: () => void;
};

function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2Z" />
    </svg>
  );
}

export function EmployerVaultViewHeader({ isActive, onBack }: Props) {
  return (
    <div className="wm-pageHead">
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: "1px solid var(--wm-er-divider, rgba(15, 23, 42, 0.08))",
            background: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--wm-er-text)",
            flexShrink: 0,
          }}
          aria-label="Back"
        >
          <IconBack />
        </button>

        <div>
          <div className="wm-pageTitle">Employee Profile</div>

          <div className="wm-pageSub">
            {isActive ? "Full access · session active" : "OTP verification required to unlock"}
          </div>
        </div>
      </div>
    </div>
  );
}
