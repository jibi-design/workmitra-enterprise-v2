/** Staff scan: server lookup + single-consume (cloud) or local check_in lock. */

import { ApiRequestError } from "../../../shared/services/apiService";
import type { PassVerifyBadge } from "./mitraLabs.helpers";
import { resolvePassGatePinFolderId } from "./eventDayGatePinFolders.helpers";
import { consumeLocalStaffScan, lookupLocalStaffScan } from "./eventDayLocalEntry";
import {
  eventDayEmployerApi,
  isEventDayCloudEnabled,
  type ScannerPassView,
} from "../services/eventDayEmployerApi";

export type StaffScanOutcome = {
  readonly badge: PassVerifyBadge;
  readonly guestName: string;
  readonly detail: string;
};

function viewToOutcome(view: ScannerPassView, badge: PassVerifyBadge): StaffScanOutcome {
  const guestName = view.guestName?.trim() ?? "";
  const venue = view.venueName?.trim() ?? "";
  return {
    badge,
    guestName,
    detail: guestName && venue ? `${guestName} · ${venue}` : guestName || venue || "No matching pass.",
  };
}

async function cloudScan(
  token: string,
  folderId: string,
  issuerId: string,
): Promise<StaffScanOutcome> {
  const view = await eventDayEmployerApi.lookupScan(token);
  if (
    resolvePassGatePinFolderId({
      issuerId,
      eventName: view.eventName,
      venue: { name: view.venueName ?? "" },
      validFrom: view.validFrom ?? "",
    }) !== folderId
  ) {
    return {
      badge: "INVALID",
      guestName: view.guestName?.trim() ?? "",
      detail: "This pass belongs to a different event.",
    };
  }
  if (view.badge !== "VALID") return viewToOutcome(view, view.badge);
  try {
    const consumed = await eventDayEmployerApi.consumeScan(token, folderId);
    return viewToOutcome(consumed.pass, "VALID");
  } catch (err) {
    if (err instanceof ApiRequestError && err.code === "ALREADY_CHECKED_IN") {
      return viewToOutcome(view, "USED");
    }
    throw err;
  }
}

export async function runStaffGateScan(
  token: string,
  staffName: string,
  folderId: string,
  issuerId: string,
): Promise<StaffScanOutcome> {
  if (isEventDayCloudEnabled()) {
    return cloudScan(token, folderId, issuerId);
  }
  const local = lookupLocalStaffScan(token);
  if (!local.pass) {
    return { badge: "INVALID", guestName: "", detail: "No matching pass for this code." };
  }
  if (resolvePassGatePinFolderId(local.pass) !== folderId) {
    return {
      badge: "INVALID",
      guestName: local.pass.guestName,
      detail: "This pass belongs to a different event.",
    };
  }
  if (local.badge !== "VALID") {
    return {
      badge: local.badge,
      guestName: local.pass.guestName,
      detail: `${local.pass.guestName} · ${local.pass.venue.name}`,
    };
  }
  const consumed = consumeLocalStaffScan(local.pass, staffName);
  if (!consumed.ok) {
    return {
      badge: consumed.badge,
      guestName: local.pass.guestName,
      detail: `${local.pass.guestName} · ${local.pass.venue.name}`,
    };
  }
  return {
    badge: "VALID",
    guestName: local.pass.guestName,
    detail: `${local.pass.guestName} · ${local.pass.venue.name}`,
  };
}
