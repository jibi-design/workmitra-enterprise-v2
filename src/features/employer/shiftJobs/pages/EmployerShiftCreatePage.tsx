// src/features/employer/shiftJobs/pages/EmployerShiftCreatePage.tsx
//
// Shift create wizard — form state + section components.
// Header + footer extracted for 200-line compliance.

import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { employerShiftStorage, type ExperienceLabel } from "../storage/employerShift.storage";
import type { ConfirmData } from "../../../../shared/components/ConfirmModal";
import type { NoticeData } from "../../../../shared/components/NoticeModal";
import {
  tomorrowEpoch, toDateStr, clampInt, normalizeLines,
  isDirtyCheck, validateShiftForm, getAutoFillData,
} from "../helpers/shiftCreateHelpers";
import { ShiftCreateFormHeader } from "../components/ShiftCreateFormHeader";
import { ShiftCreateFormFooter } from "../components/ShiftCreateFormFooter";
import { ShiftCreateBasicSection } from "../components/ShiftCreateBasicSection";
import { ShiftCreateWorkersSection } from "../components/ShiftCreateWorkersSection";
import { ShiftCreateScheduleSection } from "../components/ShiftCreateScheduleSection";
import { ShiftCreateLocationSection } from "../components/ShiftCreateLocationSection";
import { ShiftCreateProvidesSection } from "../components/ShiftCreateProvidesSection";
import { ShiftCreateQuickQuestionsSection } from "../components/ShiftCreateQuickQuestionsSection";
import type { QuickQuestion } from "../components/ShiftCreateQuickQuestionsSection";
import { ShiftCreateRequirementsSection } from "../components/ShiftCreateRequirementsSection";
import { shiftTemplatesStorage } from "../storage/shiftTemplatesStorage";

