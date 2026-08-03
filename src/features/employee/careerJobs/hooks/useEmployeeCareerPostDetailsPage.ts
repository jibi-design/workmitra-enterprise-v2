// App name: Job Mitra
// File name: useEmployeeCareerPostDetailsPage.ts
// Wave 1: apply race guard, withdraw CTA align, rejected re-apply, unmount-safe timers

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { useUnsavedChangesGuard } from "../../../../shared/hooks/useUnsavedChangesGuard";
import {
  getSubmitBlockReason,
  isValidCoverNote,
  isValidOptionalEmail,
  isValidOptionalExpectedSalary,
  isValidOptionalPhone,
} from "../helpers/careerApplicationValidation";
import { getCareerSearchSnapshot, subscribeCareerSearch } from "../helpers/careerSearchHelpers";
import { getAppsSnapshot, subscribeApps } from "../helpers/careerApplicationHelpers";
import {
  applyToCareerJob,
  canShowCareerWithdraw,
  getMyApplicationForJob,
  withdrawCareerApplication,
} from "../services/careerApplyService";
import { employeeCareerRecentlyViewedJobsStorage } from "../storage/employeeCareerRecentlyViewedJobs.storage";

const WITHDRAW_FAIL_MESSAGE =
  "This application cannot be withdrawn from its current status, or the server could not complete withdrawal.";

export function useEmployeeCareerPostDetailsPage() {
  const nav = useNavigate();
  const { postId = "" } = useParams();
  const [now, setNow] = useState(() => Date.now());
  const mountedRef = useRef(true);
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (navTimerRef.current != null) {
        clearTimeout(navTimerRef.current);
        navTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const timerId = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timerId);
  }, []);

  // C-DISC-1: deep-link / direct open also updates Recently viewed.
  useEffect(() => {
    const id = postId.trim();
    if (!id) return;
    employeeCareerRecentlyViewedJobsStorage.markViewed(id);
  }, [postId]);

  const allPosts = useSyncExternalStore(
    subscribeCareerSearch,
    getCareerSearchSnapshot,
    getCareerSearchSnapshot,
  );
  const appsSnapshot = useSyncExternalStore(subscribeApps, getAppsSnapshot, getAppsSnapshot);
  void appsSnapshot;
  const post = useMemo(
    () => allPosts.find((item) => item.id === postId) ?? null,
    [allPosts, postId],
  );
  const existingApp = getMyApplicationForJob(postId);

  const isApplied =
    existingApp?.stage !== undefined &&
    existingApp.stage !== "withdrawn" &&
    existingApp.stage !== "offer_declined" &&
    existingApp.stage !== "rejected";
  const canWithdraw = canShowCareerWithdraw(existingApp?.stage);
  const withdrawOnlineBlocked = false;
  const isExpired = Boolean(post && post.closingDate > 0 && post.closingDate < now);

  const [coverNote, setCoverNote] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("Immediate");
  const [employeePhone, setEmployeePhone] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [contactConfirmed, setContactConfirmed] = useState(false);
  const [screeningAnswers, setScreeningAnswers] = useState<Record<string, "yes" | "no">>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [showError, setShowError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasUnsavedApplyInput =
    !isApplied &&
    !showSuccess &&
    (coverNote.trim().length > 0 ||
      expectedSalary.trim().length > 0 ||
      employeePhone.trim().length > 0 ||
      employeeEmail.trim().length > 0 ||
      Object.keys(screeningAnswers).length > 0);

  useUnsavedChangesGuard(
    hasUnsavedApplyInput,
    "You have unsaved application answers. Leave this page?",
  );

  const hasContactDetails = employeePhone.trim().length > 0 || employeeEmail.trim().length > 0;
  const screeningQuestions = post?.screeningQuestions ?? [];
  const allScreeningAnswered =
    screeningQuestions.length === 0 ||
    screeningQuestions.every((question) => screeningAnswers[question.id] !== undefined);

  const submitBlockReason = getSubmitBlockReason({
    isApplied,
    isExpired,
    hasCoverNote: coverNote.trim().length > 0,
    coverNoteValid: isValidCoverNote(coverNote),
    allScreeningAnswered,
    screeningQuestionCount: screeningQuestions.length,
    phoneValid: isValidOptionalPhone(employeePhone),
    emailValid: isValidOptionalEmail(employeeEmail),
    expectedSalaryValid: isValidOptionalExpectedSalary(expectedSalary),
    hasContactDetails,
    contactConfirmed,
  });

  const canSubmit = !submitBlockReason && !isSubmitting;

  function scheduleSuccessNav() {
    if (navTimerRef.current != null) clearTimeout(navTimerRef.current);
    navTimerRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      setShowSuccess(false);
      nav(ROUTE_PATHS.employeeCareerSearch);
    }, 1200);
  }

  async function handleApply() {
    if (!post || isSubmitting) return;

    if (!canSubmit) {
      setShowError(submitBlockReason || "Please complete the required application steps.");
      return;
    }

    setIsSubmitting(true);
    setShowError(null);

    try {
      const result = await applyToCareerJob({
        jobId: post.id,
        coverNote: coverNote.trim(),
        expectedSalary: Number(expectedSalary) || 0,
        noticePeriod: noticePeriod || "Immediate",
        employeePhone: employeePhone.trim(),
        employeeEmail: employeeEmail.trim(),
        screeningAnswers: screeningQuestions.length > 0 ? screeningAnswers : undefined,
      });

      if (!mountedRef.current) return;

      if (result) {
        setShowSuccess(true);
        scheduleSuccessNav();
        return;
      }

      setShowError(
        "This job is no longer accepting applications, or you have already applied to this position.",
      );
    } finally {
      if (mountedRef.current) setIsSubmitting(false);
    }
  }

  function requestWithdraw() {
    setShowWithdrawConfirm(true);
  }

  async function handleWithdraw() {
    setShowWithdrawConfirm(false);

    const ok = await withdrawCareerApplication(postId);

    if (ok) {
      setShowSuccess(true);
      scheduleSuccessNav();
      return;
    }

    setShowError(WITHDRAW_FAIL_MESSAGE);
  }

  return {
    post,
    existingApp,
    isApplied,
    canWithdraw,
    withdrawOnlineBlocked,
    isExpired,
    isSubmitting,
    coverNote,
    setCoverNote,
    expectedSalary,
    setExpectedSalary,
    noticePeriod,
    setNoticePeriod,
    employeePhone,
    setEmployeePhone,
    employeeEmail,
    setEmployeeEmail,
    contactConfirmed,
    setContactConfirmed,
    screeningAnswers,
    setScreeningAnswers,
    showSuccess,
    showWithdrawConfirm,
    setShowWithdrawConfirm,
    showError,
    setShowError,
    canSubmit,
    submitBlockReason,
    screeningQuestions,
    handleApply,
    requestWithdraw,
    handleWithdraw,
    goSearch: () => nav(ROUTE_PATHS.employeeCareerSearch),
  };
}
