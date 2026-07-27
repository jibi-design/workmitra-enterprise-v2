/** Job Mitra | PlannerRosterDragBoard.columns.tsx | DnD columns + gated call */

import { useSyncExternalStore } from "react";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GatedCallButton } from "../../../shared/calling";
import {
  getSiteMembershipTruth,
  subscribeSiteMembershipTruth,
} from "../../../shared/planner/ports/plannerMembershipBridge";

export type RosterWorkerCard = { workerMlId: string; workerName: string };

function withAlpha(hex: string, alphaHex: string): string {
  if (/^#[0-9a-fA-F]{6}$/.test(hex)) return `${hex}${alphaHex}`;
  return hex;
}

function DraggableWorker({ worker, columnId }: { worker: RosterWorkerCard; columnId: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `${columnId}::${worker.workerMlId}`,
    data: { workerMlId: worker.workerMlId, fromGroupId: columnId },
  });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.6 : 1,
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid rgba(8,145,178,0.25)",
    background: "rgba(255,255,255,0.82)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    fontSize: 12,
    fontWeight: 700,
    cursor: "grab",
    marginBottom: 6,
  };
  return (
    <div
      ref={setNodeRef}
      className="wm-planner-rosterWorkerCard"
      style={style}
      {...listeners}
      {...attributes}
      data-testid="planner-roster-worker-card"
    >
      {worker.workerName}
    </div>
  );
}

function RosterWorkerCall({
  worker,
  groupId,
  initiatorMl,
}: {
  worker: RosterWorkerCard;
  groupId: string | null;
  initiatorMl: string;
}) {
  const membership = useSyncExternalStore(
    subscribeSiteMembershipTruth,
    () => getSiteMembershipTruth(groupId, worker.workerMlId),
    () => getSiteMembershipTruth(groupId, worker.workerMlId),
  );
  return (
    <div
      style={{ marginBottom: 8 }}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <GatedCallButton
        groupId={groupId}
        membershipStatus={membership?.status}
        workerMlId={worker.workerMlId}
        initiatorMl={initiatorMl}
        peerLabel={worker.workerName}
        extraDisabled={!initiatorMl}
      />
    </div>
  );
}

export function PlannerRosterDropColumn({
  id,
  title,
  color,
  workers,
  roleOptions,
  soGroupId,
  initiatorMl,
  onMoveSelect,
}: {
  id: string;
  title: string;
  color: string;
  workers: RosterWorkerCard[];
  roleOptions: { id: string; label: string }[];
  soGroupId: string | null;
  initiatorMl: string;
  onMoveSelect: (workerMlId: string, toGroupId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className="wm-planner-rosterColumn"
      data-testid={`planner-roster-column-${id}`}
      style={{
        minWidth: 180,
        flex: 1,
        padding: 10,
        borderRadius: 14,
        border: isOver ? `2px solid ${color}` : `1px solid ${withAlpha(color, "40")}`,
        background: isOver ? "rgba(8,145,178,0.12)" : "rgba(255,255,255,0.55)",
        backdropFilter: "blur(10px) saturate(140%)",
        WebkitBackdropFilter: "blur(10px) saturate(140%)",
        boxShadow: isOver
          ? `0 0 0 3px ${withAlpha(color, "18")}, 0 12px 24px rgba(8,145,178,0.12)`
          : "0 4px 12px rgba(15,23,42,0.04)",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 900, marginBottom: 8, color }}>
        {title} · {workers.length}
      </div>
      {workers.map((w) => (
        <div key={w.workerMlId}>
          <DraggableWorker worker={w} columnId={id} />
          <RosterWorkerCall worker={w} groupId={soGroupId} initiatorMl={initiatorMl} />
          <select
            className="wm-input"
            aria-label={`Move ${w.workerName}`}
            data-testid="planner-roster-move-select"
            defaultValue=""
            onChange={(e) => {
              const to = e.target.value;
              e.target.value = "";
              if (to) onMoveSelect(w.workerMlId, to);
            }}
            style={{ width: "100%", marginBottom: 8, fontSize: 11 }}
          >
            <option value="">Move to…</option>
            {roleOptions
              .filter((o) => o.id !== id)
              .map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
          </select>
        </div>
      ))}
    </div>
  );
}
