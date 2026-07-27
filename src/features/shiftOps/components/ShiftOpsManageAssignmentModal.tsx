/**
 * Job Mitra | ShiftOpsManageAssignmentModal.tsx
 * Executive glass SlideOver — group/zone + crew role reassignment.
 */

import { useEffect, useState } from "react";
import { SlideOver } from "../../../shared/components/enterprise";
import { SHIFT_OPS_CREW_ROLES, SHIFT_OPS_ZONES } from "../helpers/shiftOpsCommsGate.helpers";
import { reassignWorkerGroupAndRole } from "../services/rosterReassign.service";
import type { ActiveGroupRosterRow } from "../types";
import type { SiteRow } from "../types";

type Props = {
  open: boolean;
  onClose: () => void;
  worker: ActiveGroupRosterRow | null;
  sites: SiteRow[];
  onSaved: (row: ActiveGroupRosterRow) => void;
};

export function ShiftOpsManageAssignmentModal({ open, onClose, worker, sites, onSaved }: Props) {
  const [siteId, setSiteId] = useState("");
  const [zone, setZone] = useState("General");
  const [crewRole, setCrewRole] = useState("Staff");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!worker || !open) return;
    queueMicrotask(() => {
      setSiteId(worker.site_id);
      setZone(worker.assignment_zone || "General");
      setCrewRole(worker.crew_role || "Staff");
      setNote("");
      setError(null);
    });
  }, [worker, open]);

  async function submit() {
    if (!worker) return;
    setBusy(true);
    setError(null);
    try {
      const result = await reassignWorkerGroupAndRole({
        membershipId: worker.membership_id,
        targetSiteId: siteId,
        assignmentZone: zone,
        crewRole,
        note,
        current: worker,
      });
      onSaved({
        ...worker,
        site_id: result.site_id,
        site_name: result.site_name,
        assignment_zone: result.assignment_zone,
        crew_role: result.crew_role,
        last_reassign_note: result.last_reassign_note,
        last_reassigned_at: result.last_reassigned_at,
        status: result.status,
        updated_at: new Date().toISOString(),
      });
      setBusy(false);
      onClose();
    } catch (err) {
      setBusy(false);
      setError(
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Reassignment failed",
      );
    }
  }

  return (
    <SlideOver
      open={open}
      onClose={() => {
        if (!busy) onClose();
      }}
      title="Manage Assignment"
      subtitle={worker ? `${worker.display_name} · live shift control` : undefined}
      testId="shift-ops-manage-assignment"
      variant="default"
      footer={
        <>
          <button
            type="button"
            className="wm-primarybtn"
            disabled={busy || !worker || !siteId}
            onClick={() => void submit()}
            data-testid="shift-ops-reassign-submit"
          >
            {busy ? "Saving…" : "Save assignment"}
          </button>
          <button type="button" className="wm-outlineBtn" disabled={busy} onClick={onClose}>
            Cancel
          </button>
        </>
      }
    >
      {!worker ? (
        <p style={{ fontSize: 13 }}>No worker selected.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          <p style={{ fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.45, margin: 0 }}>
            Move between groups/zones and change crew role. Membership status stays the same. Live
            QR check-in and shift timers are not part of v2.0 (planned for v2.1).
          </p>

          <label style={{ display: "grid", gap: 4, fontSize: 12, fontWeight: 700 }}>
            Group / Zone site
            <select
              className="wm-input"
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              data-testid="shift-ops-reassign-site"
            >
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: 4, fontSize: 12, fontWeight: 700 }}>
            Assignment zone
            <select
              className="wm-input"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              data-testid="shift-ops-reassign-zone"
            >
              {[...new Set([zone, ...SHIFT_OPS_ZONES])].map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: 4, fontSize: 12, fontWeight: 700 }}>
            Crew role
            <select
              className="wm-input"
              value={crewRole}
              onChange={(e) => setCrewRole(e.target.value)}
              data-testid="shift-ops-reassign-role"
            >
              {[...new Set([crewRole, ...SHIFT_OPS_CREW_ROLES])].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: 4, fontSize: 12, fontWeight: 700 }}>
            Re-assignment reason / note (optional)
            <input
              className="wm-input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Cover Zone B lunch rush"
              maxLength={200}
              data-testid="shift-ops-reassign-note"
            />
          </label>

          {error ? (
            <div role="alert" className="wm-planner-errorBox" style={{ marginTop: 0 }}>
              {error}
            </div>
          ) : null}
        </div>
      )}
    </SlideOver>
  );
}
