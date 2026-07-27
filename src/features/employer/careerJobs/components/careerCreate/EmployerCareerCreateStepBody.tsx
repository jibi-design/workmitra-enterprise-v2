// App name: Job Mitra
// File name: EmployerCareerCreateStepBody.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\careerCreate\EmployerCareerCreateStepBody.tsx

import {
  CareerCreateScreeningSection,
  type ScreeningQuestion,
} from "../CareerCreateScreeningSection";
import { CareerCreateFinalReview } from "../CareerCreateFinalReview";
import { CareerCreateStepBasic, type StepBasicData } from "../CareerCreateStepBasic";
import { CareerCreateStepInterview, type StepInterviewData } from "../CareerCreateStepInterview";
import {
  CareerCreateStepRequirements,
  type StepRequirementsData,
} from "../CareerCreateStepRequirements";

type Props = {
  step: number;
  basic: StepBasicData;
  req: StepRequirementsData;
  interview: StepInterviewData;
  screeningQuestions: ScreeningQuestion[];
  onBasicChange: (update: Partial<StepBasicData>) => void;
  onReqChange: (update: Partial<StepRequirementsData>) => void;
  onInterviewChange: (update: Partial<StepInterviewData>) => void;
  onScreeningQuestionsChange: (questions: ScreeningQuestion[]) => void;
  onPublish: () => void;
  onBack: () => void;
  onSaveDraft?: () => void;
  onCancel?: () => void;
};

export function EmployerCareerCreateStepBody({
  step,
  basic,
  req,
  interview,
  screeningQuestions,
  onBasicChange,
  onReqChange,
  onInterviewChange,
  onScreeningQuestionsChange,
  onPublish,
  onBack,
  onSaveDraft,
  onCancel,
}: Props) {
  return (
    <div style={{ marginTop: "var(--wm-stack-gap)" }}>
      {step === 1 && <CareerCreateStepBasic data={basic} onChange={onBasicChange} />}

      {step === 2 && (
        <>
          <CareerCreateStepRequirements data={req} onChange={onReqChange} />
        </>
      )}

      {step === 3 && (
        <>
          <CareerCreateStepInterview data={interview} onChange={onInterviewChange} />

          <CareerCreateScreeningSection
            jobType={basic.jobType}
            questions={screeningQuestions}
            onChange={onScreeningQuestionsChange}
          />
        </>
      )}

      {step === 4 && (
        <CareerCreateFinalReview
          basicData={basic}
          reqData={req}
          rounds={interview.roundConfigs}
          screeningQuestions={screeningQuestions}
          onPublish={onPublish}
          onBack={onBack}
          onSaveDraft={onSaveDraft}
          onCancel={onCancel}
        />
      )}
    </div>
  );
}
