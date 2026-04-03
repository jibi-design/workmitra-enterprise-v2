// src/features/employer/hrManagement/types/companyNotice.types.ts
//
// Types for Bulk Notifications / Company Notices (Root Map 5.3.11).
// v2: Added read receipt types — localStorage simulate now, backend-ready.

export type NoticeTarget = "all" | "department" | "location";

export type NoticeReadReceipt = {
  /** HR candidate ID of the employee who read */
  hrCandidateId: string;
  /** Employee name (denormalized for quick display) */
  employeeName: string;
  /** Timestamp when read */
  readAt: number;
};

export type CompanyNotice = {
  /** Unique notice ID */
  id: string;
  /** Notice title */
  title: string;
  /** Notice body (free text) */
  body: string;
  /** Target audience */
  target: NoticeTarget;
  /** Target value — department name or location name (when target != "all") */
  targetValue: string;
  /** How many employees this reached */
  recipientCount: number;
  /** Recipient HR candidate IDs */
  recipientIds: string[];
  /** Read receipts — who read and when */
  readReceipts: NoticeReadReceipt[];
  /** Created by employer */
  createdAt: number;
};