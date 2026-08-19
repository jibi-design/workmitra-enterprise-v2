import { useEffect, useMemo, useState } from "react";
import { getFavoriteShiftIds, trackShiftView } from "../../helpers/shiftSearchHelpers";
import {
  APPS_KEY,
  POSTS_KEY,
  ensureRequirements,
  safeParsePosts,
} from "../../helpers/shiftApplyHelpers";
import { shiftPostIdsMatch } from "../../../../shift/utils/shiftIdBridge";
import {
  WORKSPACES_KEY,
  getEffectiveApplication,
  safeParseAllShiftApplications,
  safeParseShiftWorkspaces,
} from "../../storage/shiftPostApply.storage";
import { getShiftApplyCardStatus, getShiftPostSubmitBlockReason } from "./shiftPostApply.selectors";

export function useShiftPostApplyDerived(postId: string) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set(getFavoriteShiftIds()));
  const [now] = useState(() => Date.now());

  const post = useMemo(
    () =>
      safeParsePosts(localStorage.getItem(POSTS_KEY)).find((item) => item.id === postId) ?? null,
    [postId],
  );

  const requirements = useMemo(
    () => (post ? ensureRequirements(post) : { mustHave: [], goodToHave: [] }),
    [post],
  );

  const quickQuestions = post?.quickQuestions ?? [];
  const isSavedShift = post ? favoriteIds.has(post.id) : false;

  const postApplications = post
    ? safeParseAllShiftApplications(localStorage.getItem(APPS_KEY)).filter((application) =>
        shiftPostIdsMatch(application.postId, post.id),
      )
    : [];

  const existingApp = getEffectiveApplication(postApplications);

  const activeWorkspaceId = useMemo<string | null>(() => {
    if (!post) return null;

    const workspace =
      safeParseShiftWorkspaces(localStorage.getItem(WORKSPACES_KEY)).find(
        (item) =>
          item.postId === post.id &&
          (item.status === "active" || item.status === "upcoming" || item.status === "completed"),
      ) ?? null;

    return workspace ? workspace.id : null;
  }, [post]);

  const isApplied = existingApp?.status === "applied";
  const isShortlisted = existingApp?.status === "shortlisted";
  const isWaiting = existingApp?.status === "waiting";
  const isWithdrawn = existingApp?.status === "withdrawn";
  const isConfirmed = existingApp?.status === "confirmed";
  const hasWorkspace = activeWorkspaceId !== null;
  const isClosedOrExpired = Boolean(post?.isHiddenFromSearch) || Boolean(post && post.endAt < now);
  const shouldBlockReapply = isApplied || isShortlisted || isWaiting || isConfirmed || hasWorkspace;

  const cardStatus = useMemo(
    () =>
      getShiftApplyCardStatus({
        hasWorkspace,
        isConfirmed,
        isShortlisted,
        isWaiting,
        isApplied,
        isWithdrawn,
      }),
    [hasWorkspace, isConfirmed, isShortlisted, isWaiting, isApplied, isWithdrawn],
  );

  return {
    post,
    requirements,
    quickQuestions,
    favoriteIds,
    setFavoriteIds,
    existingApp,
    activeWorkspaceId,
    isApplied,
    isShortlisted,
    isWaiting,
    isWithdrawn,
    isConfirmed,
    hasWorkspace,
    isClosedOrExpired,
    shouldBlockReapply,
    isSavedShift,
    cardStatus,
  };
}

export function useShiftPostApplyGates(
  derived: ReturnType<typeof useShiftPostApplyDerived>,
  mustAns: Record<string, string>,
  _goodAns: Record<string, string>,
  quickAnswers: Record<string, "yes" | "no">,
) {
  const {
    requirements,
    quickQuestions,
    hasWorkspace,
    isConfirmed,
    isApplied,
    isShortlisted,
    isWaiting,
    isClosedOrExpired,
    shouldBlockReapply,
  } = derived;

  const mustTotal = requirements.mustHave.length;
  const mustMetCount = requirements.mustHave.reduce(
    (accumulator, item) => accumulator + (mustAns[item] === "meets" ? 1 : 0),
    0,
  );

  const mustGateOk = mustTotal === 0 || mustMetCount === mustTotal;

  const allQuestionsAnswered =
    quickQuestions.length === 0 ||
    quickQuestions.every((question) => quickAnswers[question.id] !== undefined);

  const canSubmit = mustGateOk && allQuestionsAnswered && !shouldBlockReapply && !isClosedOrExpired;

  const submitBlockReason = useMemo(
    () =>
      getShiftPostSubmitBlockReason({
        isClosedOrExpired,
        hasWorkspace,
        isConfirmed,
        isApplied,
        isShortlisted,
        isWaiting,
        mustGateOk,
        allQuestionsAnswered,
        quickQuestionCount: quickQuestions.length,
      }),
    [
      allQuestionsAnswered,
      hasWorkspace,
      isApplied,
      isClosedOrExpired,
      isConfirmed,
      isShortlisted,
      isWaiting,
      mustGateOk,
      quickQuestions.length,
    ],
  );

  return {
    mustTotal,
    mustMetCount,
    mustGateOk,
    allQuestionsAnswered,
    canSubmit,
    submitBlockReason,
  };
}

export function useShiftPostApplyTrackView(postId: string) {
  useEffect(() => {
    if (postId) trackShiftView(postId);
  }, [postId]);
}
