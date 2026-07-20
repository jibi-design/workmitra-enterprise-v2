// App name: Job Mitra
// File name: employerShift.analysis.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\storage\employerShift.analysis.ts

import type { EmployeeShiftApplication, PriorityTag, ShiftPost } from "./employerShift.types";

export function analyzeShiftCandidates(
  post: ShiftPost,
  applications: EmployeeShiftApplication[],
): EmployeeShiftApplication[] {
  const related = applications.filter((app) => app.postId === post.id);

  const scored = related.map((app) => ({
    app,
    score: getCandidateScore(post, app),
  }));

  scored.sort((a, b) => {
    const scoreDiff = b.score - a.score;
    if (scoreDiff !== 0) return scoreDiff;
    return a.app.createdAt - b.app.createdAt;
  });

  return scored.map(({ app }, index) => ({
    ...app,
    priorityTag: getPriorityTag(index, getCandidateScore(post, app)),
  }));
}

export function getCandidateScore(post: ShiftPost, app: EmployeeShiftApplication): number {
  let score = 0;

  for (const requirement of post.mustHave) {
    if (app.mustHaveAnswers[requirement] === "meets") score += 30;
    else if (app.mustHaveAnswers[requirement] === "not_sure") score += 10;
  }

  for (const requirement of post.goodToHave) {
    if (app.goodToHaveAnswers[requirement] === "meets") score += 10;
    else if (app.goodToHaveAnswers[requirement] === "not_sure") score += 4;
  }

  const profile = app.profileSnapshot;

  if (profile?.uniqueId) score += 5;
  if (profile?.fullName) score += 5;
  if (Array.isArray(profile?.skills) && profile.skills.length > 0) score += 5;
  if (Array.isArray(profile?.languages) && profile.languages.length > 0) score += 3;

  if (app.status === "confirmed") score += 20;
  if (app.status === "shortlisted") score += 12;
  if (app.status === "waiting") score += 8;
  if (app.status === "withdrawn" || app.status === "rejected") score -= 50;

  return score;
}

export function getPriorityTag(index: number, score: number): PriorityTag {
  if (index < 3 || score >= 75) return "priority";
  if (score >= 35) return "good";
  return "review";
}

export function getAnalysisNote(post: ShiftPost, applications: EmployeeShiftApplication[]): string {
  const related = applications.filter((app) => app.postId === post.id);
  const active = related.filter(
    (app) =>
      app.status === "applied" ||
      app.status === "shortlisted" ||
      app.status === "waiting" ||
      app.status === "confirmed",
  );

  if (active.length === 0) {
    return "No active applicants available for this shift yet.";
  }

  const scored = active.map((app) => getCandidateScore(post, app));
  const strong = scored.filter((score) => score >= 75).length;
  const good = scored.filter((score) => score >= 35 && score < 75).length;

  if (strong > 0) {
    return `${strong} strong candidate${strong !== 1 ? "s" : ""} found for this shift.`;
  }

  if (good > 0) {
    return `${good} candidate${good !== 1 ? "s" : ""} need employer review.`;
  }

  return "Candidates are available, but manual review is recommended.";
}
