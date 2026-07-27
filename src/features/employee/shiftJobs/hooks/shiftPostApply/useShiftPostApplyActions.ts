import { useNavigate } from "react-router-dom";
import type { ConfirmData } from "../../../../../shared/components/ConfirmModal";
import type { ShiftAnswerMap, ShiftNoteMap, ShiftQuickAnswerMap } from "./shiftPostApply.types";
import type { useShiftPostApplyDerived } from "./useShiftPostApplyDerived";
import { createShiftPostApplySubmitActions } from "./useShiftPostApplyActions.submit";
import { createShiftPostApplyWithdrawActions } from "./useShiftPostApplyActions.withdraw";

type Derived = ReturnType<typeof useShiftPostApplyDerived>;

export function createShiftPostApplyActions(input: {
  nav: ReturnType<typeof useNavigate>;
  derived: Derived;
  gates: { canSubmit: boolean; submitBlockReason: string | null };
  mustAns: ShiftAnswerMap;
  goodAns: ShiftAnswerMap;
  notes: ShiftNoteMap;
  quickAnswers: ShiftQuickAnswerMap;
  setFavoriteIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  setToast: React.Dispatch<React.SetStateAction<string>>;
  setWithdrawConfirm: React.Dispatch<React.SetStateAction<ConfirmData | null>>;
  setDoubleBookingPending: React.Dispatch<React.SetStateAction<boolean>>;
  setAttendanceConfirmPending: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const submitActions = createShiftPostApplySubmitActions(input);
  const withdrawActions = createShiftPostApplyWithdrawActions({
    nav: input.nav,
    derived: input.derived,
    setWithdrawConfirm: input.setWithdrawConfirm,
    setDoubleBookingPending: input.setDoubleBookingPending,
    setAttendanceConfirmPending: input.setAttendanceConfirmPending,
    showToast: submitActions.showToast,
    submitApplicationWithList: submitActions.submitApplicationWithList,
  });

  return {
    handleToggleSaved: submitActions.handleToggleSaved,
    submit: submitActions.submit,
    requestWithdraw: withdrawActions.requestWithdraw,
    requestConfirmAttendance: withdrawActions.requestConfirmAttendance,
    handleCancelConfirm: withdrawActions.handleCancelConfirm,
    handleConfirm: withdrawActions.handleConfirm,
    openWorkspace: submitActions.openWorkspace,
    openSearch: submitActions.openSearch,
  };
}
