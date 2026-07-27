/**
 * Job Mitra | rosterReassign.service.ts
 * Active group roster + reassignWorkerGroupAndRole (preserves membership status; no live timers in v2.0).
 */

import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { notifyCrossRole } from "../../pulse/pulseEventBridge";
import { getShiftOpsSupabase } from "../lib/supabaseClient";
import {
  listOverlayRoster,
  upsertOverlayRosterMember,
} from "../storage/shiftOpsRosterOverlay.storage";
import type {
  ActiveGroupRosterRow,
  ReassignWorkerResult,
  SiteMembershipRow,
  SoMembershipStatus,
} from "../types";
import { ensureShiftOpsAuthSession } from "./authBridge.service";
import { listManagedSites } from "./groupDailyOtp.service";
import { upsertSiteMembershipTruth } from "../storage/siteMembershipTruth.storage";

async function authedClient() {
  await ensureShiftOpsAuthSession();
  return getShiftOpsSupabase();
}

function mapRpcRosterRow(row: Record<string, unknown>): ActiveGroupRosterRow {
  return {
    membership_id: String(row.membership_id ?? ""),
    site_id: String(row.site_id ?? ""),
    site_name: String(row.site_name ?? "Group"),
    worker_user_id: String(row.worker_user_id ?? ""),
    display_name: String(row.display_name ?? "Worker"),
    status: (row.status as SoMembershipStatus) ?? "ready_for_assignment",
    assignment_zone: String(row.assignment_zone ?? "General"),
    crew_role: String(row.crew_role ?? "Staff"),
    jobmitra_ml_id: row.jobmitra_ml_id ? String(row.jobmitra_ml_id) : null,
    last_reassign_note: row.last_reassign_note ? String(row.last_reassign_note) : null,
    last_reassigned_at: row.last_reassigned_at ? String(row.last_reassigned_at) : null,
    created_at: String(row.created_at ?? new Date().toISOString()),
    updated_at: String(row.updated_at ?? new Date().toISOString()),
  };
}

