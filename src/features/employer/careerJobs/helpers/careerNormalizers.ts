// App name: Job Mitra
// File name: careerNormalizers.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\helpers\careerNormalizers.ts

export { clampApplicationStage } from "./careerEnumClamps";

export {
  readCareerActivityAll,
  readCareerApps,
  readCareerAppsForEmployee,
  readCareerPosts,
  readCareerWorkspaces,
  readCareerWorkspacesForEmployee,
  writeCareerActivityAll,
  writeCareerApps,
  writeCareerAppsForEmployee,
  writeCareerPosts,
  writeCareerWorkspaces,
  writeCareerWorkspacesForEmployee,
  getCareerEmployerAppsStorageKey,
  getCareerEmployeeAppsStorageKey,
  getCareerEmployerWorkspacesStorageKey,
  getCareerEmployeeWorkspacesStorageKey,
  resolveEmployerScopeIdForCareerJob,
  type CareerStorageWriteResult,
} from "./careerPersistence";
