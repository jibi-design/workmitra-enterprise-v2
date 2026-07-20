// App name: Job Mitra
// File name: EmployerShiftAutomationPanel.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\EmployerShiftAutomationPanel.tsx

import type { PostSettings } from "../../shiftJobs/storage/employerShift.storage";
import { SettingsPanel } from "./ShiftDashboardComponents";

type EmployerShiftAutomationPanelProps = {
  open: boolean;
  settings: PostSettings;
  backupCount: number;
  onToggleOpen: () => void;
  onToggleSetting: (key: keyof PostSettings, value: boolean | number) => void;
};

export function EmployerShiftAutomationPanel({
  open,
  settings,
  backupCount,
  onToggleOpen,
  onToggleSetting,
}: EmployerShiftAutomationPanelProps) {
  return (
    <div
      style={{
        marginTop: 16,
        borderRadius: 14,
        border: "1px solid var(--wm-er-border)",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={onToggleOpen}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          background: "var(--wm-er-surface)",
          border: "none",
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 700,
          color: "var(--wm-er-text)",
        }}
      >
        <span>Settings &amp; Automation</span>
        <span style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>{open ? "Hide" : "Show"}</span>
      </button>

      {open && (
        <SettingsPanel settings={settings} backupCount={backupCount} onToggle={onToggleSetting} />
      )}
    </div>
  );
}
