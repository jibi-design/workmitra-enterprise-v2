// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerWorkforceStaffRemoveSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\EmployerWorkforceStaffRemoveSection.tsx

import type { WorkforceStaff } from "../../../../shared/domains/workforce/types/workforceTypes";
import { IconDelete } from "../../../../shared/domains/workforce/ui/workforceIcons";

type Props = {
  staff: WorkforceStaff;
  confirmRemove: boolean;
  onRequestRemove: () => void;
  onConfirmRemove: () => void;
  onCancelRemove: () => void;
};

const dangerBtnStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: "var(--wm-radius-10)",
  border: "1px solid var(--wm-error)",
  background: "rgba(220, 38, 38, 0.06)",
  color: "var(--wm-error)",
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
};

export function EmployerWorkforceStaffRemoveSection({
  staff,
  confirmRemove,
  onRequestRemove,
  onConfirmRemove,
  onCancelRemove,
}: Props) {
  return (
    <div style={{ marginTop: 14, marginBottom: 24 }}>
      {!confirmRemove ? (
        <button type="button" style={dangerBtnStyle} onClick={onRequestRemove}>
          <IconDelete /> Remove Staff Member
        </button>
      ) : (
        <div className="wm-er-card" style={{ border: "1px solid var(--wm-error)" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--wm-error)" }}>
            Confirm Removal
          </div>

          <div style={{ fontSize: 13, color: "var(--wm-er-text)", marginTop: 6, lineHeight: 1.5 }}>
            Are you sure you want to remove <strong>{staff.employeeName}</strong> from your staff
            directory? They will lose access to your announcements and groups.
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <button
              className="wm-primarybtn"
              type="button"
              onClick={onConfirmRemove}
              style={{ background: "var(--wm-error)", fontSize: 12, padding: "8px 16px" }}
            >
              Yes, Remove
            </button>

            <button
              type="button"
              onClick={onCancelRemove}
              style={{
                background: "none",
                border: "1px solid var(--wm-er-border)",
                borderRadius: "var(--wm-radius-10)",
                cursor: "pointer",
                fontSize: 12,
                padding: "8px 16px",
                color: "var(--wm-er-text)",
                fontWeight: 700,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
