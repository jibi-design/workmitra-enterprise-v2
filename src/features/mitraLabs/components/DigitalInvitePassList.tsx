/** Job Mitra | DigitalInvitePassList.tsx | Recent passes + empty */

import { EnterpriseEmpty } from "../../../shared/components/enterprise/EnterpriseEmpty";
import type { DigitalPassRecord } from "../storage/mitraLabs.storage";

type Props = {
  readonly passes: readonly DigitalPassRecord[];
  readonly onRevoke: (passId: string) => void;
};

export function DigitalInvitePassList({ passes, onRevoke }: Props) {
  return (
    <section className="wm-dashWidget" data-ui-state={passes.length === 0 ? "empty" : "active"}>
      <div className="wm-dashWidget__kicker">Your passes</div>
      <h2 className="wm-dashWidget__title">Recent issues</h2>
      {passes.length === 0 ? (
        <EnterpriseEmpty
          testId="digital-invite-list-empty"
          title="No passes yet"
          subtitle="Issue a pass with the form above. Each pass has a valid window and a code you can scan at the door."
        />
      ) : (
        <ul className="wm-mlList">
          {passes.slice(0, 12).map((pass) => (
            <li key={pass.passId} className="wm-mlListItem">
              <div>
                <div className="wm-mlListItem__title">{pass.guestName}</div>
                <div className="wm-mlListItem__meta">
                  {pass.venue.name} · {pass.status} · {pass.purpose}
                </div>
              </div>
              {pass.status === "active" ? (
                <button type="button" className="wm-outlineBtn" onClick={() => onRevoke(pass.passId)}>
                  Revoke
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
