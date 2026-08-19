// App name: Job Mitra
// File name: EmployerShiftPostsPage.tsx
// My Posts — adopt shared Shift design primitives (Step 2)

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { EmployerShiftPostsHeader } from "../components/EmployerShiftPostsHeader";
import { EmployerShiftPostsKpiTiles } from "../components/EmployerShiftPostsKpiTiles";
import { EmployerShiftPostsList } from "../components/EmployerShiftPostsList";
import { useEmployerShiftPostsPageState } from "../hooks/useEmployerShiftPostsPageState";

const STATUS_FILTER_LABELS: Record<string, string> = {
  applied: "Showing posts with pending applications",
  shortlisted: "Showing posts with shortlisted candidates",
  confirmed: "Showing posts with confirmed workers",
};

export function EmployerShiftPostsPage() {
  const nav = useNavigate();
  const state = useEmployerShiftPostsPageState();

  useEffect(() => {
    void import("./EmployerShiftPostDashboardPage");
  }, []);
  const filterLabel =
    state.statusFilter && STATUS_FILTER_LABELS[state.statusFilter]
      ? STATUS_FILTER_LABELS[state.statusFilter]
      : null;

  return (
    <div className="wm-er-vShift wm-shiftPostsPage wm-stackGrid" data-testid="shift-posts-page">
      <EmployerShiftPostsHeader
        draftCount={state.draftCount}
        onTemplates={state.openTemplates}
        onCreate={state.openCreate}
      />

      <EmployerShiftPostsKpiTiles kpi={state.kpi} />

      {filterLabel ? (
        <div
          className="wm-shift-surface-glass wm-shift-surface-glass--shift wm-shiftPostsFilterBanner wm-animateIn"
          role="status"
          data-testid="shift-posts-status-filter"
          style={{ animationDelay: "90ms" }}
        >
          <span className="wm-shiftPostsFilterBannerText">{filterLabel}</span>
          <button
            type="button"
            className="wm-shift-seg-tab isActive"
            data-testid="shift-posts-clear-status-filter"
            aria-label="Clear status filter"
            onClick={() => nav(ROUTE_PATHS.employerShiftPosts)}
          >
            Clear filter
          </button>
        </div>
      ) : null}

      {state.saveSuccess ? (
        <div className="wm-shiftPostsSaveNotice wm-shift-surface-glass--shift" role="status">
          {state.saveSuccess}
        </div>
      ) : null}

      {state.hasPlannerGroups ? (
        <label
          className="wm-shift-surface-glass wm-shiftPostsPlanToggle"
          data-testid="shift-posts-plan-days-toggle"
        >
          <input
            type="checkbox"
            checked={state.showIndividualPlanDays}
            onChange={(e) => state.setShowIndividualPlanDays(e.target.checked)}
          />
          <span>Show individual plan days</span>
        </label>
      ) : null}

      <div className="wm-animateIn" style={{ animationDelay: "120ms" }}>
        <EmployerShiftPostsList
          posts={state.posts}
          planGroups={state.planGroups}
          onOpenPlan={state.openPlan}
          savingPostId={state.savingPostId}
          templateName={state.templateName}
          onOpen={state.openPost}
          onCreate={state.openCreate}
          onTemplateNameChange={state.setTemplateName}
          onStartSaveTemplate={state.startSaveTemplate}
          onCancelSaveTemplate={state.cancelSaveTemplate}
          onSaveTemplate={state.handleSaveTemplate}
        />
      </div>
    </div>
  );
}
