// App name: Job Mitra
// File name: vaultProfileTypes.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\types\vaultProfileTypes.ts

export type EmploymentStatus = "employed" | "available" | "not_looking";

export type ExpectedRoleType = "full-time" | "part-time" | "contract";

export type NoticePeriod = "immediate" | "2_weeks" | "1_month" | "2_months" | "3_months";

export type VaultProfessionalSummary = {
  headline: string;
  employmentStatus: EmploymentStatus;
  employmentStatusAuto: boolean;
  currentCompany: string;
  expectedRoleType: ExpectedRoleType;
  noticePeriod: NoticePeriod;
};

export type WorkExperienceStatus = "hired" | "completed" | "left" | "terminated";

export type VaultWorkExperienceEntry = {
  jobId: string;
  companyName: string;
  jobTitle: string;
  department: string;
  location: string;
  hiredAt: number;
  endedAt: number | null;
  status: WorkExperienceStatus;
  employerRating: number | null;
};

export type VaultWorkStats = {
  totalCareerPositions: number;
  verifiedPositions: number;
  totalShiftsCompleted: number;
  /** Finalized + open planner epoch summaries (Hybrid A2 P1.4). */
  totalPlannerEpochs: number;
  totalWorkforceCompanies: number;
  totalCompaniesWorked: number;
};

export type EducationLevel = "none" | "high_school" | "diploma" | "degree" | "masters" | "phd";

export type VaultCertification = {
  id: string;
  name: string;
  issuedBy: string;
  issueDate: string;
  expiryDate: string | null;
  linkedDocId: string | null;
};

export type VaultEducation = {
  level: EducationLevel;
  certifications: VaultCertification[];
};

export type SkillProficiency = "beginner" | "intermediate" | "expert";

export type VaultSkillEntry = {
  name: string;
  proficiency: SkillProficiency;
  endorsedByCount: number;
  endorsedByCompanies: string[];
};

export type VaultPerformanceRecord = {
  overallRating: number | null;
  totalReviews: number;
  ratingBreakdown: { star5: number; star4: number; star3: number; star2: number; star1: number };
  attendanceRate: number | null;
  reliabilityScore: number | null;
  /**
   * Domain-separated averages for UI only.
   * Planner must NEVER be folded into overallRating (Hybrid A2).
   */
  domainRatings: {
    career: VaultDomainRatingSummary;
    shift: VaultDomainRatingSummary;
    planner: VaultDomainRatingSummary;
  };
};

export type VaultDomainRatingSummary = {
  average: number | null;
  count: number;
};

/** Slim planner epoch row for Profile timeline (Hybrid A2 / Vault V1). */
export type VaultPlannerTimelineEntry = {
  id: string;
  planId: string;
  planName: string;
  companyName: string;
  epochIndex: number;
  epochStart: number;
  epochEnd: number;
  daysScheduled: number;
  daysCompleted: number;
  attendanceRate: number;
  reliabilityScore: number;
  vaultFinalized: boolean;
  rating: number | null;
  completedAt: number;
};

export type VaultPlannerGrowthData = {
  epochs: VaultPlannerTimelineEntry[];
  totalEpochs: number;
  finalizedEpochs: number;
  totalPlans: number;
  /** Schedule fulfillment / availability proxy (0–100). */
  availabilityScore: number | null;
  /** Planner reliability average (0–100). */
  reliabilityScore: number | null;
  /** Planner-only star average — never mixed into overallRating. */
  plannerRatingAverage: number | null;
  plannerRatingCount: number;
};

export type VaultReference = {
  companyName: string;
  rating: number;
  source: "shift" | "workforce" | "career" | "planner";
  jobId?: string;
  jobTitle?: string;
  comment?: string;
  tags?: string[];
  hireAgain?: boolean;
  createdAt?: number;
  editedAt?: number | null;
};

export type AchievementGroup = "shift" | "career" | "planner" | "reputation" | "profile";

export type AchievementDisplayState = "latest_earned" | "next_goal" | "locked";

export type AchievementId = string;

export type VaultAchievement = {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt: number | null;
  group: AchievementGroup;
  displayState: AchievementDisplayState;
  currentValue: number;
  targetValue: number;
};

export type VaultActivityData = {
  memberSince: number;
  lastActive: number;
  responseRate: number | null;
  profileViewsThisMonth: number | null;
};

export type VaultManualProfile = {
  professionalSummary: VaultProfessionalSummary;
  education: VaultEducation;
  skillProficiencies: Record<string, SkillProficiency>;
};
