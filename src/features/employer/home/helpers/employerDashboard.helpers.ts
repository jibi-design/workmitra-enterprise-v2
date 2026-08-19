/** Pro Employer dashboard — career hiring metrics from employer career SoT. */

import type {
  CareerApplication,
  CareerApplicationStage,
  CareerJobPost,
} from "../../careerJobs/types/careerTypes";

export type EmployerDashMetricKey =
  | "activePosts"
  | "totalApplicants"
  | "shortlisted"
  | "interviews"
  | "todayInterviews";

export type EmployerDashMetrics = Record<EmployerDashMetricKey, number>;

export type EmployerPipelineStage =
  | "Applied"
  | "Shortlisted"
  | "Interview"
  | "Hired"
  | "Rejected";

export type EmployerPipelineFilter = "all" | EmployerPipelineStage;

export const EMPLOYER_PIPELINE_STEPPER_STAGES = [
  "Applied",
  "Shortlisted",
  "Interview",
  "Hired",
] as const;

export type EmployerPipelineStepperStage = (typeof EMPLOYER_PIPELINE_STEPPER_STAGES)[number];

export type EmployerPipelineStageCounts = Record<EmployerPipelineStepperStage, number>;

export type EmployerPipelineRow = {
  readonly id: string;
  readonly jobId: string;
  readonly jobTitle: string;
  readonly candidateName: string;
  readonly stage: EmployerPipelineStage;
  readonly updatedAt: number;
  readonly phone: string;
  readonly email: string;
};

export type EmployerMatchCandidate = {
  readonly appId: string;
  readonly jobId: string;
  readonly jobTitle: string;
  readonly candidateName: string;
  readonly matchPercent: number;
};

export type EmployerActiveJobRow = {
  readonly id: string;
  readonly title: string;
  readonly company: string;
  readonly applicants: number;
  readonly shortlisted: number;
  readonly status: string;
  readonly closingDate: number;
};

export type EmployerInterviewRow = {
  readonly appId: string;
  readonly jobId: string;
  readonly candidateName: string;
  readonly jobTitle: string;
  readonly roundLabel: string;
  readonly scheduledDate: string;
  readonly scheduledTime: string;
  readonly mode: string;
  readonly phone: string;
  readonly email: string;
};

const REJECTED_STAGES = new Set<CareerApplicationStage>([
  "rejected",
  "withdrawn",
  "offer_declined",
]);

export function mapEmployerPipelineStage(stage: CareerApplicationStage): EmployerPipelineStage {
  if (stage === "shortlisted") return "Shortlisted";
  if (stage === "interview") return "Interview";
  if (stage === "hired" || stage === "offer_accepted") return "Hired";
  if (REJECTED_STAGES.has(stage)) return "Rejected";
  if (stage === "offered") return "Interview";
  return "Applied";
}

export function computeEmployerPipelineStageCounts(
  apps: readonly CareerApplication[],
): EmployerPipelineStageCounts {
  const counts: EmployerPipelineStageCounts = {
    Applied: 0,
    Shortlisted: 0,
    Interview: 0,
    Hired: 0,
  };
  for (const app of apps) {
    const stage = mapEmployerPipelineStage(app.stage);
    if (stage === "Rejected") continue;
    counts[stage] += 1;
  }
  return counts;
}

function localDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function countTodayScheduledInterviews(
  apps: readonly CareerApplication[],
  todayKey: string,
): number {
  let count = 0;
  for (const app of apps) {
    for (const round of app.roundResults) {
      if (round.status === "scheduled" && round.scheduledDate === todayKey) count += 1;
    }
  }
  return count;
}

export function computeEmployerDashMetrics(
  posts: readonly CareerJobPost[],
  apps: readonly CareerApplication[],
  todayKey = localDateKey(),
): EmployerDashMetrics {
  const activePosts = posts.filter((p) => p.status === "active").length;
  let shortlisted = 0;
  let interviews = 0;
  for (const app of apps) {
    if (app.stage === "shortlisted") shortlisted += 1;
    if (app.stage === "interview" || app.roundResults.some((r) => r.status === "scheduled")) {
      interviews += 1;
    }
  }
  return {
    activePosts,
    totalApplicants: apps.length,
    shortlisted,
    interviews,
    todayInterviews: countTodayScheduledInterviews(apps, todayKey),
  };
}

