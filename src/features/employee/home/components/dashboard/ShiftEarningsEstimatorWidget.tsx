/** Wave 3 — Shift Earnings Estimator (estimate only). No diary / tax / legal claim. */

import { useMemo, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../../app/router/routePaths";
import { earningsStorage } from "../../../shiftJobs/storage/earningsStorage";
import { shiftApplicationsStorage } from "../../../shiftJobs/storage/shiftApplications.storage";
import {
  APPS_KEY,
  POSTS_KEY,
} from "../../../shiftJobs/storage/shiftApplications.storage.mutations";

function formatGbp(amount: number): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "GBP",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `£${Math.round(amount)}`;
  }
}

/** Stable revision for useSyncExternalStore — raw LS fingerprint. */
function getEarningsRevision(): string {
  try {
    return `${localStorage.getItem(APPS_KEY) ?? ""}|${localStorage.getItem(POSTS_KEY) ?? ""}`;
  } catch {
    return "";
  }
}

export function ShiftEarningsEstimatorWidget() {
  const nav = useNavigate();
  const revision = useSyncExternalStore(
    shiftApplicationsStorage.subscribe,
    getEarningsRevision,
    getEarningsRevision,
  );

  const summary = useMemo(() => {
    void revision;
    return earningsStorage.getSummary("all");
  }, [revision]);

  const recent = summary.entries.slice(0, 3);

  return (
    <section
      className="wm-dashWidget"
      data-testid="shift-earnings-estimator-widget"
      aria-label="Shift earnings estimate"
    >
      <div className="wm-dashWidget__head">
        <div className="wm-dashWidget__kicker">Money clarity</div>
        <h2 className="wm-dashWidget__title">Shift Earnings Estimator</h2>
        <p className="wm-dashWidget__sub">
          From confirmed shifts in your local apps. Estimate only — no legal or tax claim.
        </p>
      </div>

      <div className="wm-dashEarnHero" aria-live="polite">
        <div className="wm-dashEarnHero__value">{formatGbp(summary.totalEarned)}</div>
        <div className="wm-dashEarnHero__meta">
          {summary.totalShifts} confirmed · {summary.totalDays} day
          {summary.totalDays === 1 ? "" : "s"}
        </div>
      </div>

      <p className="wm-dashEarnDisclaimer" role="note">
        Estimate — No Legal/Tax Claim. Not a payslip or settlement.
      </p>

      {recent.length > 0 ? (
        <ul className="wm-dashEarnList">
          {recent.map((entry) => (
            <li key={entry.appId} className="wm-dashEarnList__item">
              <div className="wm-dashEarnList__copy">
                <div className="wm-dashEarnList__title">{entry.jobName}</div>
                <div className="wm-dashEarnList__sub">
                  {entry.companyName} · {entry.totalDays}d
                </div>
              </div>
              <div className="wm-dashEarnList__amount">{formatGbp(entry.totalEarned)}</div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="wm-dashEmptyHint">Confirm a shift to see estimates here.</p>
      )}

      <button
        type="button"
        className="wm-dashLinkBtn"
        data-testid="shift-earnings-open-full"
        onClick={() => nav(ROUTE_PATHS.employeeShiftEarnings)}
      >
        Open full earnings tracker →
      </button>
    </section>
  );
}
