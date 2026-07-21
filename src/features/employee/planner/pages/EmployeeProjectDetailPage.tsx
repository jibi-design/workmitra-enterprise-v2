// Job Mitra | EmployeeProjectDetailPage.tsx | Section 7.11

import { useMemo, useState, useSyncExternalStore, useEffect } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { fmtPlanDate } from "../../../shared/planner/plannerPublic";
import { formatPlannerPayRange } from "../../../shared/planner/plannerPublic";
import type { PlannerPublicIndexEntry } from "../../../shared/planner/plannerPublic";
import { plannerPublicIndex } from "../../../shared/planner/plannerPublic";
import { employeePlanEngagementStorage } from "../storage/employeePlanEngagement.storage";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import { employeeAvailabilityService } from "../services/employeeAvailability.service";
import { employeeProjectApplyPath } from "../../planner/helpers/plannerEmployeeRoutes";
import { PlannerPickChooseCalendar } from "../components/PlannerPickChooseCalendar";
import { PlannerProfileGateModal } from "../components/PlannerProfileGateModal";
import { usePlannerPickChooseState } from "../hooks/usePlannerPickChooseState";

function ProjectDetailBody({ entry }: { entry: PlannerPublicIndexEntry }) {
  const nav = useNavigate();
  const [pickOpen, setPickOpen] = useState(false);
  const [profileGateOpen, setProfileGateOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [saved, setSaved] = useState(() => employeePlanEngagementStorage.isSaved(entry.planId));

  useEffect(() => {
    employeePlanEngagementStorage.markViewed(entry.planId);
  }, [entry.planId]);

  const workerMlId = employeeProfileStorage.get().uniqueId ?? "local-worker";
  const isProfileComplete = Boolean(employeeProfileStorage.get().fullName.trim());

  const previewAvailability = useMemo(
    () =>
      employeeAvailabilityService.build({
        workerMlId,
        planId: entry.planId,
        indexEntry: entry,
      }),
    [workerMlId, entry],
  );

  const appliedCount = previewAvailability.summary.appliedDayCount;
  const openCount = previewAvailability.summary.openDayCount;
  const cancelled = entry.status === "cancelled";
  const payLabel = formatPlannerPayRange(entry.payMin, entry.payMax);
  const allFull = openCount === 0 && !cancelled;

  const pickState = usePlannerPickChooseState({
    entry,
    isProfileComplete,
    onNeedProfile: () => setProfileGateOpen(true),
    onApplied: (count) => {
      setPickOpen(false);
      setToast(`Applied for ${count} day${count !== 1 ? "s" : ""}!`);
    },
  });

  return (
    <>
      <PlannerProfileGateModal open={profileGateOpen} onClose={() => setProfileGateOpen(false)} />
      <section className="wm-planner-hero">
        <div className="wm-planner-badge">📋 Project Plan · {entry.dayCount} days</div>
        <div className="wm-planner-heroTitle" style={{ marginTop: 8 }}>
          {entry.planName}
        </div>
        <div className="wm-planner-heroSub">
          {entry.companyName} · {entry.locationName} · {entry.category}
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 13,
            fontWeight: 700,
            color: "var(--wm-planner-accent-strong)",
          }}
        >
          {payLabel} · {entry.openDayCount} shifts open
        </div>
      </section>

      {cancelled ? (
        <div className="wm-planner-card" style={{ color: "#dc2626", fontWeight: 700 }}>
          This project is no longer available.
        </div>
      ) : null}

      {!cancelled && appliedCount > 0 ? (
        <div className="wm-planner-card" style={{ fontSize: 12, fontWeight: 700 }}>
          You applied to {appliedCount} of {entry.openDayCount} open days.
        </div>
      ) : null}

      <div className="wm-planner-card wm-planner-quartz">
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>Calendar preview</div>
        <div className="wm-planner-calendarGrid" style={{ pointerEvents: "none", opacity: 0.92 }}>
          {previewAvailability.days.map((day) => (
            <div
              key={day.dateKey}
              className="wm-planner-calendarDay"
              data-day-status={day.status}
              data-disabled={day.selectable ? "false" : "true"}
              style={{ cursor: "default" }}
            >
              <div>{fmtPlanDate(day.dateKey).split(",")[0]}</div>
              <div style={{ fontSize: 9 }}>{day.status}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: "var(--wm-neutral-500)" }}>
          {entry.slotDates[0] ? fmtPlanDate(entry.slotDates[0]) : ""} →{" "}
          {entry.slotDates[entry.slotDates.length - 1]
            ? fmtPlanDate(entry.slotDates[entry.slotDates.length - 1]!)
            : ""}
        </div>
      </div>

      <div className="wm-planner-card" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          className="wm-planner-btnPrimary"
          style={{ flex: 1 }}
          disabled={cancelled || allFull}
          onClick={() => {
            if (!isProfileComplete) {
              nav(ROUTE_PATHS.employeeProfile);
              return;
            }
            setPickOpen(true);
          }}
        >
          {allFull ? "All days currently full" : "Pick Your Days →"}
        </button>
        <button
          type="button"
          className="wm-planner-btnGhost"
          onClick={() => nav(employeeProjectApplyPath(entry.planId))}
        >
          Full-page apply
        </button>
        <button
          type="button"
          className="wm-planner-btnGhost"
          aria-pressed={saved}
          onClick={() => {
            const next = employeePlanEngagementStorage.toggleSaved(entry.planId);
            setSaved(next);
            setToast(next ? "Project saved" : "Removed from saved projects");
          }}
        >
          {saved ? "★ Saved" : "☆ Save project"}
        </button>
        <button
          type="button"
          className="wm-planner-btnGhost"
          onClick={() => nav(ROUTE_PATHS.employeePlannerBrowse)}
        >
          Back to Browse Projects
        </button>
      </div>

      {toast ? (
        <div className="wm-planner-card" style={{ fontSize: 12, fontWeight: 700 }}>
          {toast}
        </div>
      ) : null}

      {pickOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1200,
            background: "rgba(15,23,42,0.45)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: 12,
          }}
          onClick={() => setPickOpen(false)}
        >
          <div
            className="wm-planner-card"
            style={{ width: "100%", maxWidth: 480, maxHeight: "85vh", overflow: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 16, fontWeight: 800 }}>{entry.planName}</div>
            <PlannerPickChooseCalendar
              availability={pickState.availability}
              predictor={pickState.predictor}
              onToggleDay={pickState.toggleDay}
              onSelectAllOpen={pickState.selectAllOpen}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                type="button"
                className="wm-planner-btnGhost"
                style={{ flex: 1 }}
                onClick={() => setPickOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="wm-planner-btnPrimary"
                style={{ flex: 1 }}
                disabled={pickState.selectedOpenDays.length === 0}
                onClick={pickState.submit}
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function EmployeeProjectDetailPage() {
  const { planId = "" } = useParams();

  const entry = useSyncExternalStore(
    plannerPublicIndex.subscribe,
    () => plannerPublicIndex.getByPlanId(planId),
    () => plannerPublicIndex.getByPlanId(planId),
  );

  if (!entry || entry.status === "cancelled") {
    return <Navigate to={ROUTE_PATHS.employeeHome} replace />;
  }

  return (
    <div className="wm-ee-vPlanner wm-planner-page">
      <ProjectDetailBody entry={entry} />
    </div>
  );
}
