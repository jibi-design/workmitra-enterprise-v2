// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeSettingsNoticeDialog.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\settings\components\EmployeeSettingsNoticeDialog.tsx

import { NoticeModal } from "../../../../shared/components/NoticeModal";

export type EmployeeSettingsNoticeTone = "info" | "warn";

export type EmployeeSettingsNotice = {
  title: string;
  message: string;
  tone: EmployeeSettingsNoticeTone;
} | null;

type Props = {
  notice: EmployeeSettingsNotice;
  onClose: () => void;
};

export function EmployeeSettingsNoticeDialog({ notice, onClose }: Props) {
  return <NoticeModal notice={notice} onClose={onClose} />;
}
