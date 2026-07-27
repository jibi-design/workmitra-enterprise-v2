/** Job Mitra | PlannerRoleGroupManager.tsx | Role group CRUD for a DemandPlan */

import { useMemo, useState, useSyncExternalStore } from "react";
import { demandPlannerStorage, type PlanRoleGroup } from "../storage/demandPlannerStorage";

const COLORS = ["#0891b2", "#0e7490", "#ca8a04", "#16a34a", "#dc2626", "#7c3aed"];

type Props = {
  planId: string;
  onUpdate?: () => void;
};

function genGroupId(label: string): string {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 24);
  return `rg_${slug || "group"}_${Date.now().toString(36).slice(-4)}`;
}

function withAlpha(hex: string, alphaHex: string): string {
  if (/^#[0-9a-fA-F]{6}$/.test(hex)) return `${hex}${alphaHex}`;
  return hex;
}

export function PlannerRoleGroupManager({ planId, onUpdate }: Props) {
  const plan = useSyncExternalStore(
    demandPlannerStorage.subscribe,
    () => demandPlannerStorage.getById(planId),
    () => demandPlannerStorage.getById(planId),
  );

  const [label, setLabel] = useState("");
  const [color, setColor] = useState(COLORS[0]!);
  const [toast, setToast] = useState("");
  const [pendingDelete, setPendingDelete] = useState<PlanRoleGroup | null>(null);

  const roleGroups = useMemo(() => plan?.roleGroups ?? [], [plan?.roleGroups]);

  if (!plan) return null;

  function bump(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
    onUpdate?.();
  }

  function handleAdd() {
    const trimmed = label.trim();
    if (trimmed.length < 2) return;
    const group: PlanRoleGroup = {
      id: genGroupId(trimmed),
      label: trimmed,
      color,
      workerMlIds: [],
    };
    if (!demandPlannerStorage.upsertRoleGroup(planId, group)) return;
    setLabel("");
    bump(`Added group “${trimmed}”`);
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    const group = pendingDelete;
    setPendingDelete(null);
    if (!demandPlannerStorage.removeRoleGroup(planId, group.id)) return;
    bump(`Deleted “${group.label}”`);
  }

  return (
    <section
      className="wm-planner-card"
      data-testid="planner-role-group-manager"
      style={{ marginBottom: 12 }}
    >
      <div className="wm-planner-sectionLabel">Role groups</div>
      <div className="wm-planner-sectionTitle" style={{ fontSize: 15 }}>
        Crew roles for {plan.name}
      </div>
      <p style={{ fontSize: 12, color: "var(--wm-neutral-500)", marginTop: 4 }}>
        Create Kitchen / Security / Front of House buckets, then assign workers on the drag board.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
        {roleGroups.length === 0 ? (
          <span style={{ fontSize: 12, color: "#64748b" }}>No role groups yet.</span>
        ) : (
          roleGroups.map((g) => {
            const chipColor = g.color ?? "#0891b2";
            return (
              <div
                key={g.id}
                data-testid="planner-role-group-chip"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 10px",
                  borderRadius: 999,
                  border: `1px solid ${withAlpha(chipColor, "40")}`,
                  background: withAlpha(chipColor, "14"),
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: chipColor,
                  }}
                />
                {g.label}
                <span style={{ fontWeight: 600, color: "#64748b" }}>{g.workerMlIds.length}</span>
                <button
                  type="button"
                  data-testid="planner-role-group-delete"
                  aria-label={`Delete ${g.label}`}
                  onClick={() => setPendingDelete(g)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#b91c1c",
                    fontWeight: 800,
                    cursor: "pointer",
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
            );
          })
        )}
      </div>

      {pendingDelete ? (
        <div
          role="alertdialog"
          aria-label={`Delete ${pendingDelete.label}`}
          data-testid="planner-role-group-delete-confirm"
          style={{
            marginTop: 10,
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(185,28,28,0.22)",
            background: "rgba(185,28,28,0.06)",
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 800, color: "#b91c1c" }}>
            Delete “{pendingDelete.label}”?
          </div>
          <p
            style={{ fontSize: 12, color: "var(--wm-neutral-500)", marginTop: 4, marginBottom: 0 }}
          >
            Workers will be unassigned from this role group.
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              className="wm-dangerBtn"
              style={{ fontSize: 12 }}
              onClick={confirmDelete}
            >
              Delete group
            </button>
            <button
              type="button"
              className="wm-outlineBtn"
              style={{ fontSize: 12 }}
              onClick={() => setPendingDelete(null)}
            >
              Keep
            </button>
          </div>
        </div>
      ) : null}

      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12, alignItems: "center" }}
      >
        <input
          className="wm-input"
          data-testid="planner-role-group-label"
          placeholder="New group name"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          style={{ minWidth: 160, flex: 1 }}
        />
        <div
          role="radiogroup"
          aria-label="Role group color"
          data-testid="planner-role-group-color"
          style={{ display: "flex", gap: 6, alignItems: "center" }}
        >
          {COLORS.map((c) => {
            const selected = color === c;
            return (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={`Color ${c}`}
                onClick={() => setColor(c)}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: c,
                  border: selected ? `3px solid ${c}` : "2px solid rgba(255,255,255,0.6)",
                  boxShadow: selected
                    ? `0 0 0 2px ${withAlpha(c, "55")}, 0 4px 8px ${withAlpha(c, "44")}`
                    : "0 2px 4px rgba(0,0,0,0.12)",
                  cursor: "pointer",
                  padding: 0,
                  transition: "transform 120ms ease, box-shadow 120ms ease",
                  transform: selected ? "scale(1.05)" : "none",
                }}
              />
            );
          })}
        </div>
        <button
          type="button"
          className="wm-planner-btnPrimary"
          data-testid="planner-role-group-add"
          onClick={handleAdd}
        >
          Add Group
        </button>
      </div>
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
