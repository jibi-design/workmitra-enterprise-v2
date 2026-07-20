// App name: Job Mitra
// File name: EmployerShiftPostsPage.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\pages\EmployerShiftPostsPage.tsx

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
  const state = useEmployerShiftPostsPageState();

  return (
    <div className="wm-er-vShift wm-shiftPostsPage">
      <EmployerShiftPostsHeader onTemplates={state.openTemplates} onCreate={state.openCreate} />

      <EmployerShiftPostsKpiTiles kpi={state.kpi} />

      {state.statusFilter && STATUS_FILTER_LABELS[state.statusFilter] && (
        <div
          style={{
            margin: "0 0 4px",
            padding: "8px 14px",
            borderRadius: 10,
            background: "rgba(16,185,129,0.07)",
            border: "1px solid rgba(16,185,129,0.18)",
            fontSize: 12,
            fontWeight: 800,
            color: "#059669",
          }}
        >
          {STATUS_FILTER_LABELS[state.statusFilter]}
        </div>
      )}

      {state.saveSuccess && <div className="wm-shiftPostsSaveNotice">{state.saveSuccess}</div>}

      {state.hasPlannerGroups && (
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            margin: "0 0 10px",
            fontSize: 12,
            fontWeight: 700,
            color: "#15803d",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={state.showIndividualPlanDays}
            onChange={(e) => state.setShowIndividualPlanDays(e.target.checked)}
          />
          Show individual plan days
        </label>
      )}

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
  );
}
