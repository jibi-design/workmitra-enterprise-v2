// src/features/employer/hrManagement/storage/hrManagement.storage.ts
//
// Facade: re-exports all HR storage methods as the single hrManagementStorage object.
// Existing imports throughout the app remain unchanged.

import {
  hrGetAll,
  hrGetByStatus,
  hrGetById,
  hrFindByApplication,
  hrCountByStatus,
  hrUpdate,
  hrSubscribe,
  HR_CHANGED_EVENT,
} from "./hrStorage.core";
import { hrMoveToHR, hrSendOffer, hrAcceptOffer, hrRejectOffer } from "./hrStorage.offer";
import {
  hrStartOnboarding,
  hrToggleOnboardingItem,
  hrAddOnboardingItem,
  hrRemoveOnboardingItem,
} from "./hrStorage.onboarding";
import {
  hrGetProbationReminders,
  hrGetProbationOverdue,
  hrUpdateProbationPeriod,
  hrConfirmEmployee,
  hrRevertToProbation,
  hrCreateDirectRecord,
  hrApplyPromotion,
  hrApplyTransfer,
  hrSetContractDetails,
  hrRenewContract,
  hrGetContractReminders,
  hrGetContractOverdue,
} from "./hrStorage.employment";
import {
  hrStartExitProcessing,
  hrToggleClearanceItem,
  hrAddClearanceItem,
  hrSaveSettlementNote,
  hrMarkExperienceLetterSent,
  hrCompleteExit,
} from "./hrStorage.exit";

export const hrManagementStorage = {
  // Read
  getAll: hrGetAll,
  getByStatus: hrGetByStatus,
  getById: hrGetById,
  findByApplication: hrFindByApplication,
  countByStatus: hrCountByStatus,
  getProbationReminders: hrGetProbationReminders,
  getProbationOverdue: hrGetProbationOverdue,

  // Create
  moveToHR: hrMoveToHR,
  createDirectHRRecord: hrCreateDirectRecord,

  // Update
  update: hrUpdate,

  // Offer flow
  sendOffer: hrSendOffer,
  acceptOffer: hrAcceptOffer,
  rejectOffer: hrRejectOffer,

  // Onboarding flow
  startOnboarding: hrStartOnboarding,
  toggleOnboardingItem: hrToggleOnboardingItem,
  addOnboardingItem: hrAddOnboardingItem,
  removeOnboardingItem: hrRemoveOnboardingItem,

  // Employment transitions
  updateProbationPeriod: hrUpdateProbationPeriod,
  confirmEmployee: hrConfirmEmployee,
  revertToProbation: hrRevertToProbation,
  applyPromotion: hrApplyPromotion,
  applyTransfer: hrApplyTransfer,

  // Contract management
  setContractDetails: hrSetContractDetails,
  renewContract: hrRenewContract,
  getContractReminders: hrGetContractReminders,
  getContractOverdue: hrGetContractOverdue,

  // Exit processing
  startExitProcessing: hrStartExitProcessing,
  toggleClearanceItem: hrToggleClearanceItem,
  addClearanceItem: hrAddClearanceItem,
  saveSettlementNote: hrSaveSettlementNote,
  markExperienceLetterSent: hrMarkExperienceLetterSent,
  completeExit: hrCompleteExit,

  // Subscription
  subscribe: hrSubscribe,
  CHANGED_EVENT: HR_CHANGED_EVENT,
};