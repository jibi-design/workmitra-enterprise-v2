/** Employer Event Day cloud API — isolated from Shift/Career. */

import { AUTH_BACKEND_ENABLED } from "../../../shared/config/authConfig";
import { apiService } from "../../../shared/services/apiService";
import { defaultPassStyle } from "../helpers/mitraLabs.helpers";
import type { CreatePassFormInput } from "../validation/mitraLabs.schemas";
import type { DigitalPassRecord } from "../storage/mitraLabs.storage";

export const EMPLOYER_EVENT_DAY_API = "/v1/jobmitra/employer/event-day";

type Envelope<T> = { data: T };

type ServerPass = {
  readonly passId: string;
  readonly issuerId: string;
  readonly guestName: string;
  readonly candidateRef: string | null;
  readonly eventName: string | null;
  readonly venueName: string;
  readonly venueAddress: string | null;
  readonly purpose: DigitalPassRecord["purpose"];
  readonly validFrom: string;
  readonly validUntil: string;
  readonly status: DigitalPassRecord["status"];
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ScannerPassView = {
  readonly badge: "VALID" | "INVALID" | "REVOKED" | "EXPIRED" | "USED";
  readonly guestName: string | null;
  readonly eventName: string | null;
  readonly venueName: string | null;
  readonly purpose: string | null;
  readonly validFrom: string | null;
  readonly validUntil: string | null;
  readonly status: string | null;
};

export function isEventDayCloudEnabled(): boolean {
  return AUTH_BACKEND_ENABLED;
}

export function mapServerPassToRecord(pass: ServerPass, passToken: string): DigitalPassRecord {
  return {
    passId: pass.passId,
    issuerId: pass.issuerId,
    guestName: pass.guestName,
    candidateRef: pass.candidateRef ?? undefined,
    eventName: pass.eventName ?? undefined,
    venue: { name: pass.venueName, address: pass.venueAddress ?? undefined },
    purpose: pass.purpose,
    validFrom: pass.validFrom,
    validUntil: pass.validUntil,
    passToken,
    status: pass.status,
    style: defaultPassStyle(),
    createdAt: Date.parse(pass.createdAt) || Date.now(),
    updatedAt: Date.parse(pass.updatedAt) || Date.now(),
  };
}

export const eventDayEmployerApi = {
  async createPass(
    form: CreatePassFormInput,
  ): Promise<{ record: DigitalPassRecord; passToken: string }> {
    const res = await apiService.post<Envelope<{ pass: ServerPass; passToken: string }>>(
      `${EMPLOYER_EVENT_DAY_API}/passes`,
      {
        guestName: form.guestName,
        candidateRef: form.candidateRef,
        eventName: form.eventName,
        venueName: form.venue.name,
        venueAddress: form.venue.address,
        purpose: form.purpose,
        validFrom: form.validFrom,
        validUntil: form.validUntil,
      },
    );
    return {
      passToken: res.data.passToken,
      record: mapServerPassToRecord(res.data.pass, res.data.passToken),
    };
  },

  async revokePass(passId: string): Promise<void> {
    await apiService.post(`${EMPLOYER_EVENT_DAY_API}/passes/${passId}/revoke`, {});
  },

  async getGatePinMeta(folderId: string): Promise<{ pinSet: boolean; updatedAt: string | null }> {
    const res = await apiService.get<Envelope<{ pinSet: boolean; updatedAt: string | null }>>(
      `${EMPLOYER_EVENT_DAY_API}/gate-pin`,
      { folderId },
    );
    return res.data;
  },

  async putGatePin(
    pin: string,
    folderId: string,
  ): Promise<{ pinSet: boolean; updatedAt: string | null }> {
    const res = await apiService.put<Envelope<{ pinSet: boolean; updatedAt: string | null }>>(
      `${EMPLOYER_EVENT_DAY_API}/gate-pin`,
      { pin, folderId },
    );
    return res.data;
  },

  async deleteFolder(folderId: string): Promise<void> {
    await apiService.delete(
      `${EMPLOYER_EVENT_DAY_API}/report/folders/${encodeURIComponent(folderId)}`,
    );
  },

  async unlockScanner(pin: string, folderId: string): Promise<{ unlocked: true }> {
    const res = await apiService.post<Envelope<{ unlocked: true }>>(
      `${EMPLOYER_EVENT_DAY_API}/scanner/unlock`,
      { pin, folderId },
    );
    return res.data;
  },

  async lookupScan(token: string): Promise<ScannerPassView> {
    const res = await apiService.get<Envelope<{ pass: ScannerPassView }>>(
      `${EMPLOYER_EVENT_DAY_API}/scanner/lookup`,
      { token },
    );
    return res.data.pass;
  },

  async consumeScan(
    token: string,
    folderId: string,
  ): Promise<{ pass: ScannerPassView; verifiedAt: string }> {
    const res = await apiService.post<Envelope<{ pass: ScannerPassView; verifiedAt: string }>>(
      `${EMPLOYER_EVENT_DAY_API}/scanner/consume`,
      { token, folderId },
    );
    return res.data;
  },
};
