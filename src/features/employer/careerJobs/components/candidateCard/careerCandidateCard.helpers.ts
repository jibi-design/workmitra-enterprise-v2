import { getScreeningPills } from "../../helpers/careerCandidateCard.helpers";
import type { CareerCandidateCardProps } from "../../types/careerCandidateCard.types";
import { CAREER_AMBER, CAREER_BLUE, CAREER_GREEN } from "./careerCandidateCard.constants";

export function getEmployerScheduledInterview(app: CareerCandidateCardProps["app"]) {
  return (
    app.roundResults
      .filter((round) => round.status === "scheduled" && round.scheduledDate && round.scheduledTime)
      .sort((a, b) => a.round - b.round)[0] ?? null
  );
}

export function formatScheduleMode(mode: string | undefined): string {
  if (mode === "in-person") return "In-person";
  if (mode === "phone") return "Phone";
  if (mode === "video") return "Video call";
  return "Interview";
}

export function formatScheduleDate(dateValue: string | undefined): string {
  if (!dateValue) return "Not set";

  const date = new Date(`${dateValue}T00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatScheduleTime(timeValue: string | undefined): string {
  if (!timeValue) return "Not set";

  const date = new Date(`2000-01-01T${timeValue}`);
  if (Number.isNaN(date.getTime())) return timeValue;

  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isExternalMeetingLink(value: string | undefined): boolean {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function workerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "WM";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function shouldShowCandidateContact(tab: CareerCandidateCardProps["tab"]): boolean {
  return tab === "shortlisted" || tab === "interview" || tab === "offered" || tab === "hired";
}

export function getAnswerResponseText(answeredCount: number, totalCount: number): string {
  if (totalCount <= 0) return "None";
  return `${answeredCount}/${totalCount}`;
}

export function getCandidateFitSignal(
  app: CareerCandidateCardProps["app"],
  post: CareerCandidateCardProps["post"],
  screeningPills: ReturnType<typeof getScreeningPills>,
): { label: string; color: string; yesCount: number; noCount: number } {
  const requiredSkills = post.skills.map((skill) => skill.trim().toLowerCase()).filter(Boolean);
  const candidateSkills =
    app.profileSnapshot?.skills?.map((skill) => skill.trim().toLowerCase()).filter(Boolean) ?? [];
  const matchedSkills = requiredSkills.filter((skill) => candidateSkills.includes(skill)).length;
  const skillRatio = requiredSkills.length > 0 ? matchedSkills / requiredSkills.length : 1;

  const yesCount = screeningPills.filter((item) => item.answer === "yes").length;
  const noCount = screeningPills.filter((item) => item.answer === "no").length;

  if (noCount > 0) return { label: "Review needed", color: CAREER_AMBER, yesCount, noCount };
  if (skillRatio >= 0.6 && app.coverNote.trim())
    return { label: "Good fit", color: CAREER_GREEN, yesCount, noCount };
  return { label: "Check profile", color: CAREER_BLUE, yesCount, noCount };
}
