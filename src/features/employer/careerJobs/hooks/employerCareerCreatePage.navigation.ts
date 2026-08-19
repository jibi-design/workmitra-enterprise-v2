import type { NoticeData } from "../../../../shared/components/NoticeModal";
import { canPublishJobPosts } from "../../company/helpers/employerVerificationPolicy.helpers";
import { employerSettingsStorage } from "../../company/storage/employerSettings.storage";

export function goEmployerCareerCreateNext(params: {
  isCurrentValid: boolean;
  currentErrors: string[];
  step: number;
  setStep: (step: number) => void;
  setNotice: (notice: NoticeData | null) => void;
}): void {
  if (!params.isCurrentValid) {
    params.setNotice({
      title: "Please Fix Errors",
      message: params.currentErrors.join("\n"),
      tone: "warn",
    });
    return;
  }
  if (params.step < 4) {
    params.setStep(params.step + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

export function goEmployerCareerCreateBack(params: {
  step: number;
  setStep: (step: number) => void;
}): void {
  if (params.step > 1) {
    params.setStep(params.step - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

export function handleEmployerCareerCreatePublishIntent(params: {
  isAllValid: boolean;
  step1Errors: string[];
  step2Errors: string[];
  step3Errors: string[];
  setNotice: (notice: NoticeData | null) => void;
  setPublishPreviewOpen: (open: boolean) => void;
}): void {
  if (!params.isAllValid) {
    params.setNotice({
      title: "Cannot Publish Job",
      message: [...params.step1Errors, ...params.step2Errors, ...params.step3Errors].join("\n"),
      tone: "warn",
    });
    return;
  }

  const publishGate = canPublishJobPosts(employerSettingsStorage.get());
  if (!publishGate.allowed) {
    params.setNotice({
      title: "Verify contact first",
      message: publishGate.reason ?? "Complete verification before publishing.",
      tone: "warn",
    });
    return;
  }

  params.setPublishPreviewOpen(true);
}
