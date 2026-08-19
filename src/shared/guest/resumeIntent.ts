/**
 * Phase 4 — After auth, resume IntentPacket without dumping to generic home.
 */

import type { NavigateFunction } from "react-router-dom";
import { ROUTE_PATHS } from "../../app/router/routePaths";
import type { UserRole } from "../store/authStore";
import { consumeIntentPacket, type IntentPacket } from "./intentPacket";
import { guestStorage } from "./guestStorage";
import { migrateGuestArtifactsToUserProfile } from "./migrateGuestArtifacts";
import {
  getFavoriteShiftIds,
  toggleFavoriteShift,
} from "../../features/employee/shiftJobs/helpers/shiftSearchHelpers";

function homeForRole(role: UserRole): string {
  if (role === "employee") return ROUTE_PATHS.employeeHome;
  if (role === "employer") return ROUTE_PATHS.employerHome;
  return ROUTE_PATHS.adminHome;
}

function mapGuestPathToAuthed(path: string, role: UserRole): string {
  if (role !== "employee") return path;

  // Public guest routes → authenticated employee equivalents
  const shiftDetail = path.match(/^\/shifts\/([^/]+)\/?$/);
  if (shiftDetail?.[1]) {
    return ROUTE_PATHS.employeeShiftPostDetails.replace(":postId", shiftDetail[1]);
  }
  if (path === "/shifts" || path.startsWith("/shifts?")) {
    return ROUTE_PATHS.employeeShiftSearch;
  }

  const careerDetail = path.match(/^\/careers\/([^/]+)\/?$/);
  if (careerDetail?.[1]) {
    return ROUTE_PATHS.employeeCareerPostDetails.replace(":postId", careerDetail[1]);
  }
  if (path === "/careers" || path.startsWith("/careers?")) {
    return ROUTE_PATHS.employeeCareerSearch;
  }

  if (path === "/explore" || path.startsWith("/explore")) {
    return ROUTE_PATHS.employeeHome;
  }

  return path;
}

function fulfillIntentSideEffects(packet: IntentPacket): void {
  if (packet.action === "save_shift" && packet.targetId) {
    try {
      const existing = getFavoriteShiftIds();
      if (!existing.includes(packet.targetId)) {
        toggleFavoriteShift(packet.targetId);
      }
      if (!guestStorage.isShiftShortlisted(packet.targetId)) {
        guestStorage.toggleShortlistShift(packet.targetId);
      }
    } catch {
      /* ignore */
    }
  }
  if (packet.action === "save_career" && packet.targetId) {
    try {
      if (!guestStorage.isCareerShortlisted(packet.targetId)) {
        guestStorage.toggleShortlistCareer(packet.targetId);
      }
    } catch {
      /* ignore */
    }
  }
  if (
    packet.action === "create_draft" ||
    packet.action === "create_shift" ||
    packet.action === "create_career" ||
    packet.action === "create_planner" ||
    packet.action === "apply_shift" ||
    packet.action === "apply_career" ||
    packet.action === "apply_planner"
  ) {
    try {
      const kind =
        packet.action === "apply_career"
          ? "career_apply"
          : packet.action === "apply_planner"
            ? "shift_apply"
            : packet.action === "apply_shift"
              ? "shift_apply"
              : "employer_post";
      guestStorage.upsertDraft({
        kind,
        targetId: packet.targetId,
        payload: packet.payload ?? {},
      });
    } catch {
      /* ignore */
    }
  }
}

/**
 * Call after successful login/register. Migrates guest artifacts, then navigates
 * to intent return path (mapped into authed shell) or provided fallback.
 */
export function resumeIntentAfterAuth(
  nav: NavigateFunction,
  role: UserRole,
  fallback?: string,
): string {
  migrateGuestArtifactsToUserProfile();

  const packet = consumeIntentPacket();
  const baseFallback = fallback ?? homeForRole(role);

  if (!packet) {
    nav(baseFallback, { replace: true });
    return baseFallback;
  }

  fulfillIntentSideEffects(packet);

  const mapped = mapGuestPathToAuthed(packet.returnPath, role);
  // If employer logged in but intent was employee-scoped, prefer employee home only when role matches.
  const target =
    packet.roleHint === "employee" && role === "employee"
      ? mapped
      : packet.roleHint === "employer" && role === "employer"
        ? mapped
        : role === packet.roleHint
          ? mapped
          : baseFallback;

  nav(target, {
    replace: true,
    state: { resumedIntent: packet.action, targetId: packet.targetId },
  });
  return target;
}
