// Shared HR surface for employee employment UI.
// Do not import employer/hrManagement/* directly from employee features.

// Types
export type { HRCandidateRecord } from "../../employer/hrManagement/types/hrManagement.types";
export type { StaffAvailabilityRequest } from "../../employer/hrManagement/types/staffAvailability.types";
export type { TaskEntry } from "../../employer/hrManagement/types/taskAssignment.types";
export type { IncidentReport } from "../../employer/hrManagement/types/incidentReport.types";
export type { LeaveType } from "../../employer/hrManagement/types/leaveManagement.types";
export type { ReviewRating } from "../../employer/hrManagement/types/performanceReview.types";
export { LEAVE_TYPE_LABELS } from "../../employer/hrManagement/types/leaveManagement.types";
export {
  REVIEW_TYPE_LABELS,
  RATING_LABELS,
  RATING_COLORS,
} from "../../employer/hrManagement/types/performanceReview.types";

// Storage
export { hrManagementStorage } from "../../employer/hrManagement/storage/hrManagement.storage";
export { staffAvailabilityStorage } from "../../employer/hrManagement/storage/staffAvailability.storage";
export { taskAssignmentStorage } from "../../employer/hrManagement/storage/taskAssignment.storage";
export { incidentReportStorage } from "../../employer/hrManagement/storage/incidentReport.storage";
export { leaveManagementStorage } from "../../employer/hrManagement/storage/leaveManagement.storage";
export { performanceReviewStorage } from "../../employer/hrManagement/storage/performanceReview.storage";

// Services
export { hrService } from "../../employer/hrManagement/services/hrService";

// Hooks / subscriptions
export { useEmployeeSchedule } from "../../employer/hrManagement/helpers/rosterPlannerHooks";
export { useEmployeeAvailability } from "../../employer/hrManagement/helpers/staffAvailabilityHooks";
export { usePerformanceReviews } from "../../employer/hrManagement/helpers/performanceReviewSubscription";
export { useCandidateLeaveRequests } from "../../employer/hrManagement/helpers/leaveSubscription";

// Constants
export { getSiteColor } from "../../employer/hrManagement/helpers/rosterPlannerConstants";
export { REQUEST_STATUS_CONFIG } from "../../employer/hrManagement/helpers/staffAvailabilityConstants";
export { TASK_STATUS_CONFIG } from "../../employer/hrManagement/helpers/taskConstants";

// UI components (employee employment sections only)
export { LeaveBalanceCard } from "../../employer/hrManagement/components/LeaveBalanceCard";
export { LeaveRequestCard } from "../../employer/hrManagement/components/LeaveRequestCard";
