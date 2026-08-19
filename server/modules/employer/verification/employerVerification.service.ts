import type { AuthUser } from "../../auth/types.js";
import {
  assertCanPublishLive,
  hasDocumentEvidence,
  isEnterpriseTrackComplete,
  isMicroTrackComplete,
  resolveMaturityStage,
  type EmployerMaturityStage,
  type EmployerVerificationAuditStatus,
  type EmployerVerificationTrackKind,
  type EnterpriseTrackPayload,
  type MicroTrackPayload,
  type PublishGateResult,
} from "./employerMaturity.policy.js";
import { employerVerificationStore, markLabDemoEmployerVerified } from "./employerVerification.store.js";
import { seedLabDemoEmployerVerificationFromDb } from "./employerVerification.demoSeed.js";
import { companiesHouseService } from "./companiesHouse.service.js";

export type EmployerVerificationDto = {
  readonly employerUserId: string;
  readonly contactVerified: boolean;
  readonly registrationNo: string;
  readonly verificationAuditStatus: EmployerVerificationAuditStatus;
  readonly verificationTrack: EmployerVerificationTrackKind;
  readonly enterpriseTrack?: EnterpriseTrackPayload;
  readonly microTrack?: MicroTrackPayload;
  /** Identity / business maturity — NOT star reputation. */
  readonly maturityStage: EmployerMaturityStage;
  /** True only for verified_business (document approved). */
  readonly identityBusinessVerified: boolean;
  readonly documentEvidenceSubmitted: boolean;
  readonly updatedAt: number;
};

