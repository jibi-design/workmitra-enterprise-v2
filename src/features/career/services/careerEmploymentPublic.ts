// Cross-role career employment sync — employer reads employee-side bridge services.
// Do not import employee/careerJobs/services/* directly from employer features.

export {
  syncCareerSideRecordsAfterMarkJoined,
  syncCareerSideRecordsAfterResignation,
  syncCareerSideRecordsAfterWithdraw,
  syncCareerSideRecordsAfterConfirmResignation,
  syncCareerSideRecordsAfterTerminate,
  syncCareerSideRecordsAfterForceComplete,
} from "../../employee/careerJobs/services/careerEmploymentSideSyncService";
export type { CareerSideSyncResult } from "../../employee/careerJobs/services/careerEmploymentSideSyncService";

export {
  mapSharedEmploymentStatusToLifecycleStatus,
  mapSharedEmploymentStatusToStaffStatus,
} from "../../employee/careerJobs/services/careerEmploymentStatusMap";
