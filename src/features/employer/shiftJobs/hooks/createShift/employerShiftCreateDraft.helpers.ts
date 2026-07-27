import type { QuickQuestion } from "../../components/ShiftCreateQuickQuestionsSection";
import type {
  EmployerShiftCreateDraftForm,
  EmployerShiftPostDraft,
} from "../../storage/employerShiftDraft.storage";

export type ShiftCreateAutoFill = {
  companyName: string;
  industryType: string;
  locationCity: string;
};

export type ShiftCreateFormSnapshot = {
  companyName: string;
  jobName: string;
  category: string;
  description: string;
  experience: EmployerShiftCreateDraftForm["experience"];
  vacanciesStr: string;
  backupSlotsStr: string;
  payPerDayStr: string;
  payBasis: EmployerShiftCreateDraftForm["payBasis"];
  shiftTiming: string;
  locationName: string;
  locationAddress: string;
  mapsLink: string;
  startAt: number;
  endAt: number;
  mustHave: string;
  goodToHave: string;
  whatWeProvide: string[];
  quickQuestions: QuickQuestion[];
  dressCode: string;
  jobType: EmployerShiftCreateDraftForm["jobType"];
};

export function buildDraftForm(snapshot: ShiftCreateFormSnapshot): EmployerShiftCreateDraftForm {
  return { ...snapshot };
}

export function hasDraftContent(
  form: EmployerShiftCreateDraftForm,
  autoFill: ShiftCreateAutoFill,
): boolean {
  const companyChanged = form.companyName.trim() !== autoFill.companyName.trim();
  const locationChanged = form.locationName.trim() !== autoFill.locationCity.trim();

  return (
    companyChanged ||
    locationChanged ||
    form.jobName.trim().length > 0 ||
    form.category.trim() !== autoFill.industryType.trim() ||
    form.description.trim().length > 0 ||
    form.vacanciesStr.trim().length > 0 ||
    form.payPerDayStr.trim().length > 0 ||
    form.shiftTiming.trim().length > 0 ||
    form.locationAddress.trim().length > 0 ||
    form.mapsLink.trim().length > 0 ||
    form.mustHave.trim().length > 0 ||
    form.goodToHave.trim().length > 0 ||
    form.whatWeProvide.length > 0 ||
    form.quickQuestions.length > 0 ||
    form.dressCode.trim().length > 0
  );
}

export function draftFormFromPost(draft: EmployerShiftPostDraft): EmployerShiftCreateDraftForm {
  return draft.form;
}

export function snapshotFromDraft(draft: EmployerShiftPostDraft): ShiftCreateFormSnapshot {
  return {
    ...draft.form,
    whatWeProvide: [...draft.form.whatWeProvide],
    quickQuestions: [...draft.form.quickQuestions] as QuickQuestion[],
  };
}
