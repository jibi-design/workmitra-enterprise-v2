/** Job Mitra | onboardingConstants.ts | C:\projects\WorkMitra_Enterprise_v2\src\shared\components\onboardingConstants.ts */

export type OnboardingSlide = {
  title: string;
  message: string;
  icon: "welcome" | "profile" | "wmid" | "ready" | "company" | "postjob";
};

/**
 * Legacy key kept for old installs.
 * New role-specific onboarding should use EMPLOYEE_ONBOARDING_KEY / EMPLOYER_ONBOARDING_KEY.
 */
export const ONBOARDING_KEY = "wm_onboarding_complete_v1";

export const EMPLOYEE_ONBOARDING_KEY = "wm_employee_onboarding_complete_v1";
export const EMPLOYER_ONBOARDING_KEY = "wm_employer_onboarding_complete_v1";

export const EMPLOYEE_HOME_WELCOME_KEY = "wm_employee_home_welcome_seen_v1";
export const EMPLOYER_HOME_WELCOME_KEY = "wm_employer_home_welcome_seen_v1";

export const EMPLOYEE_SLIDES: readonly OnboardingSlide[] = [
  {
    icon: "welcome",
    title: "Welcome to Job Mitra",
    message: "One app. Find jobs, build trust, grow your career.",
  },
  {
    icon: "profile",
    title: "Step 1: Complete your profile",
    message: "Add your name, skills, and experience. This is what employers see first.",
  },
  {
    icon: "wmid",
    title: "Step 2: Get your ML ID",
    message: "Your unique Mitra Labs identity. Employers verify you using this ID.",
  },
  {
    icon: "ready",
    title: "You’re ready!",
    message: "Start by completing your profile. Good profiles get more job offers.",
  },
];

export const EMPLOYER_SLIDES: readonly OnboardingSlide[] = [
  {
    icon: "welcome",
    title: "Welcome to Job Mitra",
    message: "One app. Find workers, build trust, manage your workforce.",
  },
  {
    icon: "company",
    title: "Step 1: Set up your company",
    message: "Add your company name and details. Workers verify you using your ML ID.",
  },
  {
    icon: "postjob",
    title: "Step 2: Post your first job",
    message: "Create a shift post or career job. Workers will find and apply.",
  },
  {
    icon: "ready",
    title: "You’re ready!",
    message: "Start by setting up your company profile. Good profiles attract better workers.",
  },
];
