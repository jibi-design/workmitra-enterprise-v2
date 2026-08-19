import { isCareerServerUuid } from "../utils/careerAppIdBridge";
import type {
  ServerCareerApplicationDto,
  ServerCareerEmploymentDto,
  ServerCareerPostDto,
} from "./careerGateApi.types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asIso(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  return "";
}

export function asServerEmployment(value: unknown): ServerCareerEmploymentDto | null {
  if (!isRecord(value)) return null;
  const id = typeof value.id === "string" ? value.id.trim() : "";
  if (!isCareerServerUuid(id)) return null;
  const detailsRaw = value.details;
  return {
    id,
    application_id: typeof value.application_id === "string" ? value.application_id : "",
    post_id: typeof value.post_id === "string" ? value.post_id : "",
    employee_user_id: typeof value.employee_user_id === "string" ? value.employee_user_id : "",
    employer_user_id: typeof value.employer_user_id === "string" ? value.employer_user_id : "",
    status: typeof value.status === "string" ? value.status : "active",
    details: isRecord(detailsRaw) ? detailsRaw : {},
    confirmed_at: asIso(value.confirmed_at),
    created_at: asIso(value.created_at),
    updated_at: asIso(value.updated_at),
  };
}

export function asServerApplication(value: unknown): ServerCareerApplicationDto | null {
  if (!isRecord(value)) return null;
  const id = typeof value.id === "string" ? value.id.trim() : "";
  const postId = typeof value.post_id === "string" ? value.post_id.trim() : "";
  if (!isCareerServerUuid(id) || !isCareerServerUuid(postId)) return null;

  return {
    id,
    post_id: postId,
    applicant_user_id: typeof value.applicant_user_id === "string" ? value.applicant_user_id : "",
    status: typeof value.status === "string" ? value.status : "",
    cover_note: typeof value.cover_note === "string" ? value.cover_note : null,
    applied_at: typeof value.applied_at === "string" ? value.applied_at : "",
    updated_at: typeof value.updated_at === "string" ? value.updated_at : "",
  };
}

export function asServerPost(value: unknown): ServerCareerPostDto | null {
  if (!isRecord(value)) return null;
  const id = typeof value.id === "string" ? value.id.trim() : "";
  if (!isCareerServerUuid(id)) return null;

  const detailsRaw = value.details;
  const details = isRecord(detailsRaw) ? detailsRaw : {};

  const created =
    typeof value.created_at === "string"
      ? value.created_at
      : value.created_at instanceof Date
        ? value.created_at.toISOString()
        : "";
  const updated =
    typeof value.updated_at === "string"
      ? value.updated_at
      : value.updated_at instanceof Date
        ? value.updated_at.toISOString()
        : "";

  return {
    id,
    employer_user_id: typeof value.employer_user_id === "string" ? value.employer_user_id : "",
    title: typeof value.title === "string" ? value.title : "",
    description: typeof value.description === "string" ? value.description : "",
    location: typeof value.location === "string" ? value.location : null,
    location_pincode: typeof value.location_pincode === "string" ? value.location_pincode : null,
    status: typeof value.status === "string" ? value.status : "",
    details,
    created_at: created,
    updated_at: updated,
  };
}
