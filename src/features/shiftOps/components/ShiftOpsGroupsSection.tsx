/** Job Mitra | ShiftOpsGroupsSection.tsx | Joined groups — glass + pressable (Step 4) */

import { useMemo, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { EnterpriseEmpty } from "../../../shared/components/enterprise";
import { employeeProfileStorage } from "../../employee/profile/storage/employeeProfile.storage";
import {
  listSiteMembershipTruth,
  subscribeSiteMembershipTruth,
} from "../storage/siteMembershipTruth.storage";

function statusLabel(status: string): string {
  if (status === "ready_for_assignment") return "Ready";
  if (status === "pending_manager_approval") return "Pending approval";
  if (status === "rejected") return "Rejected";
  if (status === "revoked") return "Revoked";
  return status.replace(/_/g, " ");
}

export function ShiftOpsGroupsSection() {
  const nav = useNavigate();
  const workerMlId = useMemo(() => employeeProfileStorage.get().uniqueId?.trim() ?? "", []);

  const groups = useSyncExternalStore(
    subscribeSiteMembershipTruth,
    () => listSiteMembershipTruth(workerMlId || null),
    () => listSiteMembershipTruth(workerMlId || null),
  );

  return (
    <section
      className="wm-shift-surface-glass wm-shift-surface-glass--shift wm-ee-vShift"
      data-testid="shift-ops-groups-section"
      style={{ padding: "14px 14px 12px" }}
    >
      <div className="wm-pageSub">My Shift Groups</div>
      <div className="wm-ee-cardTitle" style={{ fontSize: 15, marginTop: 2 }}>
        Joined operational groups
      </div>

      {groups.length === 0 ? (
        <div style={{ marginTop: 12 }}>
          <EnterpriseEmpty
            domain="shift"
            title="No active groups"
            subtitle="Join a site group with your manager’s invite code or QR to unlock field ops tools."
            primaryLabel="Join via Code/QR"
            onPrimary={() => nav(ROUTE_PATHS.employeeShiftOpsInvite)}
            testId="shift-ops-groups-empty"
          />
        </div>
      ) : (
        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          {groups.map((group) => (
            <button
              key={group.membershipId}
              type="button"
              className="wm-shift-card wm-shift-pressable"
              data-testid={`shift-ops-group-${group.siteId}`}
              onClick={() => nav(ROUTE_PATHS.employeeShiftOpsHub)}
              style={{
                textAlign: "left",
                padding: "12px 14px",
                cursor: "pointer",
                width: "100%",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 900, color: "var(--wm-er-text)" }}>
                Group {group.siteId.slice(0, 8)}…
              </div>
              <div style={{ fontSize: 11, color: "#15803d", fontWeight: 700, marginTop: 4 }}>
                {statusLabel(String(group.status))}
              </div>
            </button>
          ))}
          <button
            type="button"
            className="wm-outlineBtn wm-shift-pressable"
            style={{ fontSize: 12 }}
            data-testid="shift-ops-groups-join-another"
            onClick={() => nav(ROUTE_PATHS.employeeShiftOpsInvite)}
          >
            Join another group via Code/QR
          </button>
        </div>
      )}
    </section>
  );
}
