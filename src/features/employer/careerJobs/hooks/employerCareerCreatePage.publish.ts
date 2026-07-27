import type { NavigateFunction } from "react-router-dom";
import { getCurrentActorId, identityBridge } from "../../../../app/identity/identity.adapter";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import type { NoticeData } from "../../../../shared/components/NoticeModal";
import { employerSettingsStorage } from "../../company/storage/employerSettings.storage";
import type { ScreeningQuestion } from "../components/CareerCreateScreeningSection";
import type { StepBasicData } from "../components/CareerCreateStepBasic";
import type { StepInterviewData } from "../components/CareerCreateStepInterview";
import type { StepRequirementsData } from "../components/CareerCreateStepRequirements";
import { clampInt, normalizeTagInput } from "../helpers/careerCreateFormHelpers";
import { createCareerPost } from "../services/careerPostService";
import { careerCreateDraftStorage } from "../storage/careerCreateDraft.storage";

type PublishParams = {
  basic: StepBasicData;
  req: StepRequirementsData;
  interview: StepInterviewData;
  screeningQuestions: ScreeningQuestion[];
  nav: NavigateFunction;
  setNotice: (notice: NoticeData | null) => void;
};

export async function publishEmployerCareerPost({
  basic,
  req,
  interview,
  screeningQuestions,
  nav,
  setNotice,
}: PublishParams): Promise<void> {
  const salaryMin = clampInt(Number(req.salaryMin) || 0, 0, 999_999_999);
  const salaryMax = clampInt(Number(req.salaryMax) || salaryMin, salaryMin, 999_999_999);
  const noticePeriodDays =
    req.noticePeriodDays === "custom"
      ? clampInt(Number(req.noticePeriodCustomDays) || 0, 0, 365)
      : clampInt(Number(req.noticePeriodDays) || 0, 0, 365);

  const employerProfile = employerSettingsStorage.get();
  const legacyEmployerId = employerProfile.uniqueId?.trim() || "employer_demo";
  const actor = getCurrentActorId("employer");
  const realLegacy = employerProfile.uniqueId?.trim();
  if (actor.source === "auth" && actor.authUserId && realLegacy) {
    identityBridge.upsert("employer", realLegacy, actor.authUserId);
  }

  const postId = await createCareerPost({
    employerId: legacyEmployerId,
    companyName: basic.companyName.trim(),
    jobTitle: basic.jobTitle.trim(),
    department: basic.department.trim(),
    jobType: basic.jobType,
    workMode: basic.workMode,
    location: basic.workMode === "remote" ? "Remote / Anywhere" : basic.location.trim(),
    vacancies: Number(basic.vacancies),
    probationPeriod: basic.probationPeriod,
    salaryMin,
    salaryMax,
    salaryPeriod: req.salaryPeriod,
    noticePeriodDays,
    experienceMin: clampInt(Number(req.experienceMin) || 0, 0, 50),
    experienceMax: clampInt(Number(req.experienceMax) || 0, 0, 50),
    qualifications: normalizeTagInput(req.qualifications, 15),
    skills: normalizeTagInput(req.skills, 20),
    description: req.description.trim(),
    responsibilities: normalizeTagInput(req.responsibilities, 15),
    interviewRounds: interview.roundConfigs.length,
    roundConfigs: interview.roundConfigs,
    status: "active",
    closingDate: req.closingDate,
    isTemplate: false,
    screeningQuestions: screeningQuestions.length > 0 ? screeningQuestions : undefined,
  });

  if (!postId) {
    setNotice({
      title: "Cannot Publish Job",
      message:
        "Some job details are invalid or unsafe. Please review the job details and try again.",
      tone: "warn",
    });
    return;
  }

  careerCreateDraftStorage.clear();
  nav(ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", postId));
}
