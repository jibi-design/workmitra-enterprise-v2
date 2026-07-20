// App name: Job Mitra
// File name: SettingsPanel.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\dashboard\SettingsPanel.tsx

import { useState } from "react";
import type { PostSettings } from "../../storage/employerShift.storage";
import { Toggle } from "./DashboardToggle";

type SettingsPanelProps = {
  settings: PostSettings;
  backupCount: number;
  onToggle: (key: keyof PostSettings, value: boolean | number) => void;
};

export function SettingsPanel({ settings, backupCount, onToggle }: SettingsPanelProps) {
  const backupSlots = settings.backupSlots ?? 2;
  const [slotsPop, setSlotsPop] = useState(false);

  function handleSlotsAnimationEnd() {
    setSlotsPop(false);
  }

  return (
    <div style={{ padding: "0 16px 16px", background: "var(--wm-er-surface)" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 0",
          borderBottom: "1px solid var(--wm-er-divider)",
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)" }}>
            Backup Slots
          </div>

          <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
            How many backup candidates to keep ({backupCount} currently in backup)
          </div>
        </div>

        <input
          type="number"
          className={slotsPop ? "wm-popSaved" : undefined}
          min={0}
          max={20}
          value={backupSlots === 0 ? "" : backupSlots}
          placeholder="0"
          onFocus={(event) => {
            if (event.target.value === "0") event.target.value = "";
          }}
          onChange={(event) => {
            const value =
              event.target.value === "" ? 0 : Math.max(0, Math.min(20, Number(event.target.value)));

            onToggle("backupSlots", value);
            setSlotsPop(true);
          }}
          onAnimationEnd={handleSlotsAnimationEnd}
          style={{
            width: 52,
            textAlign: "center",
            fontSize: 14,
            fontWeight: 700,
            padding: "5px 8px",
            borderRadius: 8,
            border: "1.5px solid var(--wm-er-border)",
            background: "var(--wm-er-bg)",
            color: "var(--wm-er-text)",
          }}
        />
      </div>

      <ManualBackupReviewCard />

      <Toggle
        label="Backup slot notice"
        sub="When a confirmed slot is released, backup candidates may receive a local notice. Employer still confirms manually."
        value={settings.notifyBackup}
        onChange={(value) => onToggle("notifyBackup", value)}
      />
    </div>
  );
}

function ManualBackupReviewCard() {
  return (
    <div
      style={{
        padding: "12px 0",
        borderBottom: "1px solid var(--wm-er-divider)",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)" }}>
        Manual backup review
      </div>

      <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2, lineHeight: 1.5 }}>
        Backup candidates are never auto-confirmed. If a confirmed worker is replaced, review the
        Backup tab and confirm one worker manually.
      </div>

      <div
        style={{
          marginTop: 8,
          padding: "8px 10px",
          borderRadius: 12,
          background: "rgba(255,251,235,0.82)",
          border: "1px solid rgba(217,119,6,0.16)",
          color: "#92400e",
          fontSize: 11,
          fontWeight: 800,
          lineHeight: 1.45,
        }}
      >
        This protects employers from accidental overbooking and protects workers from being
        confirmed without employer approval.
      </div>
    </div>
  );
}
