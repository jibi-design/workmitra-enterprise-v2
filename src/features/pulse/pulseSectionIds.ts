/** Job Mitra | pulseSectionIds.ts | src/features/pulse/pulseSectionIds.ts */

export const PulseSectionId = {
  EMPLOYEE_CAREER_UPDATE_CARD: "employee.career.update.card",
  EMPLOYEE_APPLICATION_SHORTLISTED_CARD: "employee.application.shortlisted.card",
  EMPLOYEE_APPLICATION_INTERVIEW_CARD: "employee.application.interview.card",
  EMPLOYEE_APPLICATION_OFFER_CARD: "employee.application.offer.card",

  EMPLOYER_SHIFT_APPLICATION_CARD: "employer.shift.application.card",
  EMPLOYEE_SHIFT_SHORTLISTED_CARD: "employee.shift.shortlisted.card",
  EMPLOYEE_SHIFT_WAITLISTED_CARD: "employee.shift.waitlisted.card",
  EMPLOYEE_SHIFT_CONFIRMATION_CARD: "employee.shift.confirmation.card",
  EMPLOYEE_SHIFT_SELECTED_CARD: "employee.shift.selected.card",

  // Employer — Shift workforce actions
  EMPLOYER_SHIFT_CONFIRMED_ROSTER: "employer.shift.confirmed.roster",
  EMPLOYER_SHIFT_REPLACEMENT_NEEDED: "employer.shift.replacement.needed",
  EMPLOYER_SHIFT_COMPLETED_CARD: "employer.shift.completed.card",
  EMPLOYEE_SHIFT_PLAN_CANCELLED_CARD: "employee.shift.plan.cancelled.card",
  EMPLOYEE_PLAN_CANCELLED_CARD: "employee.plan.cancelled.card",
} as const;

export type PulseSectionId = (typeof PulseSectionId)[keyof typeof PulseSectionId];
