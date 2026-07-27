/** Job Mitra | PlannerCrewBroadcastPanel.tsx | Targeted role-group BCC compose */

import { useState, useSyncExternalStore } from "react";
import { broadcastToPlanCrewByRoleGroup } from "../services/planBroadcast.service";
import { demandPlannerStorage } from "../storage/demandPlannerStorage";

const BODY_MAX = 500;

type Props = {
  planId: string;
};

export function PlannerCrewBroadcastPanel({ planId }: Props) {
  const plan = useSyncExternalStore(
    demandPlannerStorage.subscribe,
    () => demandPlannerStorage.getById(planId),
    () => demandPlannerStorage.getById(planId),
  );
  const [roleGroupId, setRoleGroupId] = useState("all");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [summary, setSummary] = useState("");
  const [summaryOk, setSummaryOk] = useState(false);

  if (!plan) return null;
  const roleGroups = plan.roleGroups ?? [];

  function handleSend() {
    const result = broadcastToPlanCrewByRoleGroup(planId, roleGroupId, title, body);
    if (!result.ok) {
      setSummaryOk(false);
      setSummary(
        result.reason === "no_members"
          ? "No workers in that role group yet."
          : result.reason === "role_group_not_found"
            ? "Role group not found."
            : "Broadcast failed. Confirm workers first.",
      );
      return;
    }
    const label =
      roleGroupId === "all"
        ? "All Crew"
        : (roleGroups.find((g) => g.id === roleGroupId)?.label ?? "group");
    setSummaryOk(true);
    setSummary(`Sent to ${result.delivered} of ${result.delivered} workers in ${label}`);
    setBody("");
  }

  return (
    <section
      className="wm-planner-card"
      data-testid="planner-broadcast-panel"
      style={{ marginBottom: 12 }}
    >
      <div className="wm-planner-sectionLabel">Crew broadcast</div>
      <div className="wm-planner-sectionTitle" style={{ fontSize: 15 }}>
        Send to role group
      </div>
      <label style={{ display: "grid", gap: 4, marginTop: 10, fontSize: 12 }}>
        Send to…
        <select
          className="wm-input"
          data-testid="planner-broadcast-role-select"
          value={roleGroupId}
          onChange={(e) => setRoleGroupId(e.target.value)}
        >
          <option value="all">All Crew</option>
          {roleGroups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.label}
            </option>
          ))}
        </select>
      </label>
      <input
        className="wm-input"
        style={{ marginTop: 8, width: "100%" }}
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        data-testid="planner-broadcast-title"
      />
      <div style={{ marginTop: 8 }}>
        <textarea
          className="wm-input"
          style={{ width: "100%", minHeight: 72 }}
          placeholder="Message"
          value={body}
          maxLength={BODY_MAX}
          onChange={(e) => setBody(e.target.value)}
          data-testid="planner-broadcast-body"
        />
        <div
          style={{
            marginTop: 4,
            fontSize: 11,
            fontWeight: 600,
            color: body.length > BODY_MAX - 40 ? "#b45309" : "#64748b",
            textAlign: "right",
          }}
        >
          {body.length}/{BODY_MAX}
        </div>
      </div>
      <button
        type="button"
        className="wm-planner-btnPrimary"
        style={{ marginTop: 10 }}
        data-testid="planner-broadcast-send"
        onClick={handleSend}
      >
        Send
      </button>
      {summary ? (
        <div
          role="status"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginTop: 10,
            padding: "8px 14px",
            borderRadius: 12,
            background: summaryOk ? "rgba(8,145,178,0.08)" : "rgba(185,28,28,0.06)",
            border: summaryOk ? "1px solid rgba(8,145,178,0.2)" : "1px solid rgba(185,28,28,0.18)",
            fontSize: 12,
            fontWeight: 700,
            color: summaryOk ? "#0e7490" : "#b91c1c",
          }}
        >
          <span style={{ fontSize: 14 }} aria-hidden>
            {summaryOk ? "✓" : "!"}
          </span>
          {summary}
        </div>
      ) : null}
    </section>
  );
}
