// Employer-safe read-only facade for employee availability broadcast pool.
// Employers must not import employee/shiftJobs/storage directly.

export {
  availabilityStorage,
  getRolling7Days,
  toIsoDate,
} from "../../employee/shiftJobs/storage/availabilityStorage";

export type {
  AvailabilityBroadcast,
  RollingDay,
} from "../../employee/shiftJobs/storage/availabilityStorage";
