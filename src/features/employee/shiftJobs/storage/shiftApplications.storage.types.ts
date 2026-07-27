export type WithdrawShiftApplicationResult =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly reason: "not_found" | "not_withdrawable" | "storage_error";
    };

export type CancelConfirmedAssignmentResult =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly reason: "not_found" | "not_confirmed" | "storage_error";
    };

export type ConfirmShiftAttendanceResult =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly reason: "not_found" | "not_confirmed" | "already_confirmed" | "storage_error";
    };
