/**
 * Job Mitra | announceForm.types.ts
 * Shared types for the Employer Workforce Announce flow.
 * Extracted here to break the circular import between
 * EmployerWorkforceAnnouncePage and its 8 child step/preview components.
 */

import type { AnnouncementShift } from "../../../../shared/domains/workforce/types/workforceTypes";

export type AnnounceFormData = {
  targetCategories: string[];
  shifts: AnnouncementShift[];
  vacancyPerCategoryPerShift: Record<string, Record<string, number>>;
  waitingBuffer: number;
  autoReplace: boolean;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
};
