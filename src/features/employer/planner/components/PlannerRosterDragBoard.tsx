/** Job Mitra | PlannerRosterDragBoard.tsx | Role-group assign board (dnd-kit + Move to…) */

import { useMemo, useState, useSyncExternalStore } from "react";
import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { listPlannerRosterAssignments } from "../../../shared/planner/services/plannerRoster.helpers";
import { getEmployerBusinessKey } from "../../company/helpers/employerDualId.helpers";
import { employerSettingsStorage } from "../../company/storage/employerSettings.storage";
import { demandPlannerStorage } from "../storage/demandPlannerStorage";
import { isSoSiteUuid } from "../../../shared/planner/ports/plannerMembershipBridge";
import { PlannerRosterDropColumn, type RosterWorkerCard } from "./PlannerRosterDragBoard.columns";

const UNASSIGNED = "__unassigned__";

type Props = {
  planId: string;
};

export function PlannerRosterDragBoard({ planId }: Props) {
  const plan = useSyncExternalStore(
    demandPlannerStorage.subscribe,
    () => demandPlannerStorage.getById(planId),
    () => demandPlannerStorage.getById(planId),
  );
  const [toast, setToast] = useState("");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const workers = useMemo(() => {
    const assignments = listPlannerRosterAssignments({ planId, confirmedOnly: true });
    const map = new Map<string, RosterWorkerCard>();
    for (const a of assignments) {
      const id = a.workerMlId.trim();
      if (!id || map.has(id)) continue;
      map.set(id, { workerMlId: id, workerName: a.workerName });
    }
    return [...map.values()];
  }, [planId]);

  const roleGroups = plan?.roleGroups ?? [];
  const assigned = new Set(roleGroups.flatMap((g) => g.workerMlIds));
  const unassigned = workers.filter((w) => !assigned.has(w.workerMlId));

  const roleOptions = [
    { id: UNASSIGNED, label: "Unassigned" },
    ...roleGroups.map((g) => ({ id: g.id, label: g.label })),
  ];

  function moveWorker(workerMlId: string, fromGroupId: string, toGroupId: string) {
    if (fromGroupId === toGroupId) return;
    if (toGroupId === UNASSIGNED) {
      if (fromGroupId !== UNASSIGNED) {
        const group = roleGroups.find((g) => g.id === fromGroupId);
        if (group) {
          demandPlannerStorage.upsertRoleGroup(planId, {
            ...group,
            workerMlIds: group.workerMlIds.filter((w) => w !== workerMlId),
          });
        }
      }
      setToast("Worker moved to Unassigned");
      return;
    }
    if (fromGroupId === UNASSIGNED) {
      demandPlannerStorage.assignWorkerToRoleGroup(planId, toGroupId, workerMlId);
    } else {
      demandPlannerStorage.moveWorkerBetweenGroups(planId, fromGroupId, toGroupId, workerMlId);
    }
    const label = roleGroups.find((g) => g.id === toGroupId)?.label ?? "group";
    setToast(`Worker moved to ${label}`);
    window.setTimeout(() => setToast(""), 2000);
  }

  function onDragEnd(event: DragEndEvent) {
    const toGroupId = event.over?.id ? String(event.over.id) : "";
    const fromGroupId = String(event.active.data.current?.fromGroupId ?? "");
    const workerMlId = String(event.active.data.current?.workerMlId ?? "");
    if (!toGroupId || !workerMlId) return;
    moveWorker(workerMlId, fromGroupId, toGroupId);
  }

  if (!plan) return null;

  const initiatorMl = getEmployerBusinessKey(employerSettingsStorage.get()) ?? "";
  const rawSite = plan.siteId?.trim() ?? "";
  const soGroupId = isSoSiteUuid(rawSite) ? rawSite : null;

  return (
    <section
      className="wm-planner-card"
      data-testid="planner-roster-drag-board"
      style={{ marginBottom: 12 }}
    >
      <div className="wm-planner-sectionLabel">Role assignment</div>
      <div className="wm-planner-sectionTitle" style={{ fontSize: 15 }}>
        Drag workers between role groups
      </div>
      {roleGroups.length === 0 ? (
        <p style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
          Create a role group first, then drag workers here.
        </p>
      ) : (
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <div
            style={{ display: "flex", gap: 10, overflowX: "auto", marginTop: 12, paddingBottom: 4 }}
          >
            <PlannerRosterDropColumn
              id={UNASSIGNED}
              title="Unassigned"
              color="#94a3b8"
              workers={unassigned}
              roleOptions={roleOptions}
              soGroupId={soGroupId}
              initiatorMl={initiatorMl}
              onMoveSelect={(ml, to) => moveWorker(ml, UNASSIGNED, to)}
            />
            {roleGroups.map((g) => {
              const columnWorkers = workers.filter((w) => g.workerMlIds.includes(w.workerMlId));
              return (
                <PlannerRosterDropColumn
                  key={g.id}
                  id={g.id}
                  title={g.label}
                  color={g.color ?? "#0891b2"}
                  workers={columnWorkers}
                  roleOptions={roleOptions}
                  soGroupId={soGroupId}
                  initiatorMl={initiatorMl}
                  onMoveSelect={(ml, to) => moveWorker(ml, g.id, to)}
                />
              );
            })}
          </div>
        </DndContext>
      )}
      {toast ? (
        <div
          role="status"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginTop: 8,
            padding: "4px 12px",
            borderRadius: 999,
            background: "rgba(8,145,178,0.1)",
            border: "1px solid rgba(8,145,178,0.22)",
            fontSize: 12,
            fontWeight: 800,
            color: "#0e7490",
          }}
        >
          {toast}
        </div>
      ) : null}
    </section>
  );
}
