// src/shared/utils/jobAlertTypes.ts
//
// Job Alert / Saved Search types.
// Workers save search criteria → get notified when matching jobs posted.

/* ------------------------------------------------ */
/* Shared                                           */
/* ------------------------------------------------ */
export type AlertDomain = "shift" | "career";

export type JobAlert = {
  id: string;
  domain: AlertDomain;
  label: string;
  createdAt: number;
  lastCheckedAt: number;
  criteria: ShiftAlertCriteria | CareerAlertCriteria;
};

/* ------------------------------------------------ */
/* Shift criteria                                   */
/* ------------------------------------------------ */
export type ShiftAlertCriteria = {
  domain: "shift";
  query?: string;
  category?: string;
  experience?: string;
  minPay?: number;
};

/* ------------------------------------------------ */
/* Career criteria                                  */
/* ------------------------------------------------ */
export type CareerAlertCriteria = {
  domain: "career";
  query?: string;
  jobType?: string;
  workMode?: string;
  experience?: string;
  department?: string;
};

/* ------------------------------------------------ */
/* Constants                                        */
/* ------------------------------------------------ */
export const MAX_ALERTS = 5;
export const ALERT_STORAGE_KEY = "wm_employee_job_alerts_v1";