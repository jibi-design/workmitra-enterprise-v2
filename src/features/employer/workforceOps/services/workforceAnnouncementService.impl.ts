import type { CreateAnnouncementPayload } from "./workforceAnnouncementService.types";
import {
  cloneAnnouncement,
  createAnnouncement,
  createAnnouncementFromTemplate,
  saveAnnouncementAsTemplate,
} from "./workforceAnnouncementService.create";
import {
  countAnnouncementsByStatus,
  getAnnouncementTotalVacancy,
  queryAnnouncements,
  toggleAnnouncementAutoReplace,
  updateAnnouncementStatus,
  WF_ANNOUNCEMENTS_CHANGED,
} from "./workforceAnnouncementService.status";

const queries = queryAnnouncements();

export const workforceAnnouncementService = {
  getAll: queries.getAll,
  getById: queries.getById,
  getByStatus: queries.getByStatus,
  getActiveAnnouncements: queries.getActiveAnnouncements,
  getConfirmedForDate: queries.getConfirmedForDate,

  create: createAnnouncement,
  clone: cloneAnnouncement,
  createFromTemplate: createAnnouncementFromTemplate,
  updateStatus: updateAnnouncementStatus,
  toggleAutoReplace: toggleAnnouncementAutoReplace,
  saveAsTemplate: saveAnnouncementAsTemplate,
  countByStatus: countAnnouncementsByStatus,
  getTotalVacancy: getAnnouncementTotalVacancy,

  _events: {
    changed: WF_ANNOUNCEMENTS_CHANGED,
  },
} as const;

export type { CreateAnnouncementPayload };
