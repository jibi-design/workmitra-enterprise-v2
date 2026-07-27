export type WeekDay = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type WorkingDaysPreset = "mon_fri" | "mon_sat" | "custom";

export type CompanyHoliday = {
  id: string;
  /** Date in YYYY-MM-DD format */
  date: string;
  /** Holiday name */
  name: string;
};

export type CompanyConfig = {
  /** Working days preset */
  workingDaysPreset: WorkingDaysPreset;
  /** Custom working days (used when preset = "custom") */
  customWorkingDays: WeekDay[];
  /** Weekend days (auto-derived from working days, but stored for quick lookup) */
  weekendDays: WeekDay[];
  /** Default shift start time (HH:MM) */
  shiftStartTime: string;
  /** Default shift end time (HH:MM) */
  shiftEndTime: string;
  /** Company holidays list */
  holidays: CompanyHoliday[];
  /** Leave year start month (1-12, default 1 = January) */
  leaveYearStartMonth: number;
  /** Managed locations / sites */
  locations: string[];
  /** Managed departments / categories */
  departments: string[];
  /** Last updated timestamp */
  updatedAt: number;
};
