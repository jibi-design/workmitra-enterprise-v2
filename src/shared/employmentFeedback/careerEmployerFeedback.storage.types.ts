export type CareerEmployerFeedbackState = "pending" | "remind_later" | "dismissed" | "completed";

export type CareerEmployerFeedbackTag =
  | "work_matched_job_offer"
  | "payment_clarity"
  | "clear_communication"
  | "respectful_workplace"
  | "work_timing_clarity"
  | "would_work_again"
  | "role_clarity"
  | "fair_treatment";

export type CareerEmployerFeedbackSourceRecord = {
  id: string;
  careerPostId: string;
  companyName: string;
  jobTitle: string;
  status: string;
  exitedAt?: number;
};

export type CareerEmployerFeedbackEditEvent = {
  editedAt: number;
};

export type CareerEmployerFeedbackTask = {
  id: string;
  employmentId: string;
  careerPostId: string;
  companyName: string;
  jobTitle: string;
  state: CareerEmployerFeedbackState;
  feedbackWindowExpiresAt: number;
  remindUntil?: number;
  dismissedAt?: number;
  completedAt?: number;
  editWindowExpiresAt?: number;
  editCount?: number;
  editHistory?: CareerEmployerFeedbackEditEvent[];
  selectedTags?: CareerEmployerFeedbackTag[];
  privateComment?: string;
  createdAt: number;
  updatedAt: number;
};

export type CareerEmployerFeedbackRecordSnapshot = {
  task: CareerEmployerFeedbackTask | null;
  canSubmit: boolean;
  canEdit: boolean;
  isExpired: boolean;
  daysLeft: number;
};

export type CareerEmployerFeedbackHomeSnapshot = {
  pendingCount: number;
  latestTask: CareerEmployerFeedbackTask | null;
};

export const CAREER_EMPLOYER_FEEDBACK_TAGS: readonly {
  value: CareerEmployerFeedbackTag;
  label: string;
}[] = [
  { value: "work_matched_job_offer", label: "Work matched job offer" },
  { value: "payment_clarity", label: "Payment / settlement clarity" },
  { value: "clear_communication", label: "Clear communication" },
  { value: "respectful_workplace", label: "Respectful workplace" },
  { value: "work_timing_clarity", label: "Work timing clarity" },
  { value: "would_work_again", label: "Would work again" },
] as const;