function membershipToRoster(row: SiteMembershipRow, siteName: string): ActiveGroupRosterRow {
  return {
    membership_id: row.id,
    site_id: row.site_id,
    site_name: siteName,
    worker_user_id: row.worker_user_id,
    display_name: `Worker ${row.worker_user_id.slice(0, 8)}…`,
    status: row.status,
    assignment_zone: row.assignment_zone ?? "General",
    crew_role: row.crew_role ?? "Staff",
    jobmitra_ml_id: row.jobmitra_ml_id ?? null,
    last_reassign_note: row.last_reassign_note ?? null,
    last_reassigned_at: row.last_reassigned_at ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/** Active (ready_for_assignment) workers for a formal Shift Group / site. */
export async function listActiveGroupRoster(siteId: string): Promise<ActiveGroupRosterRow[]> {
  const id = siteId.trim();
  if (!id) return [];

  const syncTruth = (rows: ActiveGroupRosterRow[]) => {
    for (const row of rows) {
      const ml = row.jobmitra_ml_id?.trim();
      if (!ml || !row.membership_id) continue;
      upsertSiteMembershipTruth({
        siteId: row.site_id || id,
        workerMlId: ml,
        membershipId: row.membership_id,
        status: row.status,
      });
    }
  };

  try {
    const sb = await authedClient();
    const { data, error } = await sb.rpc("list_active_group_roster", { p_site_id: id });
    if (!error && Array.isArray(data)) {
      const mapped = (data as Record<string, unknown>[]).map(mapRpcRosterRow);
      syncTruth(mapped);
      return mapped;
    }

    // Fallback: direct select if RPC not applied yet
    const sites = await listManagedSites();
    const siteName = sites.find((s) => s.id === id)?.name ?? "Group";
    const { data: rows, error: selErr } = await sb
      .from("site_memberships")
      .select("*")
      .eq("site_id", id)
      .eq("status", "ready_for_assignment")
      .order("updated_at", { ascending: false });
    if (selErr) throw selErr;
    const mapped = ((rows ?? []) as SiteMembershipRow[]).map((r) =>
      membershipToRoster(r, siteName),
    );
    if (mapped.length > 0) {
      syncTruth(mapped);
      return mapped;
    }
  } catch {
    /* fall through to overlay */
  }

  const overlay = listOverlayRoster(id);
  if (overlay.length > 0) {
    syncTruth(overlay);
    return overlay;
  }
  return [];
}

export type ReassignWorkerInput = {
  membershipId: string;
  targetSiteId: string;
  assignmentZone: string;
  crewRole: string;
  note?: string;
  /** Current row for overlay / notify when RPC unavailable */
  current?: ActiveGroupRosterRow | null;
};

/**
 * Move worker between groups/zones and mutate crew role.
 * Does NOT reset membership status. Live QR check-in / shift timers are v2.1 (not in v2.0).
 */
export async function reassignWorkerGroupAndRole(
  input: ReassignWorkerInput,
): Promise<ReassignWorkerResult> {
  const membershipId = input.membershipId.trim();
  const targetSiteId = input.targetSiteId.trim();
  const zone = input.assignmentZone.trim() || "General";
  const crewRole = input.crewRole.trim() || "Staff";
  const note = input.note?.trim() ?? "";

  if (!membershipId || !targetSiteId) {
    throw new Error("membership_and_target_required");
  }

  let result: ReassignWorkerResult | null = null;

  try {
    const sb = await authedClient();
    const { data, error } = await sb.rpc("reassign_worker_group_and_role", {
      p_membership_id: membershipId,
      p_target_site_id: targetSiteId,
      p_assignment_zone: zone,
      p_crew_role: crewRole,
      p_note: note || null,
    });
    if (error) throw error;
    const raw = (data ?? {}) as Record<string, unknown>;
    if (raw.ok === false) throw new Error("reassign_failed");

    const sites = await listManagedSites().catch(() => []);
    const siteName =
      String(raw.site_name ?? "") ||
      sites.find((s) => s.id === String(raw.site_id ?? targetSiteId))?.name ||
      "Group";

    result = {
      ok: true,
      membership_id: String(raw.membership_id ?? membershipId),
      site_id: String(raw.site_id ?? targetSiteId),
      site_name: siteName,
      worker_user_id: String(raw.worker_user_id ?? input.current?.worker_user_id ?? ""),
      status: (raw.status as SoMembershipStatus) ?? "ready_for_assignment",
      assignment_zone: String(raw.assignment_zone ?? zone),
      crew_role: String(raw.crew_role ?? crewRole),
      jobmitra_ml_id: raw.jobmitra_ml_id
        ? String(raw.jobmitra_ml_id)
        : (input.current?.jobmitra_ml_id ?? null),
      last_reassign_note: raw.last_reassign_note ? String(raw.last_reassign_note) : note || null,
      last_reassigned_at: raw.last_reassigned_at
        ? String(raw.last_reassigned_at)
        : new Date().toISOString(),
    };
  } catch {
    // Overlay path when migration / RPC not applied
    const sites = await listManagedSites().catch(() => []);
    const siteName = sites.find((s) => s.id === targetSiteId)?.name ?? "Group";
    const base = input.current;
    if (!base) throw new Error("reassign_unavailable");

    result = {
      ok: true,
      membership_id: membershipId,
      site_id: targetSiteId,
      site_name: siteName,
      worker_user_id: base.worker_user_id,
      status: "ready_for_assignment",
      assignment_zone: zone,
      crew_role: crewRole,
      jobmitra_ml_id: base.jobmitra_ml_id,
      last_reassign_note: note || null,
      last_reassigned_at: new Date().toISOString(),
    };
  }

  const rosterRow: ActiveGroupRosterRow = {
    membership_id: result.membership_id,
    site_id: result.site_id,
    site_name: result.site_name,
    worker_user_id: result.worker_user_id,
    display_name: input.current?.display_name ?? "Worker",
    status: result.status,
    assignment_zone: result.assignment_zone,
    crew_role: result.crew_role,
    jobmitra_ml_id: result.jobmitra_ml_id,
    last_reassign_note: result.last_reassign_note,
    last_reassigned_at: result.last_reassigned_at,
    created_at: input.current?.created_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  upsertOverlayRosterMember(rosterRow);

  notifyWorkerReassignment(rosterRow, note);

  return result;
}

/** Bell/info notify — no raw contacts; FCM delivery follows platform notify stack. */
function notifyWorkerReassignment(row: ActiveGroupRosterRow, note: string): void {
  try {
    notifyCrossRole({
      type: "GROUP_UPDATE",
      domain: "shift",
      affectedUserRole: "employee",
      targetId: row.jobmitra_ml_id ?? row.worker_user_id,
      severity: "info",
      title: "Assignment updated",
      body: [
        `You were moved to ${row.site_name}`,
        `Zone: ${row.assignment_zone}`,
        `Role: ${row.crew_role}`,
        note ? `Note: ${note}` : "",
      ]
        .filter(Boolean)
        .join(" · "),
      route: ROUTE_PATHS.employeeShiftOpsReady,
    });
  } catch {
    /* never block reassignment */
  }
}

/** Privacy-safe group message (no phone/email). Active members only. */
export function sendShiftOpsGroupMessage(input: {
  groupId: string;
  groupName: string;
  receiverMl: string;
  workerName: string;
  body: string;
}): void {
  const body = input.body.trim();
  if (!body) return;
  notifyCrossRole({
    type: "GROUP_UPDATE",
    domain: "shift",
    affectedUserRole: "employee",
    targetId: input.receiverMl,
    severity: "info",
    title: `Message from ${input.groupName}`,
    body,
    route: ROUTE_PATHS.employeeShiftOpsReady,
  });
}
