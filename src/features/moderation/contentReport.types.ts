export type ContentReportDomain = "shift" | "career";

export type ContentReportReason =
  | "fake_pay"
  | "asks_money"
  | "harassment"
  | "discriminatory"
  | "duplicate_spam"
  | "other";

export const CONTENT_REPORT_REASON_OPTIONS: ReadonlyArray<{
  readonly value: ContentReportReason;
  readonly label: string;
}> = [
  { value: "fake_pay", label: "Fake or misleading pay / hours" },
  { value: "asks_money", label: "Asks for money or off-platform payment" },
  { value: "harassment", label: "Harassment or unsafe work" },
  { value: "discriminatory", label: "Discriminatory or illegal ask" },
  { value: "duplicate_spam", label: "Duplicate or spam posting" },
  { value: "other", label: "Other" },
];
