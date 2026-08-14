/**
 * Job Mitra | ShiftOpsActiveRosterCard.tsx
 * Live workers roster — modular rows + quick actions.
 */

import { useCallback, useEffect, useState } from "react";
import { getCurrentActorId } from "../../../app/identity/identity.adapter";
import { getEmployerBusinessKey } from "../../employer/company/helpers/employerDualId.helpers";
import { employerSettingsStorage } from "../../employer/company/storage/employerSettings.storage";
import type { ActiveGroupRosterRow, SiteRow } from "../types";
import { listManagedSites } from "../services/groupDailyOtp.service";
import { listActiveGroupRoster } from "../services/rosterReassign.service";
import { isShiftOpsAuthConfigNoise } from "../helpers/shiftOpsAuthNoise.helpers";
import { ShiftOpsManageAssignmentModal } from "./ShiftOpsManageAssignmentModal";
import { ShiftOpsWorkerRosterItem } from "./ShiftOpsWorkerRosterItem";

type Props = {
  initialGroupId?: string;
};

export function ShiftOpsActiveRosterCard({ initialGroupId = "" }: Props) {
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [groupId, setGroupId] = useState(initialGroupId);
  const [rows, setRows] = useState<ActiveGroupRosterRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [manageWorker, setManageWorker] = useState<ActiveGroupRosterRow | null>(null);

  const initiatorMl =
    getEmployerBusinessKey(employerSettingsStorage.get()) ??
    getCurrentActorId("employer").legacyId ??
    "";

  const refresh = useCallback(async (siteId: string) => {
    if (!siteId) {
      setRows([]);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const list = await listActiveGroupRoster(siteId);
      setRows(list);
    } catch (err) {
      const raw =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Couldn't load who's on today.";
      // Auth-bridge noise is shown once on Group Access — skip duplicate strips here.
      if (!isShiftOpsAuthConfigNoise(raw)) {
        setError(raw);
      }
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const managed = await listManagedSites();
        if (cancelled) return;
        setSites(managed);
        const nextId = initialGroupId || managed[0]?.id || "";
        setGroupId(nextId);
        if (nextId) await refresh(nextId);
      } catch (err) {
        if (cancelled) return;
        const raw =
          err && typeof err === "object" && "message" in err
            ? String((err as { message: string }).message)
            : "Couldn't load groups.";
        if (!isShiftOpsAuthConfigNoise(raw)) {
          setError(raw);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialGroupId, refresh]);

  const selectedSite = sites.find((s) => s.id === groupId);
  const groupName = selectedSite?.name ?? rows[0]?.site_name ?? "Group";

  return (
    <section className="wm-shiftOpsSectionCard" data-testid="shift-ops-active-roster">
      <header className="wm-shiftOpsSectionHead">
        <div>
          <div className="wm-shiftOpsSectionEyebrow">Live workers roster</div>
          <h2 className="wm-shiftOpsSectionTitle">Operational actions</h2>
        </div>
      </header>

      <p className="wm-shiftOpsSectionCopy">
        Call and Message unlock only for active group members. Contacts stay masked.
      </p>

      {sites.length === 0 ? (
        <div className="wm-shiftOpsEmptyState">
          <div className="wm-shiftOpsEmptyTitle">No managed groups yet</div>
          <p className="wm-shiftOpsEmptySubtitle">Create a group first to see live workers.</p>
        </div>
      ) : (
        <label className="wm-shiftOpsField">
          Active group
          <select
            className="wm-input"
            value={groupId}
            onChange={(e) => {
              const id = e.target.value;
              setGroupId(id);
              void refresh(id);
            }}
            data-testid="shift-ops-roster-group-select"
          >
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {error ? (
        <div role="alert" className="wm-shiftOpsErrorNote">
          {error}
        </div>
      ) : null}

      {busy ? <p className="wm-shiftOpsMetaLine">Loading roster…</p> : null}

      {!busy && groupId && rows.length === 0 ? (
        <div className="wm-shiftOpsEmptyState" data-testid="shift-ops-roster-empty">
          <div className="wm-shiftOpsEmptyTitle">No active workers in this group yet.</div>
          <p className="wm-shiftOpsEmptySubtitle">
            Approve pending workers or wait for check-ins to appear here.
          </p>
        </div>
      ) : null}

      {!busy && rows.length > 0 ? (
        <ul className="wm-shiftOpsWorkerList">
          {rows.map((row) => (
            <ShiftOpsWorkerRosterItem
              key={row.membership_id}
              row={row}
              groupName={groupName}
              initiatorMl={initiatorMl}
              onReassign={() => setManageWorker(row)}
              onEditShiftTime={() => setManageWorker(row)}
            />
          ))}
        </ul>
      ) : null}

      <ShiftOpsManageAssignmentModal
        open={Boolean(manageWorker)}
        onClose={() => setManageWorker(null)}
        worker={manageWorker}
        sites={sites}
        onSaved={(updated) => {
          setRows((prev) => {
            if (updated.site_id !== groupId) {
              return prev.filter((r) => r.membership_id !== updated.membership_id);
            }
            return prev.map((r) => (r.membership_id === updated.membership_id ? updated : r));
          });
          setManageWorker(null);
        }}
      />
    </section>
  );
}
