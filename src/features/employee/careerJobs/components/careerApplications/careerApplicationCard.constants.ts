// Shared career application card tokens.

import type { AppLite } from "../../types/careerApplicationTypes";

export const CAREER_BLUE = "#1d4ed8";
export const CAREER_MUTED = "#64748b";

type AppWithEmployerFeedback = AppLite & { feedback?: string };

export function getEmployerFeedback(app: AppLite): string | null {
  const feedback = (app as AppWithEmployerFeedback).feedback;
  return typeof feedback === "string" && feedback.trim() ? feedback.trim() : null;
}
