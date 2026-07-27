export type CareerEmploymentFeedbackState = "pending" | "remind_later" | "dismissed" | "completed";

export type CareerEmploymentFeedbackTag =
  | "reliable"
  | "punctual"
  | "good_communication"
  | "completed_assigned_work"
  | "followed_workplace_instructions"
  | "eligible_for_rehire";

export type CareerEmploymentFeedbackEditEvent = {
  editedAt: number;
};

export type CareerEmploymentFeedbackTask = {
  id: string;
  staffId: string;
  careerPostId?: string;
  employeeUniqueId: string;
  employeeName: string;
  jobTitle: string;
  companyName: string;
  state: CareerEmploymentFeedbackState;
  createdAt: number;
  updatedAt: number;
  remindUntil?: number;
  dismissedAt?: number;
  completedAt?: number;
  editWindowExpiresAt?: number;
  editCount?: number;
  editHistory?: CareerEmploymentFeedbackEditEvent[];
  selectedTags?: CareerEmploymentFeedbackTag[];
  privateNote?: string;
};

export type CareerEmploymentFeedbackHomeSnapshot = {
  pendingCount: number;
  latestTask: CareerEmploymentFeedbackTask | null;
};

export type CareerEmploymentFeedbackStaffSnapshot = {
  task: CareerEmploymentFeedbackTask | null;
  canEdit: boolean;
};

export type CareerEmploymentFeedbackCompletedSnapshot = {
  task: CareerEmploymentFeedbackTask | null;
};

export type CareerEmploymentFeedbackApprovedSummarySnapshot = {
  tasks: CareerEmploymentFeedbackTask[];
};

export const CAREER_EMPLOYMENT_FEEDBACK_TAGS: readonly {
  value: CareerEmploymentFeedbackTag;
  label: string;
}[] = [
  { value: "reliable", label: "Reliable" },
  { value: "punctual", label: "Punctual" },
  { value: "good_communication", label: "Good communication" },
  { value: "completed_assigned_work", label: "Completed assigned work" },
  { value: "followed_workplace_instructions", label: "Followed workplace instructions" },
  { value: "eligible_for_rehire", label: "Eligible for rehire" },
] as const;
