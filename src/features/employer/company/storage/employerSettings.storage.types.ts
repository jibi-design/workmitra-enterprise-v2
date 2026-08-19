import type {
  EmployerTransferStatus,
  EmployerVerificationAudit,
  EmployerVerificationLevel,
  EmployerPendingTransfer,
  OwnershipAuditEntry,
} from "../helpers/employerIdentity.types";
import type {
  EmployerVerificationTrackKind,
  EnterpriseVerificationTrack,
  MicroVerificationTrack,
} from "../helpers/employerVerificationTracks";

export interface EmployerProfile {
  /** Stable random business org key — ratings, posts, audit. Never from company name. */
  employerOrgId?: string;
  /** Owner person pointer — mutable only via governed transfer. */
  ownerUserId?: string;
  /** @deprecated Use companyUniqueId — kept for backward compatibility with stored demos. */
  uniqueId?: string;
  /** Owner personal Mitra Labs ID. Private — settings/auth only. */
  ownerUniqueId?: string;
  /** Public ML-format display id on job posts (random block, not tied to name). */
  companyUniqueId?: string;
  /** Public profile slug / share link. */
  publicHandle?: string;
  /** Prior handles that redirect to current publicHandle. */
  previousHandles?: string[];
  transferStatus?: EmployerTransferStatus;
  businessAdminIds?: string[];
  contactVerified?: boolean;
  verificationLevel?: EmployerVerificationLevel;
  verificationAudit?: EmployerVerificationAudit;
  /** Active dual-track verification path. */
  verificationTrack?: EmployerVerificationTrackKind;
  enterpriseTrack?: EnterpriseVerificationTrack;
  microTrack?: MicroVerificationTrack;
  pendingTransfer?: EmployerPendingTransfer;
  ownershipAuditLog?: OwnershipAuditEntry[];
  createdAt?: number;
  updatedAt?: number;

  /** Company details */
  companyName: string;
  /** Legacy free-text registration (GST/CIN/license) — still accepted as document evidence. */
  registrationNo: string;
  /** Base64 data URL for company logo (max 2MB source file). */
  companyLogo?: string;
  industryType: string;
  companySize: string;
  locationCity: string;
  locationState: string;
  /** Work area code for Local Workers Radar. Empty = no location matches. */
  locationPincode: string;
  companyDescription: string;

  /** Account info */
  fullName: string;
  email: string;
  phone: string;

  /** Preferences */
  notificationsEnabled: boolean;
  hrManagementEnabled: boolean;
  language: string;
  hapticFeedback: boolean;
  globalMute: boolean;
  quietHoursEnabled: boolean;
  quietFrom: string;
  quietTo: string;
  /** Shift create defaults — Pro settings. */
  shiftFavoritesFirstDefault?: boolean;
  /** Escrow hold default when posting paid shifts. */
  escrowHoldDefaultEnabled?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
