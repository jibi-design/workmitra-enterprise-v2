// App name: Job Mitra | EmployerShiftCreatePage.tsx — stackGrid wizard (Wave 3)

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
    <div
      className="wm-er-vShift wm-shiftCreateWizardPage wm-stackGrid"
      data-testid="employer-shift-create-page"
      ref={setFormNode}
      style={{ gap: "var(--wm-stack-gap)" }}
    >
      <ShiftCreateWizardTopBar
        wizardStep={wizardStep}
        onCancel={footer.onCancel}
        onSaveDraft={draft.handleSaveDraft}
        lastSavedAt={draft.lastSavedAt}
      />

      {isTemplate ? (
        <div
          className="wm-shift-surface-glass wm-shift-surface-glass--shift wm-shift-surface-glass--compact"
          role="status"
          style={{
            color: "var(--wm-er-accent-shift, #16a34a)",
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          Template pre-filled. Review each step before publishing.
        </div>
      ) : null}

      {draft.otherDrafts.length > 0 ? (
        <ShiftDraftControlPanel
          draftId={draft.draftId}
          lastSavedAt={draft.lastSavedAt}
          otherDrafts={draft.otherDrafts}
          onSaveDraft={draft.handleSaveDraft}
          onDeleteCurrentDraft={draft.handleDeleteCurrentDraft}
          onDeleteDraft={draft.handleDeleteSavedDraft}
          onResumeDraft={draft.applyDraft}
        />
      ) : null}

      <ShiftCreateNearbyAvailabilityCard
        startAt={schedule.startAt}
        locationPincode={location.locationPincode}
      />

      {wizardStep === 1 ? (
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
      ) : null}

      {wizardStep === 2 ? (
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
            locationPincode={location.locationPincode}
            onLocationPincode={location.onLocationPincode}
            locationPincodeAutoFilled={location.locationPincodeAutoFilled}
            locationAddress={location.locationAddress}
            onLocationAddress={location.onLocationAddress}
            mapsLink={location.mapsLink}
            onMapsLink={location.onMapsLink}
          />
        </>
      ) : null}

      {wizardStep === 3 ? (
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
      ) : null}

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
