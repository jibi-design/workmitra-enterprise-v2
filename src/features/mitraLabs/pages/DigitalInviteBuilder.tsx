/**
 * Digital Invite Builder — /employer/labs/invites
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ticket } from "lucide-react";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { EnterpriseEmpty } from "../../../shared/components/enterprise/EnterpriseEmpty";
import { employerSettingsStorage } from "../../employer/company/storage/employerSettings.storage";
import { useAuthStore } from "../../../shared/store/authStore";
import { ApiRequestError } from "../../../shared/services/apiService";
import { DigitalInviteIssuedCard } from "../components/DigitalInviteIssuedCard";
import { DigitalInvitePassForm } from "../components/DigitalInvitePassForm";
import { EventDayInPageFolders } from "../components/EventDayInPageFolders";
import { EventDayInPagePassItem } from "../components/EventDayInPagePassItem";
import { EventDayLanScanHint } from "../components/EventDayLanScanHint";
import {
  buildVerificationUrl,
  defaultPassStyle,
  getPalette,
} from "../helpers/mitraLabs.helpers";
import { useMitraLabsStore } from "../storage/mitraLabs.storage";
import type { DigitalPassRecord } from "../storage/mitraLabs.storage";
import { bundleItemsByVenueThenPerson, resolveItemPersonFolderId, resolvePassFolderId, resolvePassVenueFolderId } from "../helpers/eventDayFolders.helpers";
import { eventDayEmployerApi, isEventDayCloudEnabled } from "../services/eventDayEmployerApi";
import { CreatePassFormSchema, PASS_PURPOSES } from "../validation/mitraLabs.schemas";

import {
  applyPassDurationPreset,
  toLocalInputValue,
  type PassDurationPresetId,
} from "../helpers/mitraLabsPassWindow.helpers";

export function DigitalInviteBuilder() {
  const nav = useNavigate();
  const user = useAuthStore((s) => s.user);
  const createPass = useMitraLabsStore((s) => s.createPass);
  const cacheIssuedPass = useMitraLabsStore((s) => s.cacheIssuedPass);
  const revokePass = useMitraLabsStore((s) => s.revokePass);
  const deleteVenueFolder = useMitraLabsStore((s) => s.deleteVenueFolder);
  const deletePersonFolder = useMitraLabsStore((s) => s.deletePersonFolder);
  const passes = useMitraLabsStore((s) => s.passes);
  const checkInEvents = useMitraLabsStore((s) => s.checkInEvents);
  const guestNameRef = useRef<HTMLInputElement>(null);

  const issuerId = user?.id ?? "";
  const companyName =
    employerSettingsStorage.get().companyName.trim() || user?.fullName?.trim() || "Employer";
  const mine = useMemo(
    () => passes.filter((p) => (issuerId ? p.issuerId === issuerId : true)),
    [passes, issuerId],
  );

  const now = new Date();
  const later = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [composing, setComposing] = useState(mine.length > 0);
  const [guestName, setGuestName] = useState("");
  const [guestContact, setGuestContact] = useState("");
  const [candidateRef, setCandidateRef] = useState("");
  const [eventName, setEventName] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [purpose, setPurpose] = useState<(typeof PASS_PURPOSES)[number]>("interview");
  const [validFrom, setValidFrom] = useState(toLocalInputValue(now));
  const [validUntil, setValidUntil] = useState(toLocalInputValue(later));
  const [durationPreset, setDurationPreset] = useState<PassDurationPresetId>("one_week");
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<DigitalPassRecord | null>(null);

  useEffect(() => {
    if (composing) guestNameRef.current?.focus();
  }, [composing]);

  function startCompose() {
    setComposing(true);
  }

  function applyDurationPreset(presetId: PassDurationPresetId) {
    const window = applyPassDurationPreset(presetId);
    setDurationPreset(presetId);
    setValidFrom(window.validFrom);
    setValidUntil(window.validUntil);
  }

  async function submit() {
    setError(null);
    if (!issuerId) {
      setError("Sign in as an employer to issue passes.");
      return;
    }
    const form = {
      issuerId,
      guestName: guestName.trim(),
      guestContact: guestContact.trim() || undefined,
      candidateRef: candidateRef.trim() || undefined,
      eventName: eventName.trim() || undefined,
      venue: {
        name: venueName.trim(),
        address: venueAddress.trim() || undefined,
      },
      purpose,
      validFrom: new Date(validFrom).toISOString(),
      validUntil: new Date(validUntil).toISOString(),
      style: defaultPassStyle(),
    };
    const parsed = CreatePassFormSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Validation failed");
      return;
    }
    try {
      if (isEventDayCloudEnabled()) {
        const issued = await eventDayEmployerApi.createPass(parsed.data);
        cacheIssuedPass(issued.record);
        setCreated(issued.record);
        setGuestName("");
        return;
      }
      const record = createPass(parsed.data);
      setCreated(record);
      setGuestName("");
    } catch (e) {
      const message =
        e instanceof ApiRequestError ? e.message : e instanceof Error ? e.message : "Could not create pass";
      setError(message);
    }
  }

  const folders = useMemo(
    () => bundleItemsByVenueThenPerson(mine, checkInEvents),
    [mine, checkInEvents],
  );

  async function revokeIssued(passId: string) {
    try {
      if (isEventDayCloudEnabled()) {
        await eventDayEmployerApi.revokePass(passId);
      }
      revokePass(passId);
      if (created?.passId === passId) {
        setCreated({ ...created, status: "revoked" });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not revoke pass");
    }
  }

  async function deleteFolder(folderId: string) {
    try {
      const targets = mine.filter((pass) => resolvePassVenueFolderId(pass) === folderId);
      if (isEventDayCloudEnabled()) {
        const eventFolderIds = [...new Set(targets.map((pass) => resolvePassFolderId(pass)))];
        for (const eventFolderId of eventFolderIds) {
          await eventDayEmployerApi.deleteFolder(eventFolderId);
        }
      }
      deleteVenueFolder(folderId);
      if (created && resolvePassVenueFolderId(created) === folderId) {
        setCreated(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete folder");
    }
  }

  async function deleteNamedPersonFolder(personFolderId: string) {
    try {
      const targets = mine.filter((pass) => resolveItemPersonFolderId(pass) === personFolderId);
      if (isEventDayCloudEnabled()) {
        for (const pass of targets) {
          await eventDayEmployerApi.revokePass(pass.passId);
        }
      }
      deletePersonFolder(personFolderId);
      if (created && resolveItemPersonFolderId(created) === personFolderId) {
        setCreated(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete person folder");
    }
  }

  const verifyUrl = created ? buildVerificationUrl(created.passToken) : "";
  const palette = getPalette(created?.style?.paletteId ?? "teal_ink");
  const showForm = composing || mine.length > 0 || Boolean(created);
  const uiState = error ? "error" : showForm ? "active" : "empty";

  return (
    <div className="wm-dashPage wm-erDash wm-mlPage" data-testid="digital-invite-builder" data-ui-state={uiState}>
      <header className="wm-dashHero">
        <button
          type="button"
          className="wm-dashHero__back"
          onClick={() => nav(ROUTE_PATHS.employerDashboardEventDay)}
        >
          ← Dashboard
        </button>
        <div className="wm-dashHero__kicker">
          <Ticket size={12} aria-hidden="true" /> Guest &amp; staff passes
        </div>
        <h1 className="wm-dashHero__title">Send guest &amp; staff passes</h1>
        <p className="wm-dashHero__sub">
          Named door pass with a scan-to-verify code. Guest details stay on the pass, not in the QR.
        </p>
      </header>
      <EventDayLanScanHint />

      {!showForm ? (
        <div data-testid="digital-invite-page-empty">
          <EnterpriseEmpty
            title="No passes yet"
            subtitle="Add a guest, staff member, or interview visitor. Each pass has a valid window and a code you can scan at the door."
            primaryLabel="Create first pass"
            onPrimary={startCompose}
          />
          <p className="wm-mlHonesty">Verification only — this is not a ticket shop or payment.</p>
        </div>
      ) : (
        <DigitalInvitePassForm
          guestName={guestName}
          guestContact={guestContact}
          candidateRef={candidateRef}
          eventName={eventName}
          venueName={venueName}
          venueAddress={venueAddress}
          purpose={purpose}
          validFrom={validFrom}
          validUntil={validUntil}
          durationPreset={durationPreset}
          onApplyDurationPreset={applyDurationPreset}
          error={error}
          guestNameRef={guestNameRef}
          onGuestName={setGuestName}
          onGuestContact={setGuestContact}
          onCandidateRef={setCandidateRef}
          onEventName={setEventName}
          onVenueName={setVenueName}
          onVenueAddress={setVenueAddress}
          onPurpose={setPurpose}
          onValidFrom={setValidFrom}
          onValidUntil={setValidUntil}
          onSubmit={() => void submit()}
        />
      )}

      {created ? (
        <DigitalInviteIssuedCard
          record={created}
          companyName={companyName}
          verifyUrl={verifyUrl}
          palette={palette}
          onRevoke={() => void revokeIssued(created.passId)}
          onClose={() => setCreated(null)}
        />
      ) : null}

      {showForm ? (
        <EventDayInPageFolders
          bundles={folders}
          testId="invite-in-page-folders"
          emptyTitle="No venue folders yet"
          emptySubtitle="Issue a pass above. Venue and guest folders stay closed. Open a name only when you need that QR."
          onDeleteFolder={(folder) => void deleteFolder(folder.folderId)}
          onDeletePersonFolder={(personFolderId) => void deleteNamedPersonFolder(personFolderId)}
          getItemKey={(pass) => pass.passId}
          renderItem={(pass) => (
            <EventDayInPagePassItem
              key={pass.passId}
              record={pass}
              companyName={companyName}
              onRevoke={() => void revokeIssued(pass.passId)}
            />
          )}
        />
      ) : null}
    </div>
  );
}

export default DigitalInviteBuilder;
