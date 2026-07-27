import type { EmployeeShiftApplication } from "../../shiftJobs/storage/employerShift.storage";

export type QuickQuestion = {
  id: string;
  text: string;
};

type QuickAnswerPillData = {
  id: string;
  label: string;
  answer: "yes" | "no";
};

export function getAnalysisReason(app: EmployeeShiftApplication): string {
  const mustAnswers = Object.values(app.mustHaveAnswers);
  const goodAnswers = Object.values(app.goodToHaveAnswers);
  const profile = app.profileSnapshot;

  const mustMeets = mustAnswers.filter((answer) => answer === "meets").length;
  const goodMeets = goodAnswers.filter((answer) => answer === "meets").length;
  const hasProfile = Boolean(profile?.fullName || profile?.city || profile?.skills?.length);

  if (app.priorityTag === "priority") {
    return "Strong requirement match. Review details before final confirmation.";
  }

  if (app.priorityTag === "good") {
    return "Good match evidence found. Check requirements before shortlisting.";
  }

  if (!hasProfile) {
    return "Profile details are limited. Manual review is required.";
  }

  if (mustMeets === 0 && goodMeets === 0) {
    return "Requirement answers are missing or weak. Manual review is required.";
  }

  return "Some match evidence exists. Employer review is still required.";
}

export function getQuickAnswerPills(
  app: EmployeeShiftApplication,
  quickQuestions: QuickQuestion[],
): QuickAnswerPillData[] {
  return quickQuestions.flatMap((question) => {
    const answer = app.quickAnswers?.[question.id];

    if (!answer) return [];

    return [{ id: question.id, label: question.text, answer }];
  });
}
