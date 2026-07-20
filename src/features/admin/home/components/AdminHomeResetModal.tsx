// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AdminHomeResetModal.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\admin\home\components\AdminHomeResetModal.tsx

import { CenterModal } from "../../../../shared/components/CenterModal";

type Props = {
  open: boolean;
  onCancel: () => void;
  onReset: () => void;
};

export function AdminHomeResetModal({ open, onCancel, onReset }: Props) {
  return (
    <CenterModal open={open} onBackdropClose={onCancel} ariaLabel="Reset Demo Data">
      <div style={{ padding: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 1000, color: "#dc2626" }}>Reset All Demo Data?</div>

        <div style={{ fontSize: 13, color: "#6b7280", marginTop: 8, lineHeight: 1.6 }}>
          This will clear ALL localStorage data — posts, applications, workspaces, notifications,
          activity logs. This cannot be undone.
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              fontSize: 13,
              fontWeight: 800,
              padding: "8px 16px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              background: "#fff",
              color: "#111827",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onReset}
            style={{
              fontSize: 13,
              fontWeight: 900,
              padding: "8px 20px",
              borderRadius: 10,
              border: "none",
              background: "#dc2626",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Reset Everything
          </button>
        </div>
      </div>
    </CenterModal>
  );
}
