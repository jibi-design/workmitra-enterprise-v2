// src/features/employer/hrManagement/helpers/staffAvailabilityConstants.ts
//
// Shared constants for Staff Availability Request (Root Map Section 7.4.13).
// Status visual config + mode labels used across all components.

import type {
  AvailabilityRequestStatus,
  AvailabilityResponseStatus,
  AvailabilityMode,
} from "../types/staffAvailability.types";

// ─────────────────────────────────────────────────────────────────────────────
// Request Status Config
// ─────────────────────────────────────────────────────────────────────────────

export type StatusConfig = {
  label: string;
  color: string;
  bg: string;
};

export const REQUEST_STATUS_CONFIG: Record<AvailabilityRequestStatus, StatusConfig> = {
  open:      { label: "Open",      color: "#0369a1", bg: "#eff6ff" },
  filled:    { label: "Filled",    color: "#15803d", bg: "#f0fdf4" },
  unfilled:  { label: "Unfilled",  color: "#dc2626", bg: "#fef2f2" },
  cancelled: { label: "Cancelled", color: "#6b7280", bg: "#f3f4f6" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Employee Response Status Config
// ─────────────────────────────────────────────────────────────────────────────

export const RESPONSE_STATUS_CONFIG: Record<AvailabilityResponseStatus, StatusConfig> = {
  pending:  { label: "Pending",  color: "#d97706", bg: "#fffbeb" },
  accepted: { label: "Accepted", color: "#15803d", bg: "#f0fdf4" },
  declined: { label: "Declined", color: "#dc2626", bg: "#fef2f2" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Mode Labels
// ─────────────────────────────────────────────────────────────────────────────

export const MODE_CONFIG: Record<AvailabilityMode, { label: string; description: string; icon: string }> = {
  simple: {
    label: "Quick Request",
    description: "All selected employees get notified at once. First to accept are confirmed.",
    icon: "⚡",
  },
  batch: {
    label: "Priority Batches",
    description: "Employees are grouped by priority. Batch 1 gets asked first. If not filled, Batch 2 is activated.",
    icon: "📋",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Limits
// ─────────────────────────────────────────────────────────────────────────────

export const MIN_REQUIRED_COUNT = 1;
export const MAX_REQUIRED_COUNT = 10;
export const MAX_BATCHES = 5;
