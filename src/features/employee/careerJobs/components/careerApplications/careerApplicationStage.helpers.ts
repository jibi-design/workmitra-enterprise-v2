import type { AppLite } from "../../types/careerApplicationTypes";

export function getApplicationStageIndex(stage: AppLite["stage"]): number {
  switch (stage) {
    case "applied":
      return 0;
    case "shortlisted":
      return 1;
    case "interview":
      return 2;
    case "offered":
    case "offer_accepted":
    case "offer_declined":
    case "hired":
    case "rejected":
    case "withdrawn":
      return 3;
    default:
      return 0;
  }
}

export function isFailedApplicationStage(stage: AppLite["stage"]): boolean {
  return ["rejected", "withdrawn", "offer_declined"].includes(stage as string);
}

export function getStepperLineWidth(currentIndex: number): string {
  if (currentIndex === 0) return "0%";
  if (currentIndex === 1) return "33%";
  if (currentIndex === 2) return "66%";
  return "calc(100% - 48px)";
}
