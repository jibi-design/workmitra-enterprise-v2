/** Daily OS — Compliance & Expiry Alert Card → Business Compliance Hub */

import { useMemo, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../../app/router/routePaths";
import {
  listExpiringComplianceDocuments,
  expiryBucketLabel,
} from "../../../compliance/helpers/employerComplianceExpiry";
import type { ComplianceExpiryBucket } from "../../../compliance/storage/employerCompliance.types";
import { employerComplianceStorage } from "../../../compliance/storage/employerCompliance.storage";

const BADGE_ORDER: readonly Exclude<ComplianceExpiryBucket, "ok" | "none">[] = [
  "overdue",
  "d7",
  "d14",
  "d30",
];

const BADGE_SHORT: Record<(typeof BADGE_ORDER)[number], string> = {
  overdue: "Overdue",
  d7: "7d",
  d14: "14d",
  d30: "30d",
};

export function ComplianceExpiryAlertCard() {
  const nav = useNavigate();
  const snapshot = useSyncExternalStore(
    employerComplianceStorage.subscribe,
    employerComplianceStorage.getSnapshot,
    employerComplianceStorage.getSnapshot,
  );

  const rows = useMemo(() => {
    void snapshot;
    return listExpiringComplianceDocuments(employerComplianceStorage.getAll());
  }, [snapshot]);

  const badgeCounts = useMemo(() => {
    const counts: Partial<Record<(typeof BADGE_ORDER)[number], number>> = {};
    for (const row of rows) {
      counts[row.bucket] = (counts[row.bucket] ?? 0) + 1;
    }
    return counts;
  }, [rows]);

  const isAlert = rows.length > 0;
  const top = rows[0];

  return (
    <button
      type="button"
      className={`wm-dailyOsCard${isAlert ? " isAlert" : " isClear"}`}
      data-testid="compliance-expiry-alert-card"
      onClick={() => nav(ROUTE_PATHS.employerCompliance)}
      aria-label="Open Business Compliance Hub"
    >
      <div className="wm-dailyOsCard__kicker">Compliance</div>
      <div className="wm-dailyOsCard__title">
        {isAlert
          ? `${rows.length} document${rows.length === 1 ? "" : "s"} need attention`
          : "Compliance shelf clear"}
      </div>
      <div className="wm-dailyOsCard__sub">
        {isAlert && top
          ? `${top.document.title} — ${expiryBucketLabel(top.bucket)}`
          : "Open Business Compliance Hub for insurance, H&S, and RTW audit logs."}
      </div>

      {isAlert ? (
        <div className="wm-dailyOsBadges" aria-label="Expiry windows">
          {BADGE_ORDER.map((bucket) => {
            const count = badgeCounts[bucket] ?? 0;
            if (count <= 0) return null;
            return (
              <span key={bucket} className={`wm-dailyOsBadge is-${bucket}`}>
                {BADGE_SHORT[bucket]} · {count}
              </span>
            );
          })}
        </div>
      ) : null}

      <div className="wm-dailyOsCard__cta">Open Compliance Hub →</div>
    </button>
  );
}
