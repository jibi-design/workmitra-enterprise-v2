/**
 * Shared Career domain DB row types.
 * Used by both employee and employer sub-modules.
 * Contains NO business logic — pure data shapes only.
 */

export type CareerApplicationStatus =
  | "pending"
  | "shortlisted"
  | "interview_scheduled"
  | "offer_issued"
  | "offer_accepted"
  | "offer_declined"
  | "hired"
  | "rejected"
  | "withdrawn";

export type CareerOfferStatus = "pending" | "accepted" | "declined" | "expired" | "withdrawn";
export type CareerEmploymentStatus = "active" | "resigned" | "terminated";

export interface CareerPostRow {
  id: string;
  employer_user_id: string;
  title: string;
  description: string;
  location: string | null;
  location_pincode: string | null;
  status: string;
  details: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface CareerApplicationRow {
  id: string;
  post_id: string;
  applicant_user_id: string;
  status: CareerApplicationStatus;
  cover_note: string | null;
  applied_at: Date;
  updated_at: Date;
}

export interface CareerOfferRow {
  id: string;
  application_id: string;
  employer_user_id: string;
  status: CareerOfferStatus;
  terms: Record<string, unknown>;
  offered_at: Date;
  expires_at: Date | null;
  accepted_at: Date | null;
  declined_at: Date | null;
  updated_at: Date;
}

export interface CareerEmploymentRow {
  id: string;
  application_id: string;
  post_id: string;
  employee_user_id: string;
  employer_user_id: string;
  status: CareerEmploymentStatus;
  details: Record<string, unknown>;
  confirmed_at: Date;
  created_at: Date;
  updated_at: Date;
}
