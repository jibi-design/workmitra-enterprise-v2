// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AdminUserActionModal.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\admin\oversight\components\AdminUserActionModal.tsx

import { CenterModal } from "../../../../shared/components/CenterModal";
import type { UserStatus } from "../helpers/adminDataHelpers";

export type AdminUserActionModalState = {
  open: boolean;
  userId: string;
  role: "employer" | "employee";
  userName: string;
  currentStatus: UserStatus;
  targetStatus: UserStatus;
};

type Props = {
  actionModal: AdminUserActionModalState;
  actionReason: string;
  onReasonChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

function actionTitle(status: UserStatus): string {
  if (status === "active") return "Reactivate User?";
  if (status === "suspended") return "Suspend User?";
  return "Block User?";
}

function actionMessage(status: UserStatus, userName: string): string {
  if (status === "active") return `Reactivate ${userName}. They will regain full access.`;
  if (status === "suspended")
    return `Temporarily suspend ${userName}. They can be reactivated later.`;
  return `Permanently block ${userName}. Data will be retained but access removed.`;
}

function actionLabel(status: UserStatus): string {
  if (status === "active") return "Reactivate";
  if (status === "suspended") return "Suspend";
  return "Block";
}

function actionColor(status: UserStatus): string {
  if (status === "active") return "var(--wm-ad-green)";
  if (status === "suspended") return "#d97706";
  return "var(--wm-ad-danger)";
}

export function AdminUserActionModal({
  actionModal,
  actionReason,
  onReasonChange,
  onCancel,
  onConfirm,
}: Props) {
  const reasonRequired = actionModal.targetStatus !== "active";
  const confirmDisabled = reasonRequired && !actionReason.trim();

  return (
    <CenterModal open={actionModal.open} onBackdropClose={onCancel} ariaLabel="User Action">
      <div style={{ padding: 20 }}>
        <div
          style={{ fontSize: 15, fontWeight: 1000, color: actionColor(actionModal.targetStatus) }}
        >
          {actionTitle(actionModal.targetStatus)}
        </div>

        <div
          style={{ fontSize: 13, color: "var(--wm-ad-navy-500)", marginTop: 8, lineHeight: 1.6 }}
        >
          {actionMessage(actionModal.targetStatus, actionModal.userName)}
        </div>

        {reasonRequired && (
          <div style={{ marginTop: 12 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--wm-ad-navy-400)",
                marginBottom: 6,
              }}
            >
              Reason (required)
            </div>

            <textarea
              value={actionReason}
              onChange={(event) => onReasonChange(event.target.value)}
              placeholder="Enter reason for this action..."
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: 13,
                fontWeight: 600,
                border: "1px solid var(--wm-ad-border)",
                borderRadius: 10,
                background: "var(--wm-ad-card-inner)",
                color: "var(--wm-ad-navy)",
                resize: "vertical",
                minHeight: 60,
                outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>
        )}

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
            disabled={confirmDisabled}
            onClick={onConfirm}
            style={{
              fontSize: 13,
              fontWeight: 900,
              padding: "8px 20px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              background: actionColor(actionModal.targetStatus),
              color: "#fff",
              opacity: confirmDisabled ? 0.4 : 1,
            }}
          >
            {actionLabel(actionModal.targetStatus)}
          </button>
        </div>
      </div>
    </CenterModal>
  );
}
