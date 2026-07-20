// App name: Job Mitra
// File name: EmployerShiftCreatePage.tsx
// 3-step distraction-free Create Shift wizard (Phase 1).

import { ShiftDraftControlPanel } from "../components/createShiftDrafts/ShiftDraftControlPanel";
import { ShiftCreateBasicSection } from "../components/ShiftCreateBasicSection";
import { ShiftCreateFormFooter } from "../components/ShiftCreateFormFooter";
import { ShiftCreateLocationSection } from "../components/ShiftCreateLocationSection";
import { ShiftCreateProvidesSection } from "../components/ShiftCreateProvidesSection";
import { ShiftCreateQuickQuestionsSection } from "../components/ShiftCreateQuickQuestionsSection";
import { ShiftCreateRequirementsSection } from "../components/ShiftCreateRequirementsSection";
import { ShiftCreateScheduleSection } from "../components/ShiftCreateScheduleSection";
import { ShiftCreateNearbyAvailabilityCard } from "../components/ShiftCreateNearbyAvailabilityCard";
import { ShiftCreateWorkersSection } from "../components/ShiftCreateWorkersSection";
import { ShiftCreateWizardFooter } from "../components/ShiftCreateWizardFooter";
import { ShiftCreateWizardTopBar } from "../components/ShiftCreateWizardTopBar";
import { useEmployerShiftCreateState } from "../hooks/useEmployerShiftCreateState";

export function EmployerShiftCreatePage() {
  const {
    setFormNode,
    wizardStep,
    stepErrors,
    handleWizardNext,
    handleWizardBack,
    isTemplate,
    draft,
    basic,
    workers,
    schedule,
    location,
    provides,
    quickQuestions,
    requirements,
    footer,
  } = useEmployerShiftCreateState();

  return (
    <div className="wm-er-vShift wm-shiftCreateWizardPage" ref={setFormNode}>
      <ShiftCreateWizardTopBar
        wizardStep={wizardStep}
        onCancel={footer.onCancel}
        onSaveDraft={draft.handleSaveDraft}
        lastSavedAt={draft.lastSavedAt}
      />

      {isTemplate && (
        <div
          style={{
            marginTop: 10,
            padding: "10px 14px",
            borderRadius: 16,
            background: "linear-gradient(180deg, rgba(240,253,244,0.95), rgba(255,255,255,0.98))",
            border: "1px solid rgba(22,163,74,0.2)",
            fontSize: 12,
            color: "#16a34a",
            fontWeight: 800,
          }}
        >
          Template pre-filled. Review each step before publishing.
        </div>
      )}

      {draft.otherDrafts.length > 0 && (
        <ShiftDraftControlPanel
          draftId={draft.draftId}
          lastSavedAt={draft.lastSavedAt}
          otherDrafts={draft.otherDrafts}
          onSaveDraft={draft.handleSaveDraft}
          onDeleteCurrentDraft={draft.handleDeleteCurrentDraft}
          onDeleteDraft={draft.handleDeleteSavedDraft}
          onResumeDraft={draft.applyDraft}
        />
      )}

      {/* Always visible on every wizard step — live count for selected shift start date */}
      <ShiftCreateNearbyAvailabilityCard startAt={schedule.startAt} />

      {wizardStep === 1 && (
        <>
          <ShiftCreateBasicSection
            companyName={basic.companyName}
            onCompanyName={basic.onCompanyName}
            companyAutoFilled={basic.companyAutoFilled}
            jobName={basic.jobName}
            onJobName={basic.onJobName}
            category={basic.category}
            onCategory={basic.onCategory}
            categoryAutoFilled={basic.categoryAutoFilled}
            description={basic.description}
            onDescription={basic.onDescription}
          />

          <ShiftCreateWorkersSection
            vacanciesStr={workers.vacanciesStr}
            onVacancies={workers.onVacancies}
            backupSlotsStr={workers.backupSlotsStr}
            onBackupSlots={workers.onBackupSlots}
            experience={workers.experience}
            onExperience={workers.onExperience}
            category={workers.category}
          />
        </>
      )}

      {wizardStep === 2 && (
        <>
          <ShiftCreateScheduleSection
            startAt={schedule.startAt}
            onStartAt={schedule.onStartAt}
            endAt={schedule.endAt}
            onEndAt={schedule.onEndAt}
            shiftTiming={schedule.shiftTiming}
            onShiftTiming={schedule.onShiftTiming}
            payPerDayStr={schedule.payPerDayStr}
            onPayPerDay={schedule.onPayPerDay}
            payBasis={schedule.payBasis}
            onPayBasis={schedule.onPayBasis}
          />

          <ShiftCreateLocationSection
            locationName={location.locationName}
            onLocationName={location.onLocationName}
            locationAutoFilled={location.locationAutoFilled}
            locationAddress={location.locationAddress}
            onLocationAddress={location.onLocationAddress}
            mapsLink={location.mapsLink}
            onMapsLink={location.onMapsLink}
          />
        </>
      )}

      {wizardStep === 3 && (
        <>
          <ShiftCreateProvidesSection
            selected={provides.selected}
            category={provides.category}
            onChange={provides.onChange}
          />

          <ShiftCreateQuickQuestionsSection
            category={quickQuestions.category}
            questions={quickQuestions.questions}
            onChange={quickQuestions.onChange}
          />

          <ShiftCreateRequirementsSection
            mustHave={requirements.mustHave}
            onMustHave={requirements.onMustHave}
            mustCount={requirements.mustCount}
            goodToHave={requirements.goodToHave}
            onGoodToHave={requirements.onGoodToHave}
            goodCount={requirements.goodCount}
            dressCode={requirements.dressCode}
            onDressCode={requirements.onDressCode}
          />
        </>
      )}

      <ShiftCreateWizardFooter
        wizardStep={wizardStep}
        onCancel={footer.onCancel}
        onBack={handleWizardBack}
        onNext={handleWizardNext}
        onReviewPublish={footer.onCreate}
        stepErrors={stepErrors}
      />

      <ShiftCreateFormFooter
        isValid={footer.isValid}
        errors={footer.errors}
        onCancel={footer.onCancel}
        onCreate={footer.onCreate}
        discardConfirm={footer.discardConfirm}
        onDiscardCancel={footer.onDiscardCancel}
        onDiscardConfirm={footer.onDiscardConfirm}
        notice={footer.notice}
        onNoticeDismiss={footer.onNoticeDismiss}
        showCreateConfirm={footer.showCreateConfirm}
        createPreview={footer.createPreview}
        onCreateConfirm={footer.onCreateConfirm}
        onCreateCancel={footer.onCreateCancel}
        hideActions
      />
    </div>
  );
}
