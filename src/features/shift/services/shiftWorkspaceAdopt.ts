/** Job Mitra | shiftWorkspaceAdopt.ts | Replace local workspace id with server UUID */

import { isShiftServerUuid, shiftWorkspaceIdBridge } from "../utils/shiftIdBridge";
import {
  readEmployerShiftWorkspaces,
  writeEmployerShiftWorkspaces,
} from "../../employer/shiftJobs/storage/employerShiftWorkspace.persistence";

export function adoptServerWorkspaceId(localId: string, serverId: string): string {
  const local = localId.trim();
  const server = serverId.trim();
  if (!local || !isShiftServerUuid(server)) return local || server;
  shiftWorkspaceIdBridge.upsert(local, server);
  if (local === server) return server;
  const next = readEmployerShiftWorkspaces().map((row) =>
    row.id === local ? { ...row, id: server } : row,
  );
  writeEmployerShiftWorkspaces(next);
  return server;
}
