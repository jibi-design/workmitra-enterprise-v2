// src/features/employer/hrManagement/types/incidentReport.types.ts
//
// Types for Incident / Issue Report (Root Map 5.3.12).
// Employee reports → Employer manages.
// Status: Reported → Acknowledged → In Progress → Resolved.

export type IncidentUrgency = "low" | "medium" | "high" | "critical";

export type IncidentStatus = "reported" | "acknowledged" | "in_progress" | "resolved";

export type IncidentReport = {
  /** Unique report ID */
  id: string;
  /** HR candidate record ID */
  hrCandidateId: string;
  /** Employment record ID (for employee side lookup) */
  employmentId: string;
  /** Employee who reported */
  employeeName: string;
  /** Report details */
  description: string;
  /** Location / Site */
  location: string;
  /** Urgency level */
  urgency: IncidentUrgency;
  /** Current status */
  status: IncidentStatus;
  /** Photo count (metadata — actual upload needs backend) */
  photoCount: number;
  /** Employer response notes */
  employerNotes: IncidentNote[];
  /** Timestamps */
  reportedAt: number;
  acknowledgedAt?: number;
  resolvedAt?: number;
  updatedAt: number;
};

export type IncidentNote = {
  id: string;
  content: string;
  createdAt: number;
};

export type IncidentFormData = {
  description: string;
  location: string;
  urgency: IncidentUrgency;
};