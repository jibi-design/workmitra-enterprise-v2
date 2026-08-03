import type { NoticeData } from "../../../../shared/components/NoticeModal";
import type { ScreeningQuestion } from "../components/CareerCreateScreeningSection";
import type { StepBasicData } from "../components/CareerCreateStepBasic";
import type { StepInterviewData } from "../components/CareerCreateStepInterview";
import type { StepRequirementsData } from "../components/CareerCreateStepRequirements";
import { DEFAULT_INTERVIEW_ROUNDS, tomorrow30d } from "../helpers/careerCreateFormHelpers";
import { careerCreateDraftStorage } from "../storage/careerCreateDraft.storage";

type EmployerDefaults = {
  companyName: string;
  location: string;
};

export function createFreshBasicState(employerDefaults: EmployerDefaults): StepBasicData {
  return {
    companyName: employerDefaults.companyName,
    jobTitle: "",
    department: "",
    jobType: "full-time",
    workMode: "on-site",
    location: employerDefaults.location,
    vacancies: "",
    probationPeriod: "none",
  };
}

export function createFreshRequirementsState(): StepRequirementsData {
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
    closingDate: tomorrow30d(),
  };
}

export function createFreshInterviewState(): StepInterviewData {
  return { roundConfigs: [...DEFAULT_INTERVIEW_ROUNDS] };
}

export function saveEmployerCareerCreateDraft(params: {
  step: number;
  basic: StepBasicData;
  req: StepRequirementsData;
  interview: StepInterviewData;
  screeningQuestions: ScreeningQuestion[];
  showNotice: boolean;
  setHasLoadedDraft: (value: boolean) => void;
  setNotice: (notice: NoticeData | null) => void;
}): void {
  const result = careerCreateDraftStorage.save({
    step: params.step,
    basic: params.basic,
    req: params.req,
    interview: params.interview,
    screeningQuestions: params.screeningQuestions,
  });

  if (!result.ok) {
    if (params.showNotice) {
      params.setNotice({
        title: "Draft Not Saved",
        message:
          result.reason === "no_scope"
            ? "Complete your company profile before saving a Career Job draft."
            : "Browser storage is unavailable. Your draft could not be saved on this device.",
        tone: "warn",
      });
    }
    return;
  }

  params.setHasLoadedDraft(true);
  if (params.showNotice) {
    params.setNotice({ title: "Draft Saved", message: "Your Career Job draft is saved." });
  }
}

export function clearEmployerCareerCreateDraft(): void {
  careerCreateDraftStorage.clear();
}
