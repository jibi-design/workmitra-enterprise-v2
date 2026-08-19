/** Employer Event day — PIN check-in list, or empty line under the cards. */

import { useMemo } from "react";
import { EnterpriseEmpty } from "../../../../../shared/components/enterprise/EnterpriseEmpty";
import { useAuthStore } from "../../../../../shared/store/authStore";
import { useMitraLabsStore } from "../../../../mitraLabs/storage/mitraLabs.storage";

export function EmployerPassAuditLog() {
  const issuerId = useAuthStore((s) => s.user?.id ?? "");
  const events = useMitraLabsStore((s) => s.checkInEvents);
  const mine = useMemo(
    () => (issuerId ? events.filter((event) => event.issuerId === issuerId) : events),
    [events, issuerId],
  );

  if (mine.length === 0) {
    return (
      <div className="wm-erDashAuditEmpty">
        <EnterpriseEmpty
          title="No entry logs yet"
          subtitle="PIN-verified check-ins from the public verify page will appear here."
          testId="employer-pass-audit-empty"
        />
      </div>
    );
  }

  return (
    <ul className="wm-erDashAuditList" data-testid="employer-pass-audit-list">
      {mine.map((event) => (
        <li key={event.eventId} className="wm-erDashAuditList__item">
          <div className="wm-erDashAuditList__title">{event.staffName}</div>
          <div className="wm-erDashAuditList__meta">
            Pass ID: {event.passId}
            <br />
            {new Date(event.verifiedAt).toLocaleString()} · {event.action.replace("_", " ")}
          </div>
        </li>
      ))}
    </ul>
  );
}
