/** Job Mitra | plannerExecutionPort.ts | Default port accessor (Hybrid A2 S3) */

import { createShiftPlannerExecutionAdapter } from "./adapters/shiftPlannerExecutionAdapter";
import type { PlannerExecutionPort } from "./plannerExecutionPort.types";

let activePort: PlannerExecutionPort | null = null;

/** Returns the active execution port (Shift adapter by default). */
export function getPlannerExecutionPort(): PlannerExecutionPort {
  if (!activePort) {
    activePort = createShiftPlannerExecutionAdapter();
  }
  return activePort;
}

/** Test / future DI hook. */
export function setPlannerExecutionPort(port: PlannerExecutionPort | null): void {
  activePort = port;
}

export type { PlannerExecutionPort } from "./plannerExecutionPort.types";
export type {
  PlannerCheckInInput,
  PlannerCheckInResult,
  PlannerExecutionDayStatus,
} from "./plannerExecutionPort.types";
