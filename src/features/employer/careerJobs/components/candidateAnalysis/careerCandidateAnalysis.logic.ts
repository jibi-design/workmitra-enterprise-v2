// App name: Job Mitra
// File name: careerCandidateAnalysis.logic.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\candidateAnalysis\careerCandidateAnalysis.logic.ts

import type { CareerApplication, CareerJobPost } from "../../types/careerTypes";
import type { AnalyzedCandidate, CandidateAnalysisResult } from "./careerCandidateAnalysis.types";

export function analyzeCandidates(
  apps: CareerApplication[],
  post: CareerJobPost,
  shortlistCount: number,
  backupCount: number,
): CandidateAnalysisResult {
  const ranked = apps
    .map((app) => analyzeCandidate(app, post))
    .sort((a, b) => b.score - a.score || a.app.appliedAt - b.app.appliedAt);

  return {
    shortlist: ranked.slice(0, shortlistCount),
    backup: ranked.slice(shortlistCount, shortlistCount + backupCount),
    remaining: ranked.slice(shortlistCount + backupCount),
  };
}

export function clampNumber(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
}

function analyzeCandidate(app: CareerApplication, post: CareerJobPost): AnalyzedCandidate {
  const requiredSkills = post.skills.map((skill) => skill.trim().toLowerCase()).filter(Boolean);
  const candidateSkills =
    app.profileSnapshot?.skills?.map((skill) => skill.trim()).filter(Boolean) ?? [];

  const normalizedCandidateSkills = candidateSkills.map((skill) => skill.toLowerCase());
  const matchedSkills = requiredSkills.filter((skill) =>
    normalizedCandidateSkills.includes(skill),
  ).length;
  const skillRatio = requiredSkills.length > 0 ? matchedSkills / requiredSkills.length : 0;
  const skillScore = requiredSkills.length > 0 ? Math.round(skillRatio * 25) : 12;

  const questions = post.screeningQuestions ?? [];
  const answers = questions
    .map((question) => app.screeningAnswers?.[question.id])
    .filter((answer): answer is "yes" | "no" => answer === "yes" || answer === "no");

  const yesCount = answers.filter((answer) => answer === "yes").length;
  const noCount = answers.filter((answer) => answer === "no").length;
  const screeningScore =
    questions.length > 0
      ? Math.max(0, Math.round((yesCount / questions.length) * 35) - noCount * 4)
      : 18;

  const coverScore = app.coverNote.trim() ? 10 : 0;
  const salarySignal = getSalarySignal(app, post);
  const salaryScore =
    salarySignal === "Within range"
      ? 12
      : salarySignal === "Below range"
        ? 8
        : salarySignal === "Not specified"
          ? 2
          : 4;
  const noticeScore = app.noticePeriod.toLowerCase().includes("immediate")
    ? 5
    : app.noticePeriod
      ? 3
      : 0;
  const score = skillScore + screeningScore + coverScore + salaryScore + noticeScore;

  return {
    app,
    score,
    skillMatch: getCandidateSkillSummary(candidateSkills.length),
    screening: questions.length > 0 ? `${answers.length} responses` : "No questions",
    salary: salarySignal,
    coverNote: app.coverNote.trim() ? "Available" : "Missing",
    notice: app.noticePeriod || "Not specified",
    reason: "Suggested for manual review",
  };
}

function getCandidateSkillSummary(skillCount: number): string {
  if (skillCount <= 0) return "No skills listed";
  if (skillCount === 1) return "1 listed";
  return `${skillCount} listed`;
}

function getSalarySignal(app: CareerApplication, post: CareerJobPost): string {
  if (app.expectedSalary <= 0) return "Not specified";

  const max = post.salaryMax > 0 ? post.salaryMax : post.salaryMin;

  if (max > 0 && app.expectedSalary > max) return "Above range";
  if (post.salaryMin > 0 && app.expectedSalary < post.salaryMin) return "Below range";

  return "Within range";
}
