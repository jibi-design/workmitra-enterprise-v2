// src/shared/components/onboardingConstants.ts
//
// Onboarding slide content for both roles.
// Action-oriented: "exactly what to do next".
// NOT a feature tour.

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
export type OnboardingSlide = {
  title: string;
  message: string;
  icon: "welcome" | "profile" | "wmid" | "ready" | "company" | "postjob";
};

/* ------------------------------------------------ */
/* Storage key — one-time flag                      */
/* ------------------------------------------------ */
export const ONBOARDING_KEY = "wm_onboarding_complete_v1";

/* ------------------------------------------------ */
/* Employee slides                                  */
/* ------------------------------------------------ */
export const EMPLOYEE_SLIDES: readonly OnboardingSlide[] = [
  {
    icon: "welcome",
    title: "Welcome to WorkMitra",
    message: "One app. Find jobs, build trust, grow your career.",
  },
  {
    icon: "profile",
    title: "Step 1: Complete your profile",
    message: "Add your name, skills, and experience. This is what employers see first.",
  },
  {
    icon: "wmid",
    title: "Step 2: Get your WM ID",
    message: "Your unique work identity. Employers verify you using this ID.",
  },
  {
    icon: "ready",
    title: "You\u2019re ready!",
    message: "Start by completing your profile. Good profiles get more job offers.",
  },
];

/* ------------------------------------------------ */
/* Employer slides                                  */
/* ------------------------------------------------ */
export const EMPLOYER_SLIDES: readonly OnboardingSlide[] = [
  {
    icon: "welcome",
    title: "Welcome to WorkMitra",
    message: "One app. Find workers, build trust, manage your workforce.",
  },
  {
    icon: "company",
    title: "Step 1: Set up your company",
    message: "Add your company name and details. Workers verify you using your WM ID.",
  },
  {
    icon: "postjob",
    title: "Step 2: Post your first job",
    message: "Create a shift post or career job. Workers will find and apply.",
  },
  {
    icon: "ready",
    title: "You\u2019re ready!",
    message: "Start by setting up your company profile. Good profiles attract better workers.",
  },
];