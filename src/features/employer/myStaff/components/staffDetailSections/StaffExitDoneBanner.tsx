// App: Job Mitra / WorkMitra_Enterprise_v2
// File: StaffExitDoneBanner.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\myStaff\components\staffDetailSections\StaffExitDoneBanner.tsx

import { IconCheckCircle } from "../staffDetailComponents";

export function ExitDoneBanner() {
  return (
    <div style={{ padding: "12px 20px 0" }}>
      <div
        style={{
          background: "rgba(22,163,74,0.08)",
          border: "1px solid rgba(22,163,74,0.2)",
          borderRadius: "var(--wm-radius-button)",
          padding: 14,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <IconCheckCircle />
        <span style={{ fontWeight: 900, fontSize: 13, color: "#16a34a" }}>
          Exit processed successfully. Work history updated.
        </span>
      </div>
    </div>
  );
}
