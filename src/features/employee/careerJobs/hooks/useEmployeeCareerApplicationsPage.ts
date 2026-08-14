// App name: Job Mitra
// File name: useEmployeeCareerApplicationsPage.ts

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { usePulseStore } from "../../../../features/pulse/pulseStore";
import { hydrateCareerApplicationsFromServer } from "../../../career/services/careerDbTruth.service";
import { isCareerApiSyncEnabled } from "../../../career/services/careerGateApi.service";
import {
  getCareerEmployeeWorkspacesStorageKey,
  safeParse,
} from "../../../career/helpers/careerStoragePublic";
import type { CareerWorkspace } from "../../../career/types/careerDomainTypes";
import {
  computeKpi,
  computeTabCounts,
  getAppsSnapshot,
  stageToTab,
  subscribeApps,
} from "../helpers/careerApplicationHelpers";
import { getPulseTabOverride } from "../helpers/employeeCareerApplicationsPage.helpers";
import {
  employeeCareerApplicationsBannerCopy,
  parseEmployeeCareerApplicationsTab,
  resolveEmployeeCareerApplicationsTab,
} from "../helpers/careerApplications.smartResume";
import { getCareerSearchSnapshot, subscribeCareerSearch } from "../helpers/careerSearchHelpers";
import {
  acceptCareerOffer,
  declineCareerOffer,
  withdrawCareerApplication,
} from "../services/careerApplyService";
import { acceptInterview, declineInterview } from "../services/careerInterviewRsvpService";
import type { Tab } from "../types/careerApplicationTypes";

const WITHDRAW_FAIL_MESSAGE =
  "This application cannot be withdrawn from its current status, or the server could not complete withdrawal.";

export function useEmployeeCareerApplicationsPage() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>("active");
  const landedRef = useRef(false);
  const [withdrawJobId, setWithdrawJobId] = useState<string | null>(null);
  const [withdrawJobTitle, setWithdrawJobTitle] = useState("");
  const [declineJobId, setDeclineJobId] = useState<string | null>(null);
  const [declineJobTitle, setDeclineJobTitle] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [isHydrating, setIsHydrating] = useState(() => isCareerApiSyncEnabled());

  useEffect(() => {
    if (!isCareerApiSyncEnabled()) {
      return;
    }

    let cancelled = false;
    void hydrateCareerApplicationsFromServer().finally(() => {
      if (!cancelled) setIsHydrating(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const apps = useSyncExternalStore(subscribeApps, getAppsSnapshot, getAppsSnapshot);
  const posts = useSyncExternalStore(
    subscribeCareerSearch,
    getCareerSearchSnapshot,
    getCareerSearchSnapshot,
  );

  const postsMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getCareerSearchSnapshot>[number]>();
    for (const post of posts) map.set(post.id, post);
    return map;
  }, [posts]);

  const counts = useMemo(() => computeTabCounts(apps), [apps]);
  const resumeBanner = useMemo(() => employeeCareerApplicationsBannerCopy(counts), [counts]);
  const activePulseNodeId = usePulseStore((state) => state.chain[0] ?? null);
  const pulseTabOverride = getPulseTabOverride(activePulseNodeId);
  const visibleTab = pulseTabOverride ?? tab;

  useEffect(() => {
    if (landedRef.current) return;
    const urlTab = parseEmployeeCareerApplicationsTab(searchParams.get("tab"));
    if (urlTab) {
      queueMicrotask(() => setTab(urlTab));
      landedRef.current = true;
      return;
    }
    if (counts.all === 0) return;
    const next = resolveEmployeeCareerApplicationsTab(counts);
    queueMicrotask(() => setTab(next));
    landedRef.current = true;
  }, [counts, searchParams]);
  const filtered = useMemo(
    () => apps.filter((app) => visibleTab === "all" || stageToTab(app.stage) === visibleTab),
    [apps, visibleTab],
  );
  const kpi = useMemo(() => computeKpi(filtered), [filtered]);

  async function handleWithdrawConfirm() {
    if (!withdrawJobId) return;

    const ok = await withdrawCareerApplication(withdrawJobId);

    setWithdrawJobId(null);
    setWithdrawJobTitle("");

    if (!ok) {
      setActionError(WITHDRAW_FAIL_MESSAGE);
    }
  }

  async function handleDeclineOfferConfirm() {
    if (!declineJobId) return;

    const ok = await declineCareerOffer(declineJobId);

    setDeclineJobId(null);
    setDeclineJobTitle("");

    if (!ok) {
      setActionError("This offer cannot be declined from its current status.");
    }
  }

  const goFind = () => nav(ROUTE_PATHS.employeeCareerSearch);

  function openApplicationTarget(jobId: string, stage: string) {
    if (stage !== "hired") {
      nav(ROUTE_PATHS.employeeCareerPostDetails.replace(":postId", jobId));
      return;
    }

    const workspaces = safeParse<CareerWorkspace>(
      localStorage.getItem(getCareerEmployeeWorkspacesStorageKey()),
    );
    const workspace = workspaces.find((item) => item.jobId === jobId);

    if (workspace) {
      nav(ROUTE_PATHS.employeeCareerWorkspace.replace(":workspaceId", workspace.id));
      return;
    }

    nav(ROUTE_PATHS.employeeCareerWorkspaces);
  }

  function requestWithdraw(jobId: string, jobTitle: string) {
    setWithdrawJobTitle(jobTitle);
    setWithdrawJobId(jobId);
  }

  function requestDeclineOffer(jobId: string, jobTitle: string) {
    setDeclineJobTitle(jobTitle);
    setDeclineJobId(jobId);
  }

  async function acceptOffer(jobId: string) {
    const result = await acceptCareerOffer(jobId);

    if (result.ok) {
      setActionError(null);
      return;
    }

    setActionError(
      result.reason === "api_error"
        ? "Server could not accept this offer. Local change was rolled back."
        : result.reason === "not_found"
          ? "No application was found for this job."
          : result.reason === "invalid_stage"
            ? "This offer cannot be accepted from its current status."
            : result.reason === "post_inactive"
              ? "This job is no longer active."
              : result.reason === "invalid_offer"
                ? "This offer is missing details or has expired."
                : "This offer could not be accepted. Please try again.",
    );
  }

  function acceptInterviewRsvp(jobId: string) {
    const ok = acceptInterview(jobId);
    if (!ok) {
      setActionError("This interview cannot be accepted from its current status.");
    }
  }

  function declineInterviewRsvp(jobId: string) {
    const ok = declineInterview(jobId);
    if (!ok) {
      setActionError("This interview cannot be declined from its current status.");
    }
  }

  return {
    tab,
    setTab,
    visibleTab,
    filtered,
    kpi,
    counts,
    resumeBanner,
    postsMap,
    activePulseNodeId,
    withdrawJobId,
    withdrawJobTitle,
    declineJobId,
    declineJobTitle,
    actionError,
    isHydrating,
    setWithdrawJobId,
    setDeclineJobId,
    setDeclineJobTitle,
    setActionError,
    handleWithdrawConfirm,
    handleDeclineOfferConfirm,
    goFind,
    openApplicationTarget,
    requestWithdraw,
    requestDeclineOffer,
    acceptOffer,
    acceptInterviewRsvp,
    declineInterviewRsvp,
  };
}
