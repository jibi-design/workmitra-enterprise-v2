// App name: Job Mitra
// File name: useEmployerShiftPostsPageState.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\hooks\useEmployerShiftPostsPageState.ts

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import {
  getEmployerShiftPostsSnapshot,
  subscribeEmployerShiftPosts,
} from "../helpers/employerShiftPosts.helpers";
import { countApplicationsForPost, shiftPostDashboardPath } from "../helpers/shiftHomeHelpers";
import {
  splitEmployerPostsForMyPosts,
  applyPlanPostsDisplayMode,
} from "../../../shared/planner/ports/plannerShiftJobsBridge";
import {
  employerShiftStorage,
  type ShiftPost,
} from "../../shiftJobs/storage/employerShift.storage";
import { employerShiftDraftStorage } from "../storage/employerShiftDraft.storage";
import { shiftTemplatesStorage } from "../storage/shiftTemplatesStorage";
import { showEnterpriseToast } from "../../../../shared/components/enterprise";

type StatusFilter = "applied" | "shortlisted" | "confirmed" | null;

export function useEmployerShiftPostsPageState() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();

  const statusFilter = (searchParams.get("status") as StatusFilter) ?? null;

  const posts = useSyncExternalStore(
    subscribeEmployerShiftPosts,
    getEmployerShiftPostsSnapshot,
    getEmployerShiftPostsSnapshot,
  );

  const drafts = useSyncExternalStore(
    employerShiftDraftStorage.subscribe,
    employerShiftDraftStorage.getAll,
    employerShiftDraftStorage.getAll,
  );

  const [savingPostId, setSavingPostId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [showIndividualPlanDays, setShowIndividualPlanDays] = useState(false);

  useEffect(() => {
    employerShiftStorage.checkExpiredPosts();
  }, []);

  const kpi = useMemo(() => {
    let open = 0;
    let active = 0;
    let reviewed = 0;

    for (const post of posts) {
      if (post.confirmedIds.length > 0) active += 1;
      else if (post.analysisStatus === "done") reviewed += 1;
      else open += 1;
    }

    return {
      total: posts.length,
      open,
      active,
      reviewed,
    };
  }, [posts]);

  // Filter + sort posts by status when navigated from KPI tiles
  const filteredPosts = useMemo(() => {
    if (!statusFilter) return posts;

    if (statusFilter === "applied") {
      return [...posts]
        .filter((p) => countApplicationsForPost(p.id, "applied") > 0)
        .sort(
          (a, b) =>
            countApplicationsForPost(b.id, "applied") - countApplicationsForPost(a.id, "applied"),
        );
    }

    if (statusFilter === "shortlisted") {
      return [...posts]
        .filter((p) => p.shortlistIds.length > 0)
        .sort((a, b) => b.shortlistIds.length - a.shortlistIds.length);
    }

    if (statusFilter === "confirmed") {
      return [...posts]
        .filter((p) => p.confirmedIds.length > 0)
        .sort((a, b) => b.confirmedIds.length - a.confirmedIds.length);
    }

    return posts;
  }, [posts, statusFilter]);

  function openTemplates() {
    nav(ROUTE_PATHS.employerShiftTemplates);
  }

  function openCreate() {
    nav(ROUTE_PATHS.employerShiftCreate);
  }

  function openPost(postId: string) {
    const post = posts.find((item) => item.id === postId);
    const remaining = post ? Math.max(0, post.vacancies - post.confirmedIds.length) : 0;
    const shortlisted = countApplicationsForPost(postId, "shortlisted");
    nav(shiftPostDashboardPath(postId, remaining > 0 && shortlisted > 0 ? "shortlisted" : undefined));
  }

  function startSaveTemplate(post: ShiftPost) {
    setSavingPostId(post.id);
    setTemplateName(`${post.jobName} template`);
  }

  function cancelSaveTemplate() {
    setSavingPostId(null);
  }

  function handleSaveTemplate(post: ShiftPost) {
    const name = templateName.trim() || `${post.jobName} template`;

    shiftTemplatesStorage.saveTemplate(name, {
      jobName: post.jobName,
      companyName: post.companyName,
      category: post.category,
      experience: post.experience,
      payPerDay: post.payPerDay,
      locationName: post.locationName,
      description: post.description,
      shiftTiming: post.shiftTiming,
      vacancies: post.vacancies,
      waitingBuffer: post.waitingBuffer,
      mustHave: post.mustHave,
      goodToHave: post.goodToHave,
      whatWeProvide: post.whatWeProvide,
      quickQuestions: post.quickQuestions,
      dressCode: post.dressCode,
    });

    setSavingPostId(null);
    setTemplateName("");
    setSaveSuccess(`Saved as "${name}"`);
    showEnterpriseToast({
      tone: "success",
      message: `Template saved as "${name}".`,
    });
    window.setTimeout(() => setSaveSuccess(""), 2500);
  }

  const rawSplit = useMemo(() => splitEmployerPostsForMyPosts(filteredPosts), [filteredPosts]);

  const { standalonePosts, planGroups } = useMemo(() => {
    return applyPlanPostsDisplayMode(rawSplit, showIndividualPlanDays);
  }, [rawSplit, showIndividualPlanDays]);

  function openPlan(planId: string) {
    nav(ROUTE_PATHS.employerPlannerDetail.replace(":planId", planId));
  }

  return {
    posts: standalonePosts,
    planGroups,
    hasPlannerGroups: rawSplit.planGroups.length > 0,
    statusFilter,
    drafts,
    draftCount: drafts.length,
    kpi,
    savingPostId,
    templateName,
    saveSuccess,
    setTemplateName,
    openTemplates,
    openCreate,
    openPost,
    openPlan,
    startSaveTemplate,
    cancelSaveTemplate,
    handleSaveTemplate,
    showIndividualPlanDays,
    setShowIndividualPlanDays,
  };
}
