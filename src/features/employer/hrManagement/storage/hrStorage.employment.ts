// src/features/employer/hrManagement/storage/hrStorage.employment.ts — facade

export {
  hrGetProbationReminders,
  hrGetProbationOverdue,
  hrUpdateProbationPeriod,
  hrConfirmEmployee,
  hrRevertToProbation,
} from "./hrStorage.employment.probation";

export {
  hrCreateDirectRecord,
  hrApplyPromotion,
  hrApplyTransfer,
} from "./hrStorage.employment.actions";

export {
  hrSetContractDetails,
  hrRenewContract,
  hrGetContractReminders,
  hrGetContractOverdue,
} from "./hrStorage.employment.contract";
