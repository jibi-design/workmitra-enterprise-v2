/**
 * Job Mitra | EmployerPlannerRosterPage.tsx
 * Hybrid A2 S7 — roster management console index.
 * Hybrid A2 P2.4 — understaff escalation PulseTargetCard.
 */

import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { PulseTargetCard } from "../../../pulse/PulseTarget";
import { getPlannerEscalation } from "../../../shared/planner/plannerEscalationRegistry";
import { runPlannerMilestoneEngine } from "../../../shared/planner/services/plannerMilestone.engine";
import {
  fireUnderstaffEscalations,
  listUnderstaffPlanIds,
} from "../../../shared/planner/services/plannerEscalationTriggers.service";
import { listActivePlannerPlansForRoster } from "../../../shared/planner/services/plannerRoster.helpers";

export function EmployerPlannerRosterPage() {
  const plans = useMemo(() => {
    runPlannerMilestoneEngine();
    return listActivePlannerPlansForRoster();
  }, []);

  const understaffPlanIds = listUnderstaffPlanIds();
  const understaffPulseId =
    getPlannerEscalation("PLANNER_UNDERSTAFF_RISK").pulseNodeId ??
    "employer-planner-roster-understaff";

  useEffect(() => {
    fireUnderstaffEscalations();
  }, []);

  return (
    <div className="wm-ee-vPlanner wm-planner-page" data-testid="planner-employer-roster">
      <section
        style={{
          marginBottom: 16,
          padding: 16,
          borderRadius: 18,
          border: "1px solid rgba(8,145,178,0.2)",
          background: "linear-gradient(135deg, rgba(8,145,178,0.1), rgba(255,255,255,0.98) 50%)",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "#0e7490",
            marginBottom: 6,
          }}
        >
          Hybrid A2 · Roster Console
        </div>
        <h1 className="wm-pageTitle" style={{ margin: 0 }}>
          Roster Management
        </h1>
        <p className="wm-pageSub" style={{ marginTop: 6 }}>
          Live coverage and milestone rollups for active plans.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
          <Link
            to={ROUTE_PATHS.employerPlannerHome}
            data-testid="planner-employer-roster-back"
            className="wm-outlineBtn"
            style={{
              display: "inline-flex",
              padding: "10px 14px",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Back to Planner Home
          </Link>
          <Link
            to={ROUTE_PATHS.employerPlannerPlans}
            data-testid="planner-employer-roster-plans"
            className="wm-primarybtn"
            style={{
              display: "inline-flex",
              padding: "10px 14px",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Open plans
          </Link>
          <Link
            to={ROUTE_PATHS.employerPlannerApplications}
            style={{
              display: "inline-flex",
              padding: "10px 14px",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: 700,
              border: "1px solid rgba(8,145,178,0.3)",
            }}
          >
            Batch applications
          </Link>
        </div>
      </section>

      {plans.length === 0 ? (
        <section
          data-testid="planner-employer-roster-empty"
          style={{
            padding: 28,
            borderRadius: 18,
            border: "1px dashed rgba(8,145,178,0.35)",
            textAlign: "center",
          }}
        >
          <div style={{ fontWeight: 900 }}>No active plans on roster</div>
          <p style={{ color: "#64748b", marginTop: 8 }}>
            Publish a plan and approve batches to populate the roster console.
          </p>
          <Link to={ROUTE_PATHS.employerPlannerCreate}>Create plan</Link>
        </section>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {plans.map((plan) => {
            const isUnderstaff = understaffPlanIds.has(plan.planId);
            const card = (
              <Link
                to={ROUTE_PATHS.employerPlannerRosterDetail.replace(":planId", plan.planId)}
                data-testid="planner-roster-plan-card"
                data-plan-id={plan.planId}
                data-understaff={isUnderstaff ? "1" : "0"}
                style={{
                  display: "block",
                  padding: 14,
                  borderRadius: 16,
                  border: "1px solid rgba(8,145,178,0.22)",
                  background: "#fff",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 800, color: "#0891b2" }}>
                  {plan.workerCount} workers · {plan.confirmedDayCount} confirmed days
                  {isUnderstaff ? " · understaff risk" : ""}
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, marginTop: 4 }}>{plan.planName}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                  {plan.companyName}
                </div>
              </Link>
            );

            if (!isUnderstaff) {
              return <div key={plan.planId}>{card}</div>;
            }

            return (
              <PulseTargetCard key={plan.planId} pulseId={understaffPulseId} radius="16px">
                {card}
              </PulseTargetCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
