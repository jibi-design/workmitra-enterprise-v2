import { describe, expect, it } from "vitest";
import { isEmployerCareerCreateDirty } from "./employerCareerCreatePage.helpers";
import type { StepBasicData } from "../components/CareerCreateStepBasic";
import type { StepRequirementsData } from "../components/CareerCreateStepRequirements";

const defaults = { companyName: "Lab Demo Corp", location: "Area 1" };

function basic(partial: Partial<StepBasicData> = {}): StepBasicData {
  return {
    companyName: defaults.companyName,
    jobTitle: "",
    department: "",
    jobType: "full-time",
    workMode: "on-site",
    location: defaults.location,
    locationPincode: "",
    vacancies: "",
    probationPeriod: "none",
    ...partial,
  };
}

function req(partial: Partial<StepRequirementsData> = {}): StepRequirementsData {
  return {
    salaryMin: "",
    salaryMax: "",
    salaryPeriod: "monthly",
    experienceMin: "",
    experienceMax: "",
    noticePeriodDays: "30",
    noticePeriodCustomDays: "",
    qualifications: "",
    skills: "",
    description: "",
    responsibilities: "",
    closingDate: 1,
    ...partial,
  };
}

describe("isEmployerCareerCreateDirty", () => {
  it("treats profile defaults as clean", () => {
    expect(isEmployerCareerCreateDirty(basic(), req(), 0, defaults)).toBe(false);
  });

  it("marks a job title as dirty", () => {
    expect(isEmployerCareerCreateDirty(basic({ jobTitle: "Ops Lead" }), req(), 0, defaults)).toBe(
      true,
    );
  });
});
