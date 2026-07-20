// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeSettingsConfirmDialog.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\settings\components\EmployeeSettingsConfirmDialog.tsx

export type EmployeeSettingsConfirmState = {
  title: string;
  message: string;
  confirmText?: string;
  danger?: boolean;
  onConfirm: () => void;
} | null;

type Props = {
  confirm: EmployeeSettingsConfirmState;
  onCancel: () => void;
  onConfirm: () => void;
};

export function EmployeeSettingsConfirmDialog({ confirm, onCancel, onConfirm }: Props) {
  if (!confirm) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Confirmation"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 61,
      }}
      onClick={onCancel}
    >
      <div
        className="wm-ee-card"
        style={{ width: "100%", maxWidth: 520, margin: 0 }}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ fontWeight: 800, fontSize: 14, color: "var(--wm-er-text)" }}>
          {confirm.title}
        </div>
        <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-er-muted)" }}>
          {confirm.message}
        </div>

        <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button className="wm-outlineBtn" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button
            className={confirm.danger ? "wm-dangerBtn" : "wm-primarybtn"}
            type="button"
            onClick={onConfirm}
          >
            {confirm.confirmText ?? "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