function toDto(employerUserId: string): EmployerVerificationDto {
  const record = employerVerificationStore.get(employerUserId);
  const maturityStage = resolveMaturityStage(record);
  return {
    employerUserId,
    contactVerified: record.contactVerified,
    registrationNo: record.registrationNo,
    verificationAuditStatus: record.verificationAuditStatus,
    verificationTrack: record.verificationTrack,
    enterpriseTrack: record.enterpriseTrack,
    microTrack: record.microTrack,
    maturityStage,
    identityBusinessVerified: maturityStage === "verified_business",
    documentEvidenceSubmitted: hasDocumentEvidence(record),
    updatedAt: record.updatedAt,
  };
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asBool(value: unknown): boolean {
  return value === true;
}

function parseEnterpriseTrack(body: Record<string, unknown>): EnterpriseTrackPayload | null {
  const track: EnterpriseTrackPayload = {
    companiesHouseCrn: asString(body.companiesHouseCrn ?? body.crn),
    vatId: asString(body.vatId ?? body.vat),
    registeredAddress: asString(body.registeredAddress),
    corporateEmail: asString(body.corporateEmail),
    corporateDomain: asString(body.corporateDomain),
    submittedAt: Date.now(),
  };
  if (!isEnterpriseTrackComplete(track)) return null;
  return track;
}

function parseMicroTrack(body: Record<string, unknown>): MicroTrackPayload | null {
  const track: MicroTrackPayload = {
    ownerGovIdAttested: asBool(body.ownerGovIdAttested),
    ownerGovIdRef: asString(body.ownerGovIdRef),
    tradeProofAttested: asBool(body.tradeProofAttested),
    tradeProofNote: asString(body.tradeProofNote),
    gpsProofAttested: asBool(body.gpsProofAttested),
    gpsLat: asString(body.gpsLat),
    gpsLng: asString(body.gpsLng),
    locationProofNote: asString(body.locationProofNote),
    submittedAt: Date.now(),
  };
  if (!isMicroTrackComplete(track)) return null;
  return track;
}

export const employerVerificationService = {
  getForEmployer(employer: AuthUser): EmployerVerificationDto {
    markLabDemoEmployerVerified(employer.id, employer.email);
    return toDto(employer.id);
  },

  upsertForEmployer(
    employer: AuthUser,
    body: Record<string, unknown>,
  ):
    | { ok: true; verification: EmployerVerificationDto }
    | { ok: false; code: string; message: string; httpStatus: number } {
    const contactVerified =
      typeof body.contactVerified === "boolean" ? body.contactVerified : undefined;
    const registrationNo =
      typeof body.registrationNo === "string" ? body.registrationNo : undefined;

    let verificationAuditStatus: EmployerVerificationAuditStatus | undefined;
    const auditRaw = body.verificationAuditStatus;
    if (
      auditRaw === "none" ||
      auditRaw === "pending" ||
      auditRaw === "approved" ||
      auditRaw === "rejected"
    ) {
      verificationAuditStatus = auditRaw;
    }

    // Clients may mark contact/registration; approved status is admin-only (ignore client approved).
    if (verificationAuditStatus === "approved") {
      verificationAuditStatus = undefined;
    }

    let verificationTrack: EmployerVerificationTrackKind | undefined;
    const trackRaw = body.verificationTrack;
    if (trackRaw === "none" || trackRaw === "enterprise" || trackRaw === "micro") {
      verificationTrack = trackRaw;
    }

    const enterpriseTrack =
      body.enterpriseTrack && typeof body.enterpriseTrack === "object"
        ? (parseEnterpriseTrack(body.enterpriseTrack as Record<string, unknown>) ?? undefined)
        : undefined;
    const microTrack =
      body.microTrack && typeof body.microTrack === "object"
        ? (parseMicroTrack(body.microTrack as Record<string, unknown>) ?? undefined)
        : undefined;

    // Soft sync: incomplete track payloads are ignored; dedicated POST endpoints validate strictly.
    employerVerificationStore.upsert(employer.id, {
      contactVerified,
      registrationNo,
      verificationAuditStatus,
      verificationTrack,
      enterpriseTrack,
      microTrack,
    });

    return { ok: true, verification: toDto(employer.id) };
  },

  async submitEnterpriseTrack(
    employer: AuthUser,
    body: Record<string, unknown>,
  ): Promise<
    | { ok: true; verification: EmployerVerificationDto }
    | { ok: false; code: string; message: string; httpStatus: number }
  > {
    const track = parseEnterpriseTrack(body);
    if (!track) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message:
          "Enterprise track requires Companies House CRN, VAT ID, registered address, and a corporate-domain email match.",
        httpStatus: 400,
      };
    }

    const ch = await companiesHouseService.validateCrnForEnterpriseSubmit(track.companiesHouseCrn);
    if (!ch.ok) {
      return {
        ok: false,
        code: ch.code,
        message: ch.message,
        httpStatus: ch.httpStatus,
      };
    }

    const enriched: EnterpriseTrackPayload = {
      ...track,
      companiesHouseCrn: ch.company.companyNumber || track.companiesHouseCrn,
      registeredAddress:
        track.registeredAddress.trim() ||
        ch.company.registeredOfficeAddress?.trim() ||
        track.registeredAddress,
    };

    const current = employerVerificationStore.get(employer.id);
    employerVerificationStore.upsert(employer.id, {
      verificationTrack: "enterprise",
      enterpriseTrack: enriched,
      registrationNo: enriched.companiesHouseCrn,
      verificationAuditStatus:
        current.verificationAuditStatus === "approved" ? "approved" : "pending",
    });

    return { ok: true, verification: toDto(employer.id) };
  },

  submitMicroTrack(
    employer: AuthUser,
    body: Record<string, unknown>,
  ):
    | { ok: true; verification: EmployerVerificationDto }
    | { ok: false; code: string; message: string; httpStatus: number } {
    const track = parseMicroTrack(body);
    if (!track) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message:
          "Micro track requires owner government ID attestation plus trade/shop proof or GPS/location proof.",
        httpStatus: 400,
      };
    }

    const current = employerVerificationStore.get(employer.id);
    employerVerificationStore.upsert(employer.id, {
      verificationTrack: "micro",
      microTrack: track,
      verificationAuditStatus:
        current.verificationAuditStatus === "approved" ? "approved" : "pending",
    });

    return { ok: true, verification: toDto(employer.id) };
  },

  assertEmployerCanPublishLive(employer: AuthUser): PublishGateResult {
    markLabDemoEmployerVerified(employer.id, employer.email);
    return assertCanPublishLive(employerVerificationStore.get(employer.id));
  },
};

void seedLabDemoEmployerVerificationFromDb().catch(() => {
  /* retry happens on first publish via markLabDemoEmployerVerified */
});
