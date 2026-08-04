/** Smart Document Expiry Tracker banner for Business Compliance Hub. */

import type { ComplianceExpiryRow } from "../storage/employerCompliance.types";
import { expiryBucketLabel } from "../helpers/employerComplianceExpiry";

type Props = {
  readonly rows: readonly ComplianceExpiryRow[];
};

export function ComplianceExpiryBanner({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <section
        className="wm-compExpiry isClear"
        data-testid="compliance-expiry-banner"
        aria-label="Document expiry tracker"
      >
        <div className="wm-compExpiry__kicker">Smart Document Expiry Tracker</div>
        <h2 className="wm-compExpiry__title">No expiries in the next 30 days</h2>
        <p className="wm-compExpiry__sub">
          Add expiry dates on shelf documents to get 30 / 14 / 7 day warnings here.
        </p>
      </section>
    );
  }

  return (
    <section
      className="wm-compExpiry isAlert"
      data-testid="compliance-expiry-banner"
      aria-label="Document expiry tracker"
    >
      <div className="wm-compExpiry__kicker">Smart Document Expiry Tracker</div>
      <h2 className="wm-compExpiry__title">
        {rows.length} document{rows.length === 1 ? "" : "s"} need attention
      </h2>
      <p className="wm-compExpiry__sub">Windows: overdue · 7 days · 14 days · 30 days.</p>
      <ul className="wm-compExpiry__list">
        {rows.map((row) => (
          <li key={row.document.id} className={`wm-compExpiry__row is-${row.bucket}`}>
            <span className="wm-compExpiry__doc">{row.document.title}</span>
            <span className="wm-compExpiry__flag">{expiryBucketLabel(row.bucket)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
