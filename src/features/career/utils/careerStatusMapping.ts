/**
 * MIG-009 / Phase 4: Career status mapping layer.
 * Client localStorage stages preserved; offer_declined is a distinct client status
 * (do NOT collapse to withdrawn — that is user-initiated exit only).
 */

/** Server SQL / API career_applications.status values (002_career_lifecycle.sql). */
export type ServerCareerStatus =
  | "pending"
  | "shortlisted"
  | "interview_scheduled"
  | "offer_issued"
  | "offer_accepted"
  | "offer_declined"
  | "hired"
  | "rejected"
  | "withdrawn";

/**
 * Client CareerApplicationStage values used in localStorage.
 * offer_declined added for server parity (was incorrectly mapped to withdrawn).
 */
export type ClientCareerStatus =
  | "applied"
  | "shortlisted"
  | "interview"
  | "offered"
  | "offer_accepted"
  | "offer_declined"
  | "hired"
  | "rejected"
  | "withdrawn";

export const SERVER_TO_CLIENT_STATUS: Record<ServerCareerStatus, ClientCareerStatus> = {
  pending: "applied",
  shortlisted: "shortlisted",
  interview_scheduled: "interview",
  offer_issued: "offered",
  offer_accepted: "offer_accepted",
  offer_declined: "offer_declined",
  hired: "hired",
  rejected: "rejected",
  withdrawn: "withdrawn",
};

export const CLIENT_TO_SERVER_STATUS: Record<ClientCareerStatus, ServerCareerStatus> = {
  applied: "pending",
  shortlisted: "shortlisted",
  interview: "interview_scheduled",
  offered: "offer_issued",
  offer_accepted: "offer_accepted",
  offer_declined: "offer_declined",
  hired: "hired",
  rejected: "rejected",
  withdrawn: "withdrawn",
};

export function toClientCareerStatus(server: ServerCareerStatus): ClientCareerStatus {
  return SERVER_TO_CLIENT_STATUS[server];
}

export function toServerCareerStatus(client: ClientCareerStatus): ServerCareerStatus {
  return CLIENT_TO_SERVER_STATUS[client];
}

export function parseServerCareerStatus(raw: string): ServerCareerStatus | null {
  const key = raw.trim() as ServerCareerStatus;
  if (key in SERVER_TO_CLIENT_STATUS) return key;
  return null;
}
