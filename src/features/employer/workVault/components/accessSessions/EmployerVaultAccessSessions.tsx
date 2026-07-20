// App name: Job Mitra
// File name: EmployerVaultAccessSessions.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workVault\components\accessSessions\EmployerVaultAccessSessions.tsx

import { useEffect, useState } from "react";
import {
  getAccessLogSorted,
  getActiveSession,
  getSessionRemainingMs,
  revokeSession,
} from "../../../../employee/workVault/services/vaultAccessService";
import type {
  VaultAccessEntry,
  VaultSession,
} from "../../../../employee/workVault/types/vaultTypes";
import { EmployerVaultAccessLogCard } from "./EmployerVaultAccessLogCard";
import { EmployerVaultActiveSessionCard } from "./EmployerVaultActiveSessionCard";

export function EmployerVaultAccessSessions() {
  const [activeSession, setActiveSession] = useState<VaultSession | null>(() => getActiveSession());
  const [accessLog, setAccessLog] = useState<VaultAccessEntry[]>(() => getAccessLogSorted());
  const [, setRefreshTick] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSession(getActiveSession());
      setAccessLog(getAccessLogSorted());
      setRefreshTick(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const remainingText = getRemainingText(activeSession);

  function handleEndSession() {
    if (!activeSession) return;

    revokeSession(activeSession.id);
    setActiveSession(getActiveSession());
    setAccessLog(getAccessLogSorted());
    setRefreshTick(Date.now());
  }

  return (
    <section style={{ display: "grid", gap: 12 }}>
      <div
        style={{
          padding: 14,
          borderRadius: 22,
          border: "1px solid rgba(124,58,237,0.15)",
          background:
            "linear-gradient(135deg, rgba(124,58,237,0.09), rgba(255,255,255,0.98) 54%, rgba(245,243,255,0.68))",
          boxShadow: "0 14px 32px rgba(15,23,42,0.055)",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 950, color: "var(--wm-er-text)" }}>
          Access Sessions
        </div>

        <div
          style={{
            marginTop: 4,
            fontSize: 11,
            color: "var(--wm-er-muted)",
            fontWeight: 750,
            lineHeight: 1.45,
          }}
        >
          Local record of worker profile access sessions opened through employee-shared access
          codes.
        </div>

        <div
          style={{
            marginTop: 10,
            padding: "9px 10px",
            borderRadius: 15,
            background: "rgba(255,255,255,0.78)",
            border: "1px solid rgba(226,232,240,0.9)",
            color: "var(--wm-er-muted)",
            fontSize: 11,
            fontWeight: 800,
            lineHeight: 1.45,
          }}
        >
          Phase-0 local session record only. This is not cloud security, official verification, or
          compliance validation.
        </div>
      </div>

      <EmployerVaultActiveSessionCard
        session={activeSession}
        remainingText={remainingText}
        onEndSession={handleEndSession}
      />

      <div style={{ display: "grid", gap: 10 }}>
        {accessLog.length === 0 ? (
          <div
            style={{
              padding: "22px 16px",
              borderRadius: 20,
              textAlign: "center",
              background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.97))",
              border: "1px solid rgba(226,232,240,0.9)",
              boxShadow: "0 10px 24px rgba(15,23,42,0.04)",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 950, color: "var(--wm-er-text)" }}>
              No access sessions yet
            </div>

            <div
              style={{ marginTop: 6, fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.5 }}
            >
              Worker profile access history will appear here after a successful access-code unlock.
            </div>
          </div>
        ) : (
          accessLog
            .slice(0, 5)
            .map((entry) => <EmployerVaultAccessLogCard key={entry.id} entry={entry} />)
        )}
      </div>
    </section>
  );
}

function getRemainingText(activeSession: VaultSession | null): string {
  if (!activeSession) return "No active session";

  const remainingMs = getSessionRemainingMs(activeSession.id);
  if (remainingMs <= 0) return "Expired";

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
