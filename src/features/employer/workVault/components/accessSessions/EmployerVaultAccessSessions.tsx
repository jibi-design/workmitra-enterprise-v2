// App name: Job Mitra
// File name: EmployerVaultAccessSessions.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workVault\components\accessSessions\EmployerVaultAccessSessions.tsx

import { useEffect, useMemo, useState } from "react";
import {
  endEmployerLocalSession,
  getAccessLogSorted,
  getActiveSession,
  getSessionRemainingMs,
  type VaultAccessEntry,
  type VaultSession,
} from "../../../../shared/workVault/vaultPublic";
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
  const activeCount = activeSession ? 1 : 0;
  const recentCount = useMemo(() => accessLog.length, [accessLog.length]);

  function handleEndSession() {
    if (!activeSession) return;

    endEmployerLocalSession(activeSession.id);
    setActiveSession(getActiveSession());
    setAccessLog(getAccessLogSorted());
    setRefreshTick(Date.now());
  }

  return (
    <section className="wm-vault-acl-stack" data-testid="employer-vault-access-sessions">
      <div className="wm-vault-acl-card">
        <div className="wm-vault-acl-card__title">Access grant manager</div>
        <div className="wm-vault-acl-card__sub">
          Local record of worker profile access sessions opened through employee-shared access
          codes.
        </div>

        <div className="wm-vault-acl-card__counters">
          <div className="wm-vault-acl-counter">
            <div className="wm-vault-acl-counter__value">{activeCount}</div>
            <div className="wm-vault-acl-counter__label">Active</div>
          </div>
          <div className="wm-vault-acl-counter">
            <div className="wm-vault-acl-counter__value">{recentCount}</div>
            <div className="wm-vault-acl-counter__label">History</div>
          </div>
        </div>

        <div className="wm-vault-acl-card__note">
          Phase-0 local session record only. This is not cloud security, official verification, or
          compliance validation.
        </div>
      </div>

      <EmployerVaultActiveSessionCard
        session={activeSession}
        remainingText={remainingText}
        onEndSession={handleEndSession}
      />

      <div className="wm-vault-acl-stack">
        {accessLog.length === 0 ? (
          <div className="wm-vault-session-card">
            <div className="wm-vault-session-card__title">No access sessions yet</div>
            <div className="wm-vault-session-card__sub">
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
