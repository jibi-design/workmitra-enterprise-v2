// src/shared/employerProfile/AntiFraudNotice.tsx
//
// Anti-fraud notice for job creation pages.
// Shows employer WM ID visibility warning.

import { employerSettingsStorage } from "../../features/employer/company/storage/employerSettings.storage";

export function AntiFraudNotice() {
  const wmId = employerSettingsStorage.get().uniqueId;
  if (!wmId) return null;

  return (
    <div style={{
      marginTop: 12, padding: "10px 14px", borderRadius: 10,
      background: "rgba(100,116,139,0.06)", border: "1px solid rgba(100,116,139,0.15)",
      display: "flex", alignItems: "center", gap: 10,
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
        <path fill="#64748b" d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3Zm-1 15h2v2h-2v-2Zm0-8h2v6h-2V9Z" />
      </svg>
      <div style={{ fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
        Your WorkMitra ID <span style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--wm-er-text)", letterSpacing: 0.3 }}>{wmId}</span> will be visible to all applicants.
      </div>
    </div>
  );
}