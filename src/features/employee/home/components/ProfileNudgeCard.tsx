/** Job Mitra | ProfileNudgeCard.tsx | Slim dismissable profile completion pill */

import { useCallback, useState, useSyncExternalStore, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { getProfileCompletion } from "../../profile/services/profileCompletionService";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import { subscribeContactVerification } from "../../../../shared/phone";
import { HOME_LAYOUT_INSPECTION } from "../../../../shared/config/homeLayoutInspection";

const DISMISS_KEY = "wm_employee_profile_nudge_dismissed_v1";

type CompletionSnap = ReturnType<typeof getProfileCompletion>;

let completionCache: CompletionSnap | null = null;
let completionCacheKey = "";

function getCompletionSnapshot(): CompletionSnap {
  const next = getProfileCompletion();
  const key = `${next.doneCount}|${next.totalCount}|${next.isComplete}|${next.missingLabels.join(",")}`;
  if (completionCache && completionCacheKey === key) return completionCache;
  completionCache = next;
  completionCacheKey = key;
  return completionCache;
}

function subscribeCompletion(onStoreChange: () => void): () => void {
  const unsubProfile = employeeProfileStorage.subscribe(onStoreChange);
  const unsubContact = subscribeContactVerification(onStoreChange);
  return () => {
    unsubProfile();
    unsubContact();
  };
}

function readDismissedAtCount(): number | null {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return null;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function writeDismissedAtCount(doneCount: number): void {
  try {
    localStorage.setItem(DISMISS_KEY, String(doneCount));
  } catch {
    // Fail-silent
  }
}

function ProgressRing({ percent }: { percent: number }) {
  const size = 22;
  const stroke = 2.5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = c - (clamped / 100) * c;

  return (
    <svg
      className="wm-homeProfilePill__ring"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(180, 83, 9, 0.2)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#b45309"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

export function ProfileNudgeCard() {
  const nav = useNavigate();
  const status = useSyncExternalStore(
    subscribeCompletion,
    getCompletionSnapshot,
    getCompletionSnapshot,
  );

  const [dismissedAt, setDismissedAt] = useState<number | null>(() => readDismissedAtCount());

  const percent =
    status.totalCount > 0 ? Math.round((status.doneCount / status.totalCount) * 100) : 0;

  const handleDismiss = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      event.preventDefault();
      writeDismissedAtCount(status.doneCount);
      setDismissedAt(status.doneCount);
    },
    [status.doneCount],
  );

  if (status.isComplete && !HOME_LAYOUT_INSPECTION) return null;
  // Re-show if user completed more sections after dismissing
  if (!HOME_LAYOUT_INSPECTION && dismissedAt !== null && status.doneCount <= dismissedAt) {
    return null;
  }

  return (
    <div
      className="wm-homeProfilePill"
      data-testid="employee-home-profile-pill"
      role="status"
    >
      <button
        type="button"
        className="wm-homeProfilePill__main"
        onClick={() => nav(ROUTE_PATHS.employeeProfile)}
        aria-label={`Complete your profile, ${percent} percent done`}
      >
        <ProgressRing percent={percent} />
        <span className="wm-homeProfilePill__label">Complete profile</span>
        <span className="wm-homeProfilePill__pct">{percent}%</span>
      </button>
      <button
        type="button"
        className="wm-homeProfilePill__dismiss"
        aria-label="Dismiss profile reminder"
        onClick={handleDismiss}
      >
        ×
      </button>
    </div>
  );
}
