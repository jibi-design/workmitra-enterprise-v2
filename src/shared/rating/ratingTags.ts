// src/shared/rating/ratingTags.ts
//
// Rating tag definitions for both sides.
// Employer → Worker tags + Worker → Employer tags.

import type { EmployerWorkerTag, WorkerEmployerTag } from "./ratingTypes";

/* ------------------------------------------------ */
/* Employer → Worker Tags                           */
/* ------------------------------------------------ */
export const EMPLOYER_WORKER_TAGS: EmployerWorkerTag[] = [
  "On time",
  "Skilled",
  "Professional",
  "Reliable",
  "Hard working",
  "Good communication",
  "Would hire again",
];

/* ------------------------------------------------ */
/* Worker → Employer Tags                           */
/* ------------------------------------------------ */
export const WORKER_EMPLOYER_TAGS: WorkerEmployerTag[] = [
  "Paid on time",
  "Respectful",
  "Safe workplace",
  "Good communication",
  "Clear instructions",
  "Would work again",
];

/* ------------------------------------------------ */
/* Star label helper                                */
/* ------------------------------------------------ */
export const STAR_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "Poor",
  2: "Below Average",
  3: "Average",
  4: "Good",
  5: "Excellent",
};