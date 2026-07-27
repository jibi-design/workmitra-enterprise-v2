import { analyzeShiftCandidates, getAnalysisNote } from "./employerShift.analysis";
import {
  readEmployeeApplications,
  writeEmployeeApplications,
} from "./employerShift.employeeBridge";
import {
  readEmployerPosts,
  syncToEmployeeSearch,
  writeEmployerPosts,
} from "./employerShift.postStorage";
import { pushEmployerActivity } from "./employerShift.activityStorage";
import type { EmployeeShiftApplication, ShiftPost } from "./employerShift.types";
import { notifyEmployeeAppsChanged } from "./employerShift.utils";
import { updateEmployerShiftPost } from "./employerShift.postActions.crud";

function mergeAnalyzedApplications(
  allApps: EmployeeShiftApplication[],
  analyzedApps: EmployeeShiftApplication[],
): EmployeeShiftApplication[] {
  const analyzedMap = new Map(analyzedApps.map((app) => [app.id, app]));
  return allApps.map((app) => analyzedMap.get(app.id) ?? app);
}

export function runEmployerShiftAnalysis(postId: string): ShiftPost | null {
  const posts = readEmployerPosts();
  const current = posts.find((post) => post.id === postId);

  if (!current) return null;

  const apps = readEmployeeApplications();
  const analyzedApps = analyzeShiftCandidates(current, apps);
  const mergedApps = mergeAnalyzedApplications(apps, analyzedApps);

  writeEmployeeApplications(mergedApps);
  notifyEmployeeAppsChanged();

  const note = getAnalysisNote(current, mergedApps);

  const updated: ShiftPost = {
    ...current,
    analysisStatus: "done",
    analyzedAt: Date.now(),
    analysisNote: note,
  };

  const next = posts.map((post) => (post.id === postId ? updated : post));

  writeEmployerPosts(next);
  syncToEmployeeSearch(next);

  pushEmployerActivity({
    postId,
    kind: "analysis_run",
    title: "Candidate analysis completed",
    body: note,
    route: `/employer/shift/post/${postId}`,
  });

  return updated;
}

export function resetEmployerShiftAnalysis(postId: string): ShiftPost | null {
  const updated = updateEmployerShiftPost(postId, {
    analysisStatus: "not_started",
    analyzedAt: undefined,
    analysisNote: undefined,
  });

  if (!updated) return null;

  pushEmployerActivity({
    postId,
    kind: "analysis_reset",
    title: "Candidate analysis reset",
    body: updated.jobName,
    route: `/employer/shift/post/${postId}`,
  });

  return updated;
}
