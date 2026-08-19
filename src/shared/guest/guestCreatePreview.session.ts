/** Session skip: guest may fill create forms after Skip & Continue Preview. */

const KEY = "wm_guest_create_preview_v1";

export function hasGuestCreatePreviewSkip(): boolean {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setGuestCreatePreviewSkip(): void {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    /* ignore */
  }
}
