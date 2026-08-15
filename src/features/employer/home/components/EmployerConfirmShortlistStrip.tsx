/** Job Mitra | EmployerConfirmShortlistStrip.tsx | Confirm-shortlist action strip */

import { useCallback, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { HomeStatusStripFrame } from "../../../../shared/home/HomeStatusStripFrame";
import { EMPLOYEE_APPS_CHANGED_EVENT } from "../../shiftJobs/storage/employerShift.keys";
import {
  findConfirmWaitingPost,
  getPostsSnapshot,
  shiftPostDashboardPath,
  subscribePosts,
} from "../../shiftJobs/helpers/shiftHomeHelpers";

function CheckUserIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-8 9v-1.2C4 16.7 8.5 15 12 15s8 1.7 8 4.8V21H4Zm14.6-12.5 1.4 1.4-5.5 5.5-2.8-2.8 1.4-1.4 1.4 1.4 4.1-4.1Z"
      />
    </svg>
  );
}

let waitingCacheKey = "";
let waitingCache: ReturnType<typeof findConfirmWaitingPost> = null;

function getWaiting(): ReturnType<typeof findConfirmWaitingPost> {
  const next = findConfirmWaitingPost(getPostsSnapshot());
  const key = next ? `${next.postId}|${next.jobName}|${next.shortlisted}|${next.remaining}` : "0";
  if (key === waitingCacheKey) return waitingCache;
  waitingCacheKey = key;
  waitingCache = next;
  return waitingCache;
}

function subscribeWaiting(onStoreChange: () => void): () => void {
  const unsubPosts = subscribePosts(onStoreChange);
  window.addEventListener(EMPLOYEE_APPS_CHANGED_EVENT, onStoreChange);
  return () => {
    unsubPosts();
    window.removeEventListener(EMPLOYEE_APPS_CHANGED_EVENT, onStoreChange);
  };
}

export function EmployerConfirmShortlistStrip() {
  const nav = useNavigate();
  const waiting = useSyncExternalStore(subscribeWaiting, getWaiting, getWaiting);

  const handleOpen = useCallback(() => {
    if (!waiting) return;
    nav(shiftPostDashboardPath(waiting.postId, "shortlisted"));
  }, [nav, waiting]);

  if (!waiting) return null;

  const line = `Confirm shortlisted worker - ${waiting.shortlisted} shortlisted on ${waiting.jobName}`;

  return (
    <HomeStatusStripFrame
      testId="employer-home-confirm-shortlist"
      domain="shift"
      line={line}
      ariaLabel={line}
      dismissId={`confirm:${waiting.postId}|${waiting.shortlisted}`}
      icon={<CheckUserIcon />}
      onOpen={handleOpen}
    />
  );
}
