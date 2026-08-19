/** Public verify page — cloud lookup + PIN check-in. */

import { useCallback, useEffect, useState } from "react";
import type { PassVerifyBadge } from "../helpers/mitraLabs.helpers";
import { PASS_STATUSES, type PassStatus } from "../validation/mitraLabs.schemas";
import {
  dequeueOfflineCheckIn,
  enqueueOfflineCheckIn,
  isEventDayCloudUnavailable,
  localPassLookup,
  type PublicVerifyPassFields,
} from "../helpers/eventDayOfflineCache";
import { useMitraLabsStore } from "../storage/mitraLabs.storage";
import {
  eventDayPublicApi,
  publicCheckInErrorMessage,
  type PublicEventDayPassDto,
} from "../services/eventDayPublicApi";

export type { PublicVerifyPassFields } from "../helpers/eventDayOfflineCache";

export type PublicVerifyUiState = "loading" | "empty" | "active" | "error";

function asPassStatus(value: string | null): PassStatus {
  return (PASS_STATUSES as readonly string[]).includes(value ?? "")
    ? (value as PassStatus)
    : "draft";
}

function toPassFields(dto: PublicEventDayPassDto): PublicVerifyPassFields | undefined {
  if (!dto.guestName || !dto.venueName || !dto.purpose || !dto.validFrom || !dto.validUntil) {
    return undefined;
  }
  return {
    guestName: dto.guestName,
    venue: { name: dto.venueName },
    purpose: dto.purpose,
    validFrom: dto.validFrom,
    validUntil: dto.validUntil,
    status: asPassStatus(dto.status),
  };
}

export function usePublicPassVerify(token: string) {
  const [uiState, setUiState] = useState<PublicVerifyUiState>(token ? "loading" : "empty");
  const [error, setError] = useState<string | null>(null);
  const [badge, setBadge] = useState<PassVerifyBadge>("INVALID");
  const [pass, setPass] = useState<PublicVerifyPassFields | undefined>(undefined);
  const [checkedInAt, setCheckedInAt] = useState<string | null>(null);
  const [pinOpen, setPinOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [fromCache, setFromCache] = useState(false);
  const getPassByToken = useMitraLabsStore((s) => s.getPassByToken);
  const verifyGatePinAndCheckIn = useMitraLabsStore((s) => s.verifyGatePinAndCheckIn);

  const applyLocalLookup = useCallback(() => {
    const cached = localPassLookup(token, getPassByToken);
    if (!cached) return false;
    setBadge(cached.badge);
    setPass(cached.pass);
    setFromCache(true);
    setUiState(cached.pass ? "active" : "empty");
    return true;
  }, [getPassByToken, token]);

  const load = useCallback(async () => {
    if (!token) {
      setUiState("empty");
      setPass(undefined);
      setBadge("INVALID");
      setFromCache(false);
      return;
    }
    setUiState("loading");
    setError(null);
    try {
      const dto = await eventDayPublicApi.getPassByToken(token);
      const fields = toPassFields(dto);
      setBadge(dto.badge);
      setPass(fields);
      setFromCache(false);
      setUiState(fields || dto.badge !== "INVALID" ? "active" : "empty");
    } catch (err) {
      if (isEventDayCloudUnavailable(err) && applyLocalLookup()) {
        setError(null);
        return;
      }
      setError(err instanceof Error ? err.message : "Could not look up this pass.");
      setUiState("error");
    }
  }, [applyLocalLookup, token]);

  useEffect(() => {
    void load();
  }, [load]);

  function openCheckIn() {
    setPin("");
    setPinError(null);
    setPinOpen(true);
  }

  function closeCheckIn() {
    if (busy) return;
    setPinOpen(false);
    setPinError(null);
  }

  async function submitCheckIn() {
    setBusy(true);
    setPinError(null);
    try {
      const result = await eventDayPublicApi.checkIn(token, pin);
      dequeueOfflineCheckIn(token);
      setCheckedInAt(result.verifiedAt);
      setBadge("USED");
      setFromCache(false);
      setPinOpen(false);
      setPin("");
    } catch (err) {
      if (isEventDayCloudUnavailable(err)) {
        const local = getPassByToken(token);
        if (local) {
          const fallback = verifyGatePinAndCheckIn(local, pin);
          if (fallback.ok) {
            enqueueOfflineCheckIn(token);
            setCheckedInAt(fallback.event.verifiedAt);
            setFromCache(true);
            setPinOpen(false);
            setPin("");
            setBusy(false);
            return;
          }
          setPinError(fallback.error);
          setBusy(false);
          return;
        }
      }
      setPinError(publicCheckInErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return {
    uiState,
    error,
    badge,
    pass,
    checkedInAt,
    fromCache,
    pinOpen,
    pin,
    pinError,
    busy,
    setPin,
    openCheckIn,
    closeCheckIn,
    submitCheckIn,
    retry: load,
  };
}
