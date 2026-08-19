// Job Mitra | EmployerPlannerNewPage.tsx | Gig Projects 3-step wizard
// Ultra-Enterprise U5 — TrustStrip for stale concurrency
// Wave-4: Resume Draft / Start Fresh prompt

import { NoticeModal } from "../../../../shared/components/NoticeModal";
import { TrustStrip } from "../../../../shared/components/enterprise";
import { DemandPlannerStep1 } from "../components/wizard/DemandPlannerStep1";
import { DemandPlannerStep2SchedulePay } from "../components/wizard/DemandPlannerStep2SchedulePay";
import { DemandPlannerStep3 } from "../components/wizard/DemandPlannerStep3";
import { EmployerDemandPlannerHeader } from "../components/wizard/EmployerDemandPlannerHeader";
import { EmployerDemandPlannerStepIndicator } from "../components/wizard/EmployerDemandPlannerStepIndicator";
import { PlannerMorphWizardShell } from "../components/PlannerMorphWizardShell";
import { useEmployerDemandPlannerState } from "../hooks/useEmployerDemandPlannerState";
import { usePlannerPlansHydrate } from "../hooks/usePlannerPlansHydrate";

export function EmployerPlannerNewPage() {
  usePlannerPlansHydrate();
  const state = useEmployerDemandPlannerState();
  const isStaleNotice =
    Boolean(state.notice) &&
    state.notice?.confirmLabel === "Reload" &&
    (state.notice?.title.includes("updated elsewhere") ?? false);

  if (state.draftPromptOpen) {
    return (
      <div className="wm-er-vPlanner wm-planner-page">
        <div className="wm-planner-quartz wm-planner-card" style={{ marginTop: 14, padding: 20 }}>
          <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>Unsaved Demand Planner draft</h2>
          <p style={{ margin: "0 0 16px", opacity: 0.85 }}>
            A draft was autosaved on this device. Resume where you left off, or start fresh.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              className="wm-planner-btnPrimary"
              data-testid="planner-resume-draft"
              onClick={state.resumeWizardDraft}
            >
              Resume Draft
            </button>
            <button
              type="button"
              className="wm-planner-btnGhost"
              data-testid="planner-start-fresh"
              onClick={state.startFreshWizard}
            >
              Start Fresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wm-er-vPlanner wm-planner-page">
      {isStaleNotice ? (
        <div style={{ marginBottom: 12 }}>
          <TrustStrip
            kind="stale"
            tone="warning"
            title={state.notice?.title ?? "This plan was updated elsewhere"}
            message={
              state.notice?.message ??
              "Reload the draft to continue editing without overwriting newer changes."
            }
            badgeLabel="Stale"
            testId="planner-stale-trust"
            actions={
              <button
                type="button"
                className="wm-primarybtn"
                data-testid="planner-stale-reload"
                onClick={state.handleNoticeClose}
              >
                Reload
              </button>
            }
          />
        </div>
      ) : (
        <NoticeModal notice={state.notice} onClose={state.handleNoticeClose} />
      )}

      <EmployerDemandPlannerHeader
        showCancel
        onCancel={state.goToPlannerHome}
        onSaveDraft={state.handleSaveDraft}
        draftSavedAt={state.draftSavedAt}
        isPublishing={state.isSubmitting}
      />

      <div style={{ marginTop: 14 }}>
        <EmployerDemandPlannerStepIndicator step={state.step} />
      </div>

      <div
        className="wm-planner-quartz wm-planner-card"
        style={{ marginTop: 0, padding: 0, overflow: "hidden" }}
      >
        <PlannerMorphWizardShell step={state.step}>
          <div style={{ padding: 14 }}>
            {state.step === 1 && (
              <DemandPlannerStep1
                data={state.step1}
                onChange={state.setStep1}
                onNext={state.handleStep1Next}
                errors={state.step1Errors}
              />
            )}

            {state.step === 2 && (
              <DemandPlannerStep2SchedulePay
                step1={state.step1}
                onStep1Change={state.setStep1}
                slots={state.slots}
                onSlotsChange={state.setSlots}
                onNext={state.handleStep2ScheduleNext}
                onBack={() => state.setStep(1)}
                errors={state.step1Errors}
              />
            )}

            {state.step === 3 && (
              <DemandPlannerStep3
                step1={state.step1}
                slots={state.slots}
                isSubmitting={state.isSubmitting}
                onSubmit={state.handleSubmit}
                onBack={() => state.setStep(2)}
              />
            )}
          </div>
        </PlannerMorphWizardShell>
      </div>
    </div>
  );
}
