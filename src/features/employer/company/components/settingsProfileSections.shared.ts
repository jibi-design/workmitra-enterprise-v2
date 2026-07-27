import type { EmployerProfile } from "../storage/employerSettings.storage";
import type { NoticeData } from "../../../../shared/components/NoticeModal";

export interface SettingsSectionProps {
  data: EmployerProfile;
  editMode: boolean;
  onFieldChange: (field: keyof EmployerProfile, value: string | boolean) => void;
  onNotice?: (notice: NoticeData) => void;
  onLogoUploadRequest?: () => void;
}

export const SETTINGS_FOCUS_COLOR = "var(--wm-er-accent-hr)";
export const SETTINGS_BORDER_RESET = "#d1d5db";
