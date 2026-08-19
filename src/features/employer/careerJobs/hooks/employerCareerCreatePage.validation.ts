import type { StepBasicData } from "../components/CareerCreateStepBasic";
import type { StepInterviewData } from "../components/CareerCreateStepInterview";
import type { StepRequirementsData } from "../components/CareerCreateStepRequirements";
import { CREATE_PAGE_VALIDATION_STARTED_AT } from "../helpers/employerCareerCreatePage.helpers";
import { isValidPincode } from "../../../shared/location/pincode";

export function getStep1Errors(basic: StepBasicData): string[] {
  const errors: string[] = [];
  if (basic.companyName.trim().length < 2)
    errors.push("Company name is required (min 2 characters).");
  if (basic.jobTitle.trim().length < 2) errors.push("Job title is required (min 2 characters).");

  const vacancyCount = Number(basic.vacancies);

  if (!basic.vacancies.trim() || !Number.isInteger(vacancyCount) || vacancyCount < 1) {
    errors.push("Please specify at least 1 vacancy.");
  } else if (vacancyCount > 500) {
    errors.push("Vacancies cannot be more than 500 for one Career Job post.");
  }

  if (basic.workMode !== "remote" && basic.location.trim().length < 2) {
    errors.push("Reporting area is required for on-site/hybrid roles.");
  }
  if (!isValidPincode(basic.locationPincode)) {
    errors.push("Work area code is required.");
  }
  return errors;
}

export function getStep2Errors(req: StepRequirementsData): string[] {
  const errors: string[] = [];

  const salaryMinText = req.salaryMin.trim();
  const salaryMaxText = req.salaryMax.trim();
  const salaryMinRaw = Number(salaryMinText);
  const salaryMaxRaw = Number(salaryMaxText);
  const minSalary = salaryMinText ? salaryMinRaw : 0;
  const maxSalary = salaryMaxText ? salaryMaxRaw : 0;

  if (salaryMinText && !Number.isFinite(salaryMinRaw)) {
    errors.push("Minimum salary must be a valid number.");
  }

  if (salaryMaxText && !Number.isFinite(salaryMaxRaw)) {
    errors.push("Maximum salary must be a valid number.");
  }

  if (Number.isFinite(minSalary) && minSalary < 0) {
    errors.push("Minimum salary cannot be negative.");
  }

  if (Number.isFinite(maxSalary) && maxSalary < 0) {
    errors.push("Maximum salary cannot be negative.");
  }

  if (
    Number.isFinite(minSalary) &&
    Number.isFinite(maxSalary) &&
    maxSalary > 0 &&
    maxSalary < minSalary
  ) {
    errors.push("Maximum salary cannot be less than minimum salary.");
  }

  const experienceMinText = req.experienceMin.trim();
  const experienceMaxText = req.experienceMax.trim();
  const experienceMinRaw = Number(experienceMinText);
  const experienceMaxRaw = Number(experienceMaxText);
  const minExperience = experienceMinText ? experienceMinRaw : 0;
  const maxExperience = experienceMaxText ? experienceMaxRaw : 0;

  if (
    experienceMinText &&
    (!Number.isFinite(experienceMinRaw) || experienceMinRaw < 0 || experienceMinRaw > 50)
  ) {
    errors.push("Minimum experience must be between 0 and 50 years.");
  }

  if (
    experienceMaxText &&
    (!Number.isFinite(experienceMaxRaw) || experienceMaxRaw < 0 || experienceMaxRaw > 50)
  ) {
    errors.push("Maximum experience must be between 0 and 50 years.");
  }

  if (
    Number.isFinite(minExperience) &&
    Number.isFinite(maxExperience) &&
    maxExperience > 0 &&
    maxExperience < minExperience
  ) {
    errors.push("Maximum experience cannot be less than minimum experience.");
  }

  if (req.noticePeriodDays === "custom") {
    const customNoticeText = req.noticePeriodCustomDays.trim();
    const customNoticeDays = Number(customNoticeText);

    if (!customNoticeText) {
      errors.push("Custom notice period is required.");
    } else if (
      !Number.isInteger(customNoticeDays) ||
      customNoticeDays < 0 ||
      customNoticeDays > 365
    ) {
      errors.push("Custom notice period must be between 0 and 365 days.");
    }
  }

  if (!Number.isFinite(req.closingDate) || req.closingDate <= CREATE_PAGE_VALIDATION_STARTED_AT) {
    errors.push("Closing date must be a future date.");
  }

  return errors;
}

export function getStep3Errors(interview: StepInterviewData): string[] {
  const errors: string[] = [];
  if (interview.roundConfigs.length === 0) errors.push("At least 1 interview round is required.");
  for (const round of interview.roundConfigs) {
    if (!round.label.trim()) errors.push(`Round ${round.round} needs a name.`);
  }
  return errors;
}
