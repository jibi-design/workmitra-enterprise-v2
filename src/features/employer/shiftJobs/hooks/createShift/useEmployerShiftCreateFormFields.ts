import { useMemo, useState } from "react";
import type { QuickQuestion } from "../../components/ShiftCreateQuickQuestionsSection";
import {
  findDuplicateShiftWarnings,
  getAutoFillData,
  normalizeLines,
  DEFAULT_SHIFT_DURATION_MS,
  toDateStr,
  tomorrowEpoch,
  validateShiftForm,
  type ShiftPayBasisDraft,
} from "../../helpers/shiftCreateHelpers";
import { employerShiftStorage, type ExperienceLabel } from "../../storage/employerShift.storage";
import {
  employerShiftDraftStorage,
  type EmployerShiftPostDraft,
} from "../../storage/employerShiftDraft.storage";
import { shiftTemplatesStorage } from "../../storage/shiftTemplatesStorage";

export function useEmployerShiftCreateFormFields(requestedDraftId: string) {
  const autoFill = useMemo(() => getAutoFillData(), []);
  const [initialDraft] = useState<EmployerShiftPostDraft | null>(() =>
    requestedDraftId ? employerShiftDraftStorage.getById(requestedDraftId) : null,
  );
  const [tpl] = useState(() => (initialDraft ? null : shiftTemplatesStorage.consumePending()));
  const initialDraftForm = initialDraft?.form;

  const [companyName, setCompanyName] = useState(
    initialDraftForm?.companyName ?? autoFill.companyName,
  );
  const [jobName, setJobName] = useState(initialDraftForm?.jobName ?? tpl?.jobName ?? "");
  const [category, setCategory] = useState(
    initialDraftForm?.category ?? tpl?.category ?? autoFill.industryType,
  );
  const [description, setDescription] = useState(
    initialDraftForm?.description ?? tpl?.description ?? "",
  );
  const [experience, setExperience] = useState<ExperienceLabel>(
    initialDraftForm?.experience ?? tpl?.experience ?? "helper",
  );
  const [vacanciesStr, setVacanciesStr] = useState(
    initialDraftForm?.vacanciesStr ?? (tpl?.vacancies ? String(tpl.vacancies) : ""),
  );
  const [backupSlotsStr, setBackupSlotsStr] = useState(
    initialDraftForm?.backupSlotsStr ?? (tpl?.waitingBuffer ? String(tpl.waitingBuffer) : "2"),
  );
  const [payPerDayStr, setPayPerDayStr] = useState(
    initialDraftForm?.payPerDayStr ?? (tpl?.payPerDay ? String(tpl.payPerDay) : ""),
  );
  const [payBasis, setPayBasis] = useState<ShiftPayBasisDraft>(
    (initialDraftForm?.payBasis ?? "") as ShiftPayBasisDraft,
  );
  const [shiftTiming, setShiftTiming] = useState(
    initialDraftForm?.shiftTiming ?? tpl?.shiftTiming ?? "",
  );
  const [locationName, setLocationName] = useState(
    initialDraftForm?.locationName ?? tpl?.locationName ?? autoFill.locationCity,
  );
  const [locationAddress, setLocationAddress] = useState(initialDraftForm?.locationAddress ?? "");
  const [mapsLink, setMapsLink] = useState(initialDraftForm?.mapsLink ?? "");
  const defaultStart = tomorrowEpoch();
  const [startAt, setStartAt] = useState<number>(initialDraftForm?.startAt ?? defaultStart);
  const [endAt, setEndAt] = useState<number>(
    initialDraftForm?.endAt ?? defaultStart + DEFAULT_SHIFT_DURATION_MS,
  );
  const [mustHave, setMustHave] = useState(
    initialDraftForm?.mustHave ?? (tpl?.mustHave?.length ? tpl.mustHave.join("\n") : ""),
  );
  const [goodToHave, setGoodToHave] = useState(
    initialDraftForm?.goodToHave ?? (tpl?.goodToHave?.length ? tpl.goodToHave.join("\n") : ""),
  );
  const [whatWeProvide, setWhatWeProvide] = useState<string[]>(
    initialDraftForm?.whatWeProvide
      ? [...initialDraftForm.whatWeProvide]
      : (tpl?.whatWeProvide ?? []),
  );
  const [quickQuestions, setQuickQuestions] = useState<QuickQuestion[]>(
    initialDraftForm?.quickQuestions
      ? ([...initialDraftForm.quickQuestions] as QuickQuestion[])
      : ((tpl?.quickQuestions ?? []) as QuickQuestion[]),
  );
  const [dressCode, setDressCode] = useState(initialDraftForm?.dressCode ?? tpl?.dressCode ?? "");
  const [jobType, setJobType] = useState<"one-time" | "weekly" | "custom">(
    initialDraftForm?.jobType ?? "one-time",
  );

  const mustList = useMemo(
    () => normalizeLines(mustHave, { maxItems: 25, maxLen: 80 }),
    [mustHave],
  );
  const goodList = useMemo(
    () => normalizeLines(goodToHave, { maxItems: 25, maxLen: 80 }),
    [goodToHave],
  );
  const payPerDay = Number(payPerDayStr) || 0;

  const groupPreview = useMemo(
    () =>
      `${companyName.trim() || "Company"} - ${jobName.trim() || "Job"} - ${
        category.trim() || "Category"
      }`,
    [companyName, jobName, category],
  );

  const errors = useMemo(
    () =>
      validateShiftForm({
        companyName,
        jobName,
        locationName,
        vacanciesStr,
        payPerDay,
        payBasis,
        startAt,
        endAt,
      }),
    [companyName, jobName, locationName, vacanciesStr, payPerDay, payBasis, startAt, endAt],
  );

  const isValid = errors.length === 0;

  const dateRangeText = useMemo(() => {
    const start = toDateStr(startAt);
    const end = toDateStr(endAt);
    return start === end ? start : `${start} to ${end}`;
  }, [startAt, endAt]);

  const duplicateWarnings = useMemo(
    () =>
      findDuplicateShiftWarnings(employerShiftStorage.getPosts(), {
        companyName,
        jobName,
        category,
        locationName,
        startAt,
        endAt,
      }),
    [companyName, jobName, category, locationName, startAt, endAt],
  );

  return {
    autoFill,
    tpl,
    initialDraft,
    companyName,
    setCompanyName,
    jobName,
    setJobName,
    category,
    setCategory,
    description,
    setDescription,
    experience,
    setExperience,
    vacanciesStr,
    setVacanciesStr,
    backupSlotsStr,
    setBackupSlotsStr,
    payPerDayStr,
    setPayPerDayStr,
    payBasis,
    setPayBasis,
    shiftTiming,
    setShiftTiming,
    locationName,
    setLocationName,
    locationAddress,
    setLocationAddress,
    mapsLink,
    setMapsLink,
    startAt,
    setStartAt,
    endAt,
    setEndAt,
    mustHave,
    setMustHave,
    goodToHave,
    setGoodToHave,
    whatWeProvide,
    setWhatWeProvide,
    quickQuestions,
    setQuickQuestions,
    dressCode,
    setDressCode,
    jobType,
    setJobType,
    mustList,
    goodList,
    payPerDay,
    groupPreview,
    errors,
    isValid,
    dateRangeText,
    duplicateWarnings,
  };
}
