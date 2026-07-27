// App name: Job Mitra
// File name: employeeCareerApplicationsPage.helpers.ts

import type { PulseNodeId } from "../../../../features/pulse/pulseStore";
import type { Tab } from "../types/careerApplicationTypes";

export type EmployeeApplicationPulseTarget = {
  readonly pulseId: PulseNodeId;
};

export function getEmployeeApplicationPulseTarget(
  stage: string,
): EmployeeApplicationPulseTarget | null {
  if (stage === "shortlisted") {
    return { pulseId: "career-applications-shortlisted" };
  }

  if (stage === "interview") {
    return { pulseId: "career-funnel-interviews" };
  }

  if (stage === "offered" || stage === "offer_accepted") {
    return { pulseId: "career-applications-offers" };
  }

  return null;
}

export function getPulseTabOverride(activePulseNodeId: PulseNodeId | null): Tab | null {
  if (activePulseNodeId === "career-funnel-interviews") {
    return "interview";
  }

  if (activePulseNodeId === "career-applications-offers") {
    return "offers";
  }

  if (activePulseNodeId === "career-applications-shortlisted") {
    return "active";
  }

  return null;
}
