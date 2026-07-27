// src/features/employee/workVault/components/VaultActiveSessionBanner.tsx
//
// Shows when an employer has active document access.
// Employee can revoke at any time.
// Countdown timer shown to employee.

import { useCallback, useEffect, useState } from "react";
import { TrustStrip } from "../../../../shared/components/enterprise/TrustStrip";
import { StatusBadge } from "../../../../shared/components/enterprise/StatusBadge";
import { docAccessSessionStorage } from "../../../../shared/docAccess/docAccessSessionStorage";

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type Props = {
  employerName: string;
  onRevoke: () => void;
  /** Optional custom remaining-ms getter (for vault sessions). Defaults to docAccessSessionStorage. */
  getRemainingMs?: () => number;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function ActiveSessionBanner({ employerName, onRevoke, getRemainingMs }: Props) {
  const msGetter = useCallback(
    () => (getRemainingMs ? getRemainingMs() : docAccessSessionStorage.getRemainingMs()),
    [getRemainingMs],
  );
  const [ms, setMs] = useState(() => msGetter());

  useEffect(() => {
    const t = setInterval(() => setMs(msGetter()), 1000);
    return () => clearInterval(t);
  }, [msGetter]);

  const secs = Math.ceil(ms / 1000);
  const min = Math.floor(secs / 60);
  const sec = secs % 60;
  const isLow = secs <= 120;

  if (ms <= 0) return null;

  return (
    <div className="wm-vault-session-banner" data-testid="vault-active-session-banner">
      <TrustStrip
        kind={isLow ? "compliance" : "lock"}
        tone={isLow ? "critical" : "warning"}
        title="Documents being viewed"
        message={`${employerName} has active OTP access to your visible folders.`}
        badgeLabel={isLow ? "Ending soon" : "Live session"}
        actions={
          <div className="wm-vault-session-banner__actions">
            <StatusBadge
              label={`${min}:${String(sec).padStart(2, "0")} left`}
              tone={isLow ? "critical" : "pending"}
            />
            <button type="button" className="wm-vault-session-banner__revoke" onClick={onRevoke}>
              Revoke Access
            </button>
          </div>
        }
      />
    </div>
  );
}
