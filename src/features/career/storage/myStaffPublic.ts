// Shared myStaff storage surface for career employment side-sync.
// Employee career employment bridge must not import employer/myStaff directly.

export {
  myStaffStorage,
  restoreStaffRecords,
} from "../../employer/myStaff/storage/myStaff.storage";
export type { StaffStatus, StaffExitReason } from "../../employer/myStaff/storage/myStaff.storage";
