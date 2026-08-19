export type ContentReportDomain = "shift" | "career";

export type ContentReportReason =
  | "fake_pay"
  | "asks_money"
  | "harassment"
  | "discriminatory"
  | "duplicate_spam"
  | "other";

export type ContentReportStatus =
  | "submitted"
  | "in_review"
  | "upheld"
  | "dismissed"
  | "duplicate";

export type ContentCaseStatus = "open" | "triage" | "held" | "cleared" | "removed";

export type ModerationActionKind = "dismiss" | "hide" | "restore" | "remove";

export type ContentReportRow = {
  readonly reportId: string;
  readonly domain: ContentReportDomain;
  readonly targetPostId: string;
  readonly caseId: string;
  readonly status: ContentReportStatus;
  readonly createdAt: string;
};

export type ContentCaseView = {
  readonly caseId: string;
  readonly domain: ContentReportDomain;
  readonly targetPostId: string;
  readonly employerId: string | null;
  readonly openCount: number;
  readonly weightedScore: number;
  readonly queueStatus: ContentCaseStatus;
  readonly title: string | null;
  readonly companyName: string | null;
  readonly updatedAt: string;
};