export function buildEmployerPipelineRows(
  apps: readonly CareerApplication[],
  postsById: ReadonlyMap<string, CareerJobPost>,
  filter: EmployerPipelineFilter,
  limit = 40,
): EmployerPipelineRow[] {
  return [...apps]
    .map((app) => {
      const post = postsById.get(app.jobId);
      return {
        id: app.id,
        jobId: app.jobId,
        jobTitle: post?.jobTitle?.trim() || "Career role",
        candidateName: app.employeeName?.trim() || "Candidate",
        stage: mapEmployerPipelineStage(app.stage),
        updatedAt: app.updatedAt,
        phone: app.employeePhone?.trim() || "",
        email: app.employeeEmail?.trim() || "",
      };
    })
    .filter((row) => (filter === "all" ? true : row.stage === filter))
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, limit);
}

export function computeEmployerMatchPercent(
  post: CareerJobPost,
  app: CareerApplication,
): number {
  const postSkills = (post.skills ?? []).map((s) => s.trim().toLowerCase()).filter(Boolean);
  const candSkills = (app.profileSnapshot?.skills ?? [])
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (postSkills.length === 0) {
    return app.stage === "shortlisted" || app.stage === "interview" ? 72 : 48;
  }
  if (candSkills.length === 0) return 35;
  const set = new Set(candSkills);
  let hits = 0;
  for (const s of postSkills) {
    if (set.has(s)) hits += 1;
  }
  const skillScore = Math.round((hits / postSkills.length) * 75);
  const stageBonus =
    app.stage === "interview" ? 15 : app.stage === "shortlisted" ? 10 : app.stage === "applied" ? 5 : 0;
  const cityBonus =
    app.profileSnapshot?.city?.trim() &&
    post.location.toLowerCase().includes(app.profileSnapshot.city.trim().toLowerCase())
      ? 8
      : 0;
  return Math.min(99, Math.max(20, skillScore + stageBonus + cityBonus));
}

export function buildEmployerMatchCandidates(
  posts: readonly CareerJobPost[],
  apps: readonly CareerApplication[],
  limit = 6,
): EmployerMatchCandidate[] {
  const activeIds = new Set(posts.filter((p) => p.status === "active").map((p) => p.id));
  const postsById = new Map(posts.map((p) => [p.id, p]));
  const eligible = apps.filter(
    (a) =>
      activeIds.has(a.jobId) &&
      (a.stage === "applied" || a.stage === "shortlisted" || a.stage === "interview"),
  );
  return eligible
    .map((app) => {
      const post = postsById.get(app.jobId);
      if (!post) return null;
      return {
        appId: app.id,
        jobId: app.jobId,
        jobTitle: post.jobTitle,
        candidateName: app.employeeName?.trim() || "Candidate",
        matchPercent: computeEmployerMatchPercent(post, app),
      };
    })
    .filter((x): x is EmployerMatchCandidate => x !== null)
    .sort((a, b) => b.matchPercent - a.matchPercent)
    .slice(0, limit);
}

export function buildEmployerActiveJobs(
  posts: readonly CareerJobPost[],
  limit = 8,
): EmployerActiveJobRow[] {
  return posts
    .filter((p) => p.status === "active" || p.status === "paused" || p.status === "draft")
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, limit)
    .map((p) => ({
      id: p.id,
      title: p.jobTitle,
      company: p.companyName,
      applicants: p.totalApplications ?? 0,
      shortlisted: p.shortlisted ?? 0,
      status: p.status,
      closingDate: p.closingDate,
    }));
}

export function buildEmployerInterviewRows(
  apps: readonly CareerApplication[],
  postsById: ReadonlyMap<string, CareerJobPost>,
  limit = 8,
): EmployerInterviewRow[] {
  const rows: EmployerInterviewRow[] = [];
  for (const app of apps) {
    const post = postsById.get(app.jobId);
    for (const rr of app.roundResults) {
      if (rr.status !== "scheduled" || !rr.scheduledDate) continue;
      rows.push({
        appId: app.id,
        jobId: app.jobId,
        candidateName: app.employeeName?.trim() || "Candidate",
        jobTitle: post?.jobTitle?.trim() || "Career role",
        roundLabel: rr.label || `Round ${rr.round}`,
        scheduledDate: rr.scheduledDate,
        scheduledTime: rr.scheduledTime ?? "",
        mode: rr.interviewMode,
        phone: app.employeePhone?.trim() || "",
        email: app.employeeEmail?.trim() || "",
      });
    }
  }
  return rows
    .sort((a, b) => {
      const ak = `${a.scheduledDate}T${a.scheduledTime || "00:00"}`;
      const bk = `${b.scheduledDate}T${b.scheduledTime || "00:00"}`;
      return ak.localeCompare(bk);
    })
    .slice(0, limit);
}

export function formatRelativeDay(ts: number): string {
  if (!ts) return "—";
  const days = Math.floor((Date.now() - ts) / (24 * 60 * 60 * 1000));
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}
