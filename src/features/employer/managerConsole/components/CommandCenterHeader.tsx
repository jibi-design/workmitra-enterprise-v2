// App: Job Mitra / WorkMitra_Enterprise_v2
// File: CommandCenterHeader.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\managerConsole\components\CommandCenterHeader.tsx

import type { CSSProperties } from "react";
import { Activity } from "lucide-react";

const ICON_BOX: CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 10,
  background: "var(--wm-er-accent-console-light)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--wm-er-accent-console)",
  flexShrink: 0,
};

export function CommandCenterHeader() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
      <div style={ICON_BOX}>
        <Activity size={20} />
      </div>

      <div>
        <div style={{ fontWeight: 900, fontSize: 17, color: "var(--wm-er-text)" }}>
          Command Center
        </div>

        <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 2 }}>
          Today's summary, alerts, and site assignments
        </div>
      </div>
    </div>
  );
}
