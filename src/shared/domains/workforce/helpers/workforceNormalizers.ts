// App: Job Mitra / WorkMitra_Enterprise_v2
// File: workforceNormalizers.ts — facade re-exports

export {
  normalizeCategory,
  readCategories,
  normalizeStaff,
  readStaff,
  normalizeTemplate,
  readTemplates,
} from "./workforceNormalizers.catalog";

export {
  normalizeAnnouncement,
  readAnnouncements,
  normalizeApplication,
  readApplications,
} from "./workforceNormalizers.announcements";

export {
  normalizeGroup,
  readGroups,
  normalizeMember,
  readMembers,
  normalizeAttendance,
  readAttendance,
  normalizeMessage,
  readMessages,
  normalizeActivity,
  readActivity,
} from "./workforceNormalizers.groups";
