// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeSettingsConfirmDialog.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\settings\components\EmployeeSettingsConfirmDialog.tsx

import { ConfirmModal } from "../../../../shared/components/ConfirmModal";

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
    <ConfirmModal
      confirm={{
        title: confirm.title,
        message: confirm.message,
        tone: confirm.danger ? "danger" : "neutral",
        confirmLabel: confirm.confirmText ?? "Confirm",
      }}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
