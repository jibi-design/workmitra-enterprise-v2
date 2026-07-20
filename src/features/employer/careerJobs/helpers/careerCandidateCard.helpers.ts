// App name: Job Mitra
// File name: careerCandidateCard.helpers.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\helpers\careerCandidateCard.helpers.ts

import type { CareerApplication, CareerJobPost } from "../types/careerTypes";

export const SHOW_SHORTLIST_DOCUMENT_BUTTON = true;

type ScreeningAnswerValue = "yes" | "no";

type ScreeningPill = {
  id: string;
  label: string;
  answer: ScreeningAnswerValue;
};

export function getNextSchedulableRound(
  app: CareerApplication,
  totalRounds: number,
): number | null {
  for (let round = 1; round <= totalRounds; round += 1) {
    const result = app.roundResults.find((item) => item.round === round);

    if (!result) return round;
    if (result.status === "scheduled" || result.status === "failed") return null;
  }

  return null;
}

function getScheduledRoundDateTimeMs(
  round: CareerApplication["roundResults"][number],
): number | null {
  const dateValue = round.scheduledDate?.trim();
  const timeValue = round.scheduledTime?.trim();

  if (!dateValue || !timeValue) return null;

  const scheduledDateTime = new Date(`${dateValue}T${timeValue}`);

  if (Number.isNaN(scheduledDateTime.getTime())) return null;

  return scheduledDateTime.getTime();
}

function isScheduledRoundReadyForResult(round: CareerApplication["roundResults"][number]): boolean {
  const scheduledAt = getScheduledRoundDateTimeMs(round);

  return scheduledAt !== null && scheduledAt <= Date.now();
}

export function getRecordableRound(app: CareerApplication): number | null {
  const scheduled = app.roundResults.find(
    (item) => item.status === "scheduled" && isScheduledRoundReadyForResult(item),
  );

  return scheduled ? scheduled.round : null;
}

export function allRoundsPassed(app: CareerApplication, totalRounds: number): boolean {
  if (app.roundResults.length < totalRounds) return false;

  return app.roundResults
    .filter((item) => item.round >= 1 && item.round <= totalRounds)
    .every((item) => item.status === "passed");
}

export function getCandidateTitle(app: CareerApplication): string {
  return (
    app.profileSnapshot?.uniqueId ??
    app.employeeName ??
    `Candidate ${app.id.slice(-6).toUpperCase()}`
  );
}

export function getCandidateWorkerName(app: CareerApplication): string {
  return app.profileSnapshot?.fullName ?? app.employeeName ?? getCandidateTitle(app);
}

export function getCandidateWorkerWmId(app: CareerApplication): string {
  return app.profileSnapshot?.uniqueId ?? app.id;
}

export function getScreeningPills(app: CareerApplication, post: CareerJobPost): ScreeningPill[] {
  const questions = post.screeningQuestions ?? [];
  const answers = normalizeScreeningAnswers(app.screeningAnswers);

  if (questions.length === 0 || answers.entries.length === 0) {
    return [];
  }

  return questions.flatMap((question, index) => {
    const answer =
      answers.byKey.get(question.id) ??
      answers.byKey.get(question.text) ??
      answers.byKey.get(normalizeQuestionKey(question.text)) ??
      answers.values[index];

    if (!answer) return [];

    return [
      {
        id: question.id,
        label: question.text,
        answer,
      },
    ];
  });
}

function normalizeScreeningAnswers(input: CareerApplication["screeningAnswers"]): {
  byKey: Map<string, ScreeningAnswerValue>;
  values: ScreeningAnswerValue[];
  entries: [string, ScreeningAnswerValue][];
} {
  const byKey = new Map<string, ScreeningAnswerValue>();
  const values: ScreeningAnswerValue[] = [];
  const entries: [string, ScreeningAnswerValue][] = [];

  if (!input) {
    return { byKey, values, entries };
  }

  Object.entries(input).forEach(([key, value]) => {
    if (!isScreeningAnswerValue(value)) return;

    entries.push([key, value]);
    values.push(value);

    byKey.set(key, value);
    byKey.set(normalizeQuestionKey(key), value);
  });

  return { byKey, values, entries };
}

function normalizeQuestionKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function isScreeningAnswerValue(value: unknown): value is ScreeningAnswerValue {
  return value === "yes" || value === "no";
}