export function EmployerShiftCreatePage() {
  const nav = useNavigate();
  const formRef = useRef<HTMLDivElement>(null);
  const autoFill = useMemo(() => getAutoFillData(), []);
  const [tpl] = useState(() => shiftTemplatesStorage.consumePending());

  /* ── Form state ── */
  const [companyName, setCompanyName] = useState(autoFill.companyName);
  const [jobName, setJobName] = useState(tpl?.jobName ?? "");
  const [category, setCategory] = useState(tpl?.category ?? autoFill.industryType);
  const [description, setDescription] = useState(tpl?.description ?? "");
  const [experience, setExperience] = useState<ExperienceLabel>(tpl?.experience ?? "helper");
  const [vacanciesStr, setVacanciesStr] = useState(tpl?.vacancies ? String(tpl.vacancies) : "");
  const [backupSlotsStr, setBackupSlotsStr] = useState(tpl?.waitingBuffer ? String(tpl.waitingBuffer) : "2");
  const [payPerDayStr, setPayPerDayStr] = useState(tpl?.payPerDay ? String(tpl.payPerDay) : "");
  const [shiftTiming, setShiftTiming] = useState(tpl?.shiftTiming ?? "");
  const [locationName, setLocationName] = useState(tpl?.locationName ?? autoFill.locationCity);
  const [locationAddress, setLocationAddress] = useState("");
  const [mapsLink, setMapsLink] = useState("");
  const [startAt, setStartAt] = useState<number>(tomorrowEpoch);
  const [endAt, setEndAt] = useState<number>(tomorrowEpoch);
  const [mustHave, setMustHave] = useState(tpl?.mustHave?.length ? tpl.mustHave.join("\n") : "");
  const [goodToHave, setGoodToHave] = useState(tpl?.goodToHave?.length ? tpl.goodToHave.join("\n") : "");
  const [whatWeProvide, setWhatWeProvide] = useState<string[]>(tpl?.whatWeProvide ?? []);
  const [quickQuestions, setQuickQuestions] = useState<QuickQuestion[]>((tpl?.quickQuestions ?? []) as QuickQuestion[]);
  const [dressCode, setDressCode] = useState(tpl?.dressCode ?? "");
  const [jobType, setJobType] = useState<"one-time" | "weekly" | "custom">("one-time");

  /* ── Modal state ── */
  const [discardConfirm, setDiscardConfirm] = useState<ConfirmData | null>(null);
  const [showCreateConfirm, setShowCreateConfirm] = useState(false);
  const [notice, setNotice] = useState<NoticeData | null>(null);

  /* ── Derived ── */
  const mustList = useMemo(() => normalizeLines(mustHave, { maxItems: 25, maxLen: 80 }), [mustHave]);
  const goodList = useMemo(() => normalizeLines(goodToHave, { maxItems: 25, maxLen: 80 }), [goodToHave]);
  const payPerDay = Number(payPerDayStr) || 0;
  const groupPreview = useMemo(() => `${companyName.trim() || "Company"} \u2014 ${jobName.trim() || "Job"} \u2014 ${category.trim() || "Category"}`, [companyName, jobName, category]);
  const errors = useMemo(() => validateShiftForm({ companyName, jobName, locationName, vacanciesStr, payPerDay, startAt, endAt }), [companyName, jobName, locationName, vacanciesStr, payPerDay, startAt, endAt]);
  const isValid = errors.length === 0;
  const dateRangeText = useMemo(() => { const s = toDateStr(startAt); const e = toDateStr(endAt); return s === e ? s : `${s} to ${e}`; }, [startAt, endAt]);
  const checkDirty = useCallback((): boolean => isDirtyCheck({ companyName, jobName, category, description, vacanciesStr, payPerDayStr, locationName, mustHave, goodToHave }), [companyName, jobName, category, description, vacanciesStr, payPerDayStr, locationName, mustHave, goodToHave]);

  /* ── Handlers ── */
  function handleCancel() {
    if (checkDirty()) { setDiscardConfirm({ title: "Discard changes?", message: "You have unsaved data. If you leave now, all entered information will be lost.", tone: "warn", confirmLabel: "Discard & Leave", cancelLabel: "Stay" }); }
    else { nav(ROUTE_PATHS.employerShiftHome); }
  }
  function handleCreate() {
    if (!isValid) { setNotice({ title: "Cannot Create Post", message: errors.join("\n"), tone: "warn" }); return; }
    setShowCreateConfirm(true);
  }
  function doCreate() {
    const fullLoc = locationAddress.trim() ? `${locationName.trim()} \u2014 ${locationAddress.trim()}` : locationName.trim();
    const postId = employerShiftStorage.createPost({
      companyName: companyName.trim(), jobName: jobName.trim(), category: category.trim() || "Other", experience,
      payPerDay: clampInt(payPerDay, 0, 1_000_000), locationName: fullLoc, distanceKm: 0, startAt, endAt: endAt < startAt ? startAt : endAt,
      description: description.trim(), shiftTiming: shiftTiming.trim(), mapsLink: mapsLink.trim(), isHiddenFromSearch: false,
      mustHave: mustList, goodToHave: goodList, whatWeProvide,
      quickQuestions: quickQuestions.length > 0 ? quickQuestions : undefined, dressCode: dressCode.trim() || undefined, jobType,
      vacancies: clampInt(Number(vacanciesStr) || 1, 1, 1000), waitingBuffer: clampInt(Number(backupSlotsStr) || 0, 0, 20),
      settings: { backupSlots: clampInt(Number(backupSlotsStr) || 0, 0, 20), autoPromoteBackup: true, notifyBackup: true },
    });
    nav(ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", postId));
  }

  return (
    <div className="wm-er-vShift" ref={formRef}>
      <ShiftCreateFormHeader isTemplate={!!tpl} groupPreview={groupPreview} />
      <ShiftCreateBasicSection companyName={companyName} onCompanyName={setCompanyName} companyAutoFilled={autoFill.companyName.length > 0} jobName={jobName} onJobName={setJobName} category={category} onCategory={setCategory} categoryAutoFilled={autoFill.industryType.length > 0} description={description} onDescription={setDescription} />
      <ShiftCreateWorkersSection vacanciesStr={vacanciesStr} onVacancies={setVacanciesStr} backupSlotsStr={backupSlotsStr} onBackupSlots={setBackupSlotsStr} experience={experience} onExperience={setExperience} category={category} />
      <ShiftCreateScheduleSection startAt={startAt} onStartAt={setStartAt} endAt={endAt} onEndAt={setEndAt} shiftTiming={shiftTiming} onShiftTiming={setShiftTiming} payPerDayStr={payPerDayStr} onPayPerDay={setPayPerDayStr} jobType={jobType} onJobType={setJobType} />
      <ShiftCreateLocationSection locationName={locationName} onLocationName={setLocationName} locationAutoFilled={autoFill.locationCity.length > 0} locationAddress={locationAddress} onLocationAddress={setLocationAddress} mapsLink={mapsLink} onMapsLink={setMapsLink} />
      <ShiftCreateProvidesSection selected={whatWeProvide} category={category} onChange={setWhatWeProvide} />
      <ShiftCreateQuickQuestionsSection category={category} questions={quickQuestions} onChange={setQuickQuestions} />
      <ShiftCreateRequirementsSection mustHave={mustHave} onMustHave={setMustHave} mustCount={mustList.length} goodToHave={goodToHave} onGoodToHave={setGoodToHave} goodCount={goodList.length} dressCode={dressCode} onDressCode={setDressCode} />
      <ShiftCreateFormFooter isValid={isValid} errors={errors} onCancel={handleCancel} onCreate={handleCreate}
        discardConfirm={discardConfirm} onDiscardCancel={() => setDiscardConfirm(null)} onDiscardConfirm={() => { setDiscardConfirm(null); nav(ROUTE_PATHS.employerShiftHome); }}
        notice={notice} onNoticeDismiss={() => setNotice(null)}
        showCreateConfirm={showCreateConfirm} createPreview={{ jobName: jobName.trim(), companyName: companyName.trim(), workers: Number(vacanciesStr) || 0, payPerDay, locationName: locationName.trim(), dateRange: dateRangeText }}
        onCreateConfirm={() => { setShowCreateConfirm(false); doCreate(); }} onCreateCancel={() => setShowCreateConfirm(false)} />
    </div>
  );
}