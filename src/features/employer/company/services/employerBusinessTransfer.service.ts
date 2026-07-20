/** Business profile ownership transfer (Phase 0 — local demo). */

import { generateAndRegisterId } from "../../../../shared/identity/registry/idRegistry";
import { employerSettingsStorage } from "../storage/employerSettings.storage";
import type {
  EmployerPendingTransfer,
  OwnershipAuditEntry,
} from "../helpers/employerIdentity.types";

const TRANSFER_VALIDITY_MS = 7 * 24 * 60 * 60 * 1000;

export type TransferActionResult =
  { readonly success: true } | { readonly success: false; readonly reason: string };

export type InitiateTransferInput = {
  readonly toOwnerName: string;
  readonly toOwnerEmail: string;
  readonly toOwnerPhone: string;
  readonly reason: string;
};

export type InitiateTransferResult =
  | { readonly success: true; readonly transferCode: string; readonly expiresAt: number }
  | { readonly success: false; readonly reason: string };

function generateTransferCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let code = "";
  for (let i = 0; i < bytes.length; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

function makeAuditId(): string {
  return `xfer_${Date.now().toString(36)}`;
}

export function initiateBusinessTransfer(input: InitiateTransferInput): InitiateTransferResult {
  const profile = employerSettingsStorage.get();

  if (profile.transferStatus === "pending" && profile.pendingTransfer) {
    return { success: false, reason: "A transfer is already in progress. Cancel it first." };
  }

  const toOwnerName = input.toOwnerName.trim();
  if (toOwnerName.length < 2) {
    return { success: false, reason: "Enter the new owner's full name." };
  }

  const now = Date.now();
  const code = generateTransferCode();
  const pendingTransfer: EmployerPendingTransfer = {
    code,
    toOwnerName,
    toOwnerEmail: input.toOwnerEmail.trim(),
    toOwnerPhone: input.toOwnerPhone.trim(),
    reason: input.reason.trim() || "Business ownership transfer",
    initiatedAt: now,
    expiresAt: now + TRANSFER_VALIDITY_MS,
  };

  employerSettingsStorage.savePartial({
    transferStatus: "pending",
    pendingTransfer,
  });

  return { success: true, transferCode: code, expiresAt: pendingTransfer.expiresAt };
}

export function cancelBusinessTransfer(): TransferActionResult {
  const profile = employerSettingsStorage.get();
  if (profile.transferStatus !== "pending" || !profile.pendingTransfer) {
    return { success: false, reason: "No transfer is in progress." };
  }

  employerSettingsStorage.savePartial({
    transferStatus: "cancelled",
    pendingTransfer: undefined,
  });

  employerSettingsStorage.savePartial({ transferStatus: "none" });
  return { success: true };
}

export function acceptBusinessTransfer(transferCode: string): TransferActionResult {
  const profile = employerSettingsStorage.get();
  const pending = profile.pendingTransfer;

  if (profile.transferStatus !== "pending" || !pending) {
    return { success: false, reason: "No transfer is waiting for acceptance." };
  }

  if (Date.now() > pending.expiresAt) {
    employerSettingsStorage.savePartial({
      transferStatus: "none",
      pendingTransfer: undefined,
    });
    return { success: false, reason: "Transfer code expired. Start a new transfer." };
  }

  if (transferCode.trim().toUpperCase() !== pending.code) {
    return { success: false, reason: "Incorrect transfer code." };
  }

  const ownerGen = generateAndRegisterId(pending.toOwnerName, "employer-owner");
  if (!ownerGen.success) {
    return {
      success: false,
      reason: ownerGen.reason ?? "Could not create new owner account reference.",
    };
  }

  const fromOwnerUserId = profile.ownerUserId ?? profile.ownerUniqueId ?? "";
  const fromOwnerName = profile.fullName.trim() || "Previous owner";

  const auditEntry: OwnershipAuditEntry = {
    id: makeAuditId(),
    fromOwnerUserId,
    fromOwnerName,
    toOwnerUserId: ownerGen.id,
    toOwnerName: pending.toOwnerName,
    timestamp: Date.now(),
    reason: pending.reason,
  };

  employerSettingsStorage.savePartial({
    fullName: pending.toOwnerName,
    email: pending.toOwnerEmail,
    phone: pending.toOwnerPhone,
    ownerUserId: ownerGen.id,
    ownerUniqueId: ownerGen.id,
    contactVerified: false,
    transferStatus: "completed",
    pendingTransfer: undefined,
    ownershipAuditLog: [...(profile.ownershipAuditLog ?? []), auditEntry],
  });

  employerSettingsStorage.savePartial({ transferStatus: "none" });
  return { success: true };
}
