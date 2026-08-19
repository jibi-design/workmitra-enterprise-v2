/** Job Mitra | PendingGroupJoinBanner.tsx | Compact pending-invite pill under home hero */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  describePendingGroupJoin,
  resolvePendingGroupJoinOrchestration,
} from "../helpers/groupJoinDeepLink";
import { peekGroupFromStaticLink } from "../services/groupDailyOtp.service";
import {
  peekPendingGroupJoinPath,
  stashPendingGroupJoin,
} from "../storage/pendingGroupJoin.storage";

type Props = {
  onDismiss?: () => void;
};

function inviteLabel(companyName: string | undefined): string {
  const name = companyName?.trim();
  if (name) return `Invite from ${name}`;
  return "Invite from your employer";
}

export function PendingGroupJoinBanner({ onDismiss }: Props) {
  const nav = useNavigate();
  const pending = describePendingGroupJoin();
  const path = resolvePendingGroupJoinOrchestration() ?? peekPendingGroupJoinPath();
  const [companyName, setCompanyName] = useState(pending?.companyName?.trim() ?? "");

  useEffect(() => {
    if (!pending?.token) return;
    if (pending.companyName?.trim()) return;

    let cancelled = false;
    const token = pending.token;
    const groupId = pending.groupId;
    const useDailyOtpGate = pending.useDailyOtpGate;
    void peekGroupFromStaticLink(token)
      .then((peek) => {
        if (cancelled) return;
        const name = peek.group_name?.trim();
        if (!name) return;
        setCompanyName(name);
        stashPendingGroupJoin({
          token,
          groupId: groupId || peek.group_id,
          companyName: name,
          useDailyOtpGate,
          savedAt: Date.now(),
        });
      })
      .catch(() => {
        /* keep soft fallback label */
      });

    return () => {
      cancelled = true;
    };
  }, [pending?.token, pending?.companyName, pending?.groupId, pending?.useDailyOtpGate]);

  if (!pending || !path) return null;

  return (
    <section
      className="wm-homePendingInvitePill"
      data-testid="pending-group-join-banner"
      role="status"
      aria-label={inviteLabel(companyName || pending.companyName)}
    >
      <div className="wm-homePendingInvitePill__copy">
        <span className="wm-homePendingInvitePill__title">Pending invite</span>
        <span className="wm-homePendingInvitePill__sub" data-testid="pending-group-join-message">
          {inviteLabel(companyName || pending.companyName)}
        </span>
      </div>
      <div className="wm-homePendingInvitePill__actions">
        <button
          type="button"
          className="wm-homePendingInvitePill__cta"
          data-testid="pending-group-join-continue"
          onClick={() => nav(path)}
        >
          Accept & Join
        </button>
        {onDismiss ? (
          <button
            type="button"
            className="wm-homePendingInvitePill__dismiss"
            data-testid="pending-group-join-dismiss"
            aria-label="Dismiss pending invite reminder"
            onClick={onDismiss}
          >
            ×
          </button>
        ) : null}
      </div>
    </section>
  );
}
