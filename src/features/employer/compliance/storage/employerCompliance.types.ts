/**
 * Employer Business Compliance Hub — types.
 * Employer-owned business docs only. NOT worker vault. NOT wm_work_diary_* .
 */

export type ComplianceShelfId = "business_verification" | "insurance_hs" | "rtw_audit";

export type ComplianceDocument = {
  readonly id: string;
  readonly shelf: ComplianceShelfId;
  readonly title: string;
  /** Local filename / reference only — Phase-0 metadata, not cloud blob. */
  readonly fileName?: string;
  /** YYYY-MM-DD when known */
  readonly expiresOn?: string;
  readonly notes?: string;
  readonly createdAt: number;
  readonly updatedAt: number;
};

export type ComplianceHubState = {
  readonly documents: readonly ComplianceDocument[];
  readonly updatedAt: number;
};

export type ComplianceExpiryBucket = "overdue" | "d7" | "d14" | "d30" | "ok" | "none";

export type ComplianceExpiryRow = {
  readonly document: ComplianceDocument;
  readonly bucket: Exclude<ComplianceExpiryBucket, "ok" | "none">;
  readonly daysUntil: number;
};

export const COMPLIANCE_SHELVES: readonly {
  readonly id: ComplianceShelfId;
  readonly title: string;
  readonly description: string;
}[] = [
  {
    id: "business_verification",
    title: "Business Verification & Company Registration",
    description:
      "CRN pack, registration certificates, and verification evidence for your business.",
  },
  {
    id: "insurance_hs",
    title: "Insurance & Health & Safety",
    description: "Employer liability insurance, H&S policies, and related certificates.",
  },
  {
    id: "rtw_audit",
    title: "Staff Right-to-Work Audit Log",
    description:
      "Employer-owned RTW check evidence for your records. Not worker Personal Vault or Work Diary.",
  },
] as const;
