// vaultAccessService.accessLog.ts

import type { VaultAccessEntry } from "../types/vaultTypes";
import { getAccessLog } from "./vaultAccessService.session.helpers";

export { getAccessLog };

export function getAccessLogSorted(): VaultAccessEntry[] {
  return getAccessLog().sort((a, b) => b.accessedAt - a.accessedAt);
}
