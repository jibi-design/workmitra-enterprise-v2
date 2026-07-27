// src/features/employer/careerJobs/services/careerPostService.ts
//
// Career Job Post lifecycle management — facade re-exports.

export {
  getCareerPosts,
  loadCareerPosts,
  getCareerPost,
  getCareerApplicationsForPost,
  getCareerApplication,
  getCareerActivityForPost,
  getCareerTemplates,
} from "./careerPostService.read";

export {
  createCareerPost,
  cloneCareerPost,
  saveCareerPostAsTemplate,
  type CareerPostCreateInput,
} from "./careerPostService.create";

export {
  pauseCareerPost,
  resumeCareerPost,
  closeCareerPost,
  deleteCareerPost,
} from "./careerPostService.lifecycle";
