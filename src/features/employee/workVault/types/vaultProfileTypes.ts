// src/features/employee/workVault/types/vaultProfileTypes.ts
//
// Work Vault v2 — All profile section types.
// Pure types only — no logic, no imports, no side effects.

// ─────────────────────────────────────────────────────────────────────────────
// Section 2: Professional Summary (Manual entry)
// ─────────────────────────────────────────────────────────────────────────────

export type EmploymentStatus = "employed" | "available" | "not_looking";

export type ExpectedRoleType = "full-time" | "part-time" | "contract";

export type NoticePeriod =
  | "immediate"
  | "2_weeks"
  | "1_month"
  | "2_months"
  | "3_months";

export type VaultProfessionalSummary = {
  headline: string;
  employmentStatus: EmploymentStatus;
  employmentStatusAuto: boolean;
  currentCompany: string;
  expectedRoleType: ExpectedRoleType;
  noticePeriod: NoticePeriod;
};

// ─────────────────────────────────────────────────────────────────────────────
// Section 3: Work Experience (Auto from Career Jobs)
// ─────────────────────────────────────────────────────────────────────────────

export type WorkExperienceStatus =
  | "hired"
  | "completed"
  | "left"
  | "terminated";

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

// ─────────────────────────────────────────────────────────────────────────────
// Section 4: Work Stats (Auto from all domains)
// ─────────────────────────────────────────────────────────────────────────────

export type VaultWorkStats = {
  totalCareerPositions: number;
  verifiedPositions: number;
  totalShiftsCompleted: number;
  totalWorkforceCompanies: number;
  totalCompaniesWorked: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Section 5: Education & Certifications (Manual entry)
// ─────────────────────────────────────────────────────────────────────────────

export type EducationLevel =
  | "none"
  | "high_school"
  | "diploma"
  | "degree"
  | "masters"
  | "phd";

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

// ─────────────────────────────────────────────────────────────────────────────
// Section 6: Skills Assessment (Mixed — profile + endorsements)
// ─────────────────────────────────────────────────────────────────────────────

export type SkillProficiency = "beginner" | "intermediate" | "expert";

export type VaultSkillEntry = {
  name: string;
  proficiency: SkillProficiency;
  endorsedByCount: number;
  endorsedByCompanies: string[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Section 7: Performance Record (Auto from Shift + Workforce)
// ─────────────────────────────────────────────────────────────────────────────

export type VaultPerformanceRecord = {
  overallRating: number | null;
  totalReviews: number;
  ratingBreakdown: { star5: number; star4: number; star3: number; star2: number; star1: number };
  attendanceRate: number | null;
  reliabilityScore: number | null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Section 8: References (Auto — all employers with ratings)
// ─────────────────────────────────────────────────────────────────────────────

export type VaultReference = {
  companyName: string;
  rating: number;
  source: "shift" | "workforce" | "career";
};

// ─────────────────────────────────────────────────────────────────────────────
// Section 9: Achievements & Milestones (Auto-generated)
// ─────────────────────────────────────────────────────────────────────────────

export type AchievementId =
  | "first_shift"
  | "shifts_5"
  | "shifts_10"
  | "shifts_25"
  | "first_career_hire"
  | "career_hires_3"
  | "first_5star"
  | "star_streak_3"
  | "zero_cancellations"
  | "profile_complete"
  | "first_review"
  | "reviews_10";

export type VaultAchievement = {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt: number | null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Section 10: Activity & Engagement
// ─────────────────────────────────────────────────────────────────────────────

export type VaultActivityData = {
  memberSince: number;
  lastActive: number;
  responseRate: number | null;
  profileViewsThisMonth: number | null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Combined Manual Profile (stored in localStorage)
// ─────────────────────────────────────────────────────────────────────────────

export type VaultManualProfile = {
  professionalSummary: VaultProfessionalSummary;
  education: VaultEducation;
  skillProficiencies: Record<string, SkillProficiency>;
};