/** Job Mitra | careerApplications.smartResume.ts | Employee Career Applications landing */

import type { Tab, TabCounts } from "../types/careerApplicationTypes";

export function parseEmployeeCareerApplicationsTab(raw: string | null): Tab | null {
  if (
    raw === "active" ||
    raw === "interview" ||
    raw === "offers" ||
    raw === "closed" ||
    raw === "all"
  ) {
    return raw;
  }
  return null;
}

export function resolveEmployeeCareerApplicationsTab(counts: TabCounts): Tab {
  if (counts.offers > 0) return "offers";
  if (counts.interview > 0) return "interview";
  if (counts.active > 0) return "active";
  return "active";
}

export function employeeCareerApplicationsBannerCopy(counts: TabCounts): {
  readonly title: string;
  readonly message: string;
} | null {
  if (counts.offers > 0) {
    return {
      title: `${counts.offers} offer${counts.offers === 1 ? "" : "s"} need a response`,
      message: "Open Offers to accept or decline. Do not leave an offer waiting.",
    };
  }
  if (counts.interview > 0) {
    return {
      title: `${counts.interview} interview${counts.interview === 1 ? "" : "s"} scheduled`,
      message: "Open Interviews to RSVP or prepare for the next round.",
    };
  }
  return null;
}
