export type CareerApplyInput = {
  jobId: string;
  coverNote: string;
  expectedSalary: number;
  noticePeriod: string;
  employeePhone?: string;
  employeeEmail?: string;
  resumeSummary?: string;
  screeningAnswers?: Record<string, "yes" | "no">;
};

export type AcceptCareerOfferResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "not_found"
        | "invalid_stage"
        | "post_inactive"
        | "invalid_offer"
        | "application_write_error"
        | "api_error";
    };
