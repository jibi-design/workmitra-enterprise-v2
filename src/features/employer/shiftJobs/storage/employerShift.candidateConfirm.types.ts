import type { ShiftPost } from "./employerShift.types";

export type ConfirmCandidateSagaResult =
  | { ok: true; post: ShiftPost; workspaceId: string }
  | {
      ok: false;
      reason:
        | "not_found"
        | "not_confirmable"
        | "already_confirmed"
        | "vacancy_full"
        | "application_write_error"
        | "workspace_error"
        | "missing_muid"
        | "plan_error"
        | "diary_error";
    };

export type ConfirmDirectInviteSagaResult =
  | { ok: true; post: ShiftPost; appId: string; workspaceId: string }
  | {
      ok: false;
      reason:
        | "vacancy_full"
        | "already_confirmed"
        | "application_write_error"
        | "workspace_error"
        | "missing_muid"
        | "plan_error"
        | "diary_error";
    };

export type ReplaceCandidateSagaResult =
  | { ok: true; post: ShiftPost }
  | {
      ok: false;
      reason: "not_found" | "not_confirmed" | "application_write_error" | "workspace_write_error";
    };
