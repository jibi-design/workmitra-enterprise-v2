// Shared re-export — employment lifecycle SoT remains employee storage implementation.
// Employer and shared modules must import from here, not features/employee/... directly.

export { employmentLifecycleStorage } from "../../features/employee/employment/storage/employmentLifecycle.storage";

export type {
  EmploymentStatus,
  ExitReason,
  EmploymentRecord,
} from "../../features/employee/employment/storage/employmentLifecycle.storage";
