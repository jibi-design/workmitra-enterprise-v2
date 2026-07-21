/** Job Mitra | plannerExecutionPort.types.ts | Hybrid A2 P1.2 execution contract */

export type PlannerCheckInInput = {
  readonly planId: string;
  readonly slotDate: string;
  readonly workerMlId: string;
  /** Legacy dual-write post id when present. */
  readonly postId?: string;
  readonly applicationId?: string;
  readonly workspaceId?: string;
};

export type PlannerCheckInResult =
  | {
      readonly ok: true;
      readonly checkedInAt: number;
      readonly workspaceId: string | null;
      readonly applicationId: string | null;
      readonly via: "shift_attendance" | "planner_ledger";
    }
  | {
      readonly ok: false;
      readonly reason:
        "missing_ids" | "not_found" | "not_confirmed" | "already_checked_in" | "storage_error";
    };

export type PlannerExecutionDayStatus = {
  readonly planId: string;
  readonly slotDate: string;
  readonly postId: string | null;
  readonly applicationId: string | null;
  readonly workspaceId: string | null;
  readonly attendanceConfirmed: boolean;
  readonly checkedInAt: number | null;
  readonly workspaceStatus: string | null;
};

/**
 * Anti-corruption port: Planner never imports Shift Jobs directly for day execution.
 * Shift remains the day-level check-in engine behind this adapter.
 */
export type PlannerExecutionPort = {
  readonly recordDailyCheckIn: (input: PlannerCheckInInput) => PlannerCheckInResult;
  readonly getDayExecutionStatus: (input: {
    planId: string;
    slotDate: string;
    workerMlId: string;
    postId?: string;
  }) => PlannerExecutionDayStatus | null;
  readonly listPlanDayStatuses: (
    planId: string,
    workerMlId: string,
  ) => readonly PlannerExecutionDayStatus[];
};
