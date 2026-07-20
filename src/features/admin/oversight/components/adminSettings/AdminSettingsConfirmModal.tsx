// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AdminSettingsConfirmModal.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\admin\oversight\components\adminSettings\AdminSettingsConfirmModal.tsx

import { CenterModal } from "../../../../../shared/components/CenterModal";

type ConfirmModalData = {
  open: boolean;
  title: string;
  body: string;
  action: () => void;
};

type Props = {
  confirmModal: ConfirmModalData;
  onCancel: () => void;
  onConfirm: () => void;
};

export function AdminSettingsConfirmModal({ confirmModal, onCancel, onConfirm }: Props) {
  return (
    <CenterModal open={confirmModal.open} onBackdropClose={onCancel} ariaLabel="Confirm Action">
      <div style={{ padding: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 1000, color: "var(--wm-ad-danger)" }}>
          {confirmModal.title}
        </div>

        <div
          style={{ fontSize: 13, color: "var(--wm-ad-navy-500)", marginTop: 8, lineHeight: 1.6 }}
        >
          {confirmModal.body}
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
              border: "1px solid var(--wm-ad-border)",
              background: "var(--wm-ad-white)",
              color: "var(--wm-ad-navy)",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            style={{
              fontSize: 13,
              fontWeight: 900,
              padding: "8px 20px",
              borderRadius: 10,
              border: "none",
              background: "var(--wm-ad-danger)",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </CenterModal>
  );
}
