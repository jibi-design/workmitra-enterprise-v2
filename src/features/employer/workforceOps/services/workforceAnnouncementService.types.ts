import type { AnnouncementShift } from "../../../../shared/domains/workforce/types/workforceTypes";

export type CreateAnnouncementPayload = {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  targetCategories: string[];
  shifts: AnnouncementShift[];
  vacancyPerCategoryPerShift: Record<string, Record<string, number>>;
  waitingBuffer: number;
  autoReplace: boolean;
};
