/** Job Mitra | employerShift.confirmHeal.ts | Confirm API timeout / already-confirmed heal */

import { ApiRequestError } from "../../../../shared/services/apiService";
import { shiftConfirmApi } from "../services/shiftConfirmApi.service";

export function isConfirmHealCandidate(err: unknown): boolean {
  if (err instanceof ApiRequestError) {
    if (err.status === 409 && err.code === "ALREADY_CONFIRMED") return true;
    if (err.status === 408 || err.status === 504) return true;
    if (err.status >= 500) return true;
  }
  if (err instanceof DOMException && err.name === "AbortError") return true;
  if (err instanceof TypeError) {
    const msg = err.message.toLowerCase();
    return (
      msg.includes("fetch") ||
      msg.includes("network") ||
      msg.includes("failed to fetch") ||
      msg.includes("load failed")
    );
  }
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return msg.includes("timeout") || msg.includes("network") || msg.includes("failed to fetch");
  }
  return false;
}

export async function healConfirmFromServer(
  postId: string,
  appId: string,
  expectedWorkerWmId: string,
): Promise<boolean> {
  try {
    const workspace = await shiftConfirmApi.getWorkspace(postId, appId);
    if (!workspace?.id || !workspace.post_id || !workspace.app_id) return false;
    const expected = expectedWorkerWmId.trim().toUpperCase();
    if (!expected) return false;
    if (workspace.worker_wm_id.trim().toUpperCase() !== expected) return false;
    return true;
  } catch {
    return false;
  }
}
