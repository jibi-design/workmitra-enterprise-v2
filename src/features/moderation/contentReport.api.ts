/** Employee + admin content-report API. Domain stays in the path (Shift ≠ Career). */

import { AUTH_BACKEND_ENABLED } from "../../shared/config/authConfig";
import { apiService } from "../../shared/services/apiService";
import type { ContentReportDomain, ContentReportReason } from "./contentReport.types";

type Envelope<T> = { data: T };

function employeePrefix(domain: ContentReportDomain): string {
  return domain === "shift"
    ? "/v1/jobmitra/employee/shift"
    : "/v1/jobmitra/employee/career";
}

export async function fetchHasReported(
  domain: ContentReportDomain,
  postId: string,
): Promise<boolean> {
  if (!AUTH_BACKEND_ENABLED) return false;
  const res = await apiService.get<Envelope<{ reported: boolean }>>(
    `${employeePrefix(domain)}/posts/${encodeURIComponent(postId)}/reports/mine`,
  );
  return Boolean(res.data?.reported);
}

export async function submitContentReport(input: {
  domain: ContentReportDomain;
  postId: string;
  reasonCode: ContentReportReason;
  note?: string;
  employerId?: string;
  title?: string;
  companyName?: string;
}): Promise<{ reportId: string; caseId: string }> {
  const res = await apiService.post<Envelope<{ reportId: string; caseId: string }>>(
    `${employeePrefix(input.domain)}/posts/${encodeURIComponent(input.postId)}/reports`,
    {
      reasonCode: input.reasonCode,
      note: input.note,
      employerId: input.employerId,
      snapshot: { title: input.title, companyName: input.companyName },
    },
  );
  return res.data;
}

export type AdminModerationCase = {
  readonly caseId: string;
  readonly domain: ContentReportDomain;
  readonly targetPostId: string;
  readonly openCount: number;
  readonly weightedScore: number;
  readonly queueStatus: string;
  readonly title: string | null;
  readonly companyName: string | null;
  readonly updatedAt: string;
};

export async function fetchModerationCases(
  status?: string,
): Promise<AdminModerationCase[]> {
  if (!AUTH_BACKEND_ENABLED) return [];
  const res = await apiService.get<Envelope<{ cases: AdminModerationCase[] }>>(
    "/v1/jobmitra/admin/moderation/cases",
    status ? { status } : undefined,
  );
  return res.data?.cases ?? [];
}

export async function submitModerationAction(
  caseId: string,
  action: "dismiss" | "hide" | "restore" | "remove",
): Promise<void> {
  await apiService.post(`/v1/jobmitra/admin/moderation/cases/${encodeURIComponent(caseId)}/actions`, {
    action,
  });
}
