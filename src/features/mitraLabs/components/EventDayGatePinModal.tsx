/** Event Day — per-event gate PIN folders, current PIN, and reset. */

import { useEffect, useState } from "react";
import { KeyRound } from "lucide-react";
import { GlobalToast, type ToastTone } from "../../../shared/components/feedback/GlobalToast";
import { useAuthStore } from "../../../shared/store/authStore";
import { ApiRequestError } from "../../../shared/services/apiService";
import { isValidGatePinFormat } from "../helpers/mitraLabsGate.helpers";
import { useGatePinFolders } from "../helpers/useGatePinFolders";
import {
  type GatePinFolderCard,
} from "../helpers/eventDayGatePinFolders.helpers";
import { eventDayEmployerApi, isEventDayCloudEnabled } from "../services/eventDayEmployerApi";
import { useMitraLabsStore } from "../storage/mitraLabs.storage";
import { EventDayGatePinFolderList } from "./EventDayGatePinFolderList";
import { EventDayGatePinPanel } from "./EventDayGatePinPanel";
import { MitraLabsEventDayModalShell } from "./MitraLabsEventDayModalShell";

type Props = {
  readonly open: boolean;
  readonly onClose: () => void;
};

export function EventDayGatePinModal({ open, onClose }: Props) {
  const issuerId = useAuthStore((s) => s.user?.id ?? "");
  const folders = useGatePinFolders(issuerId);
  const getFolderGatePin = useMitraLabsStore((s) => s.getFolderGatePin);
  const setFolderGatePin = useMitraLabsStore((s) => s.setFolderGatePin);
  const resetFolderGatePin = useMitraLabsStore((s) => s.resetFolderGatePin);

  const [folder, setFolder] = useState<GatePinFolderCard | null>(null);
  const [draftPin, setDraftPin] = useState("");
  const [pinVisible, setPinVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [toastTone, setToastTone] = useState<ToastTone>("success");
  const [busy, setBusy] = useState(false);
  const cloud = isEventDayCloudEnabled();
  const activePin = folder ? getFolderGatePin(folder.folderId, issuerId) : "";
  const canSave = Boolean(folder) && isValidGatePinFormat(draftPin) && !busy;

  useEffect(() => {
    if (!open) {
      setFolder(null);
      setDraftPin("");
      setPinVisible(false);
      setError(null);
      setBusy(false);
    }
  }, [open]);

  async function persistPin(pin: string, folderId: string) {
    setFolderGatePin(folderId, pin);
    if (cloud) await eventDayEmployerApi.putGatePin(pin, folderId);
  }

  async function savePin() {
    if (!issuerId || !folder) {
      setError("Sign in as an employer and open an event folder.");
      return;
    }
    if (!isValidGatePinFormat(draftPin)) {
      setError("Enter a 4-digit numeric PIN.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await persistPin(draftPin, folder.folderId);
      setDraftPin("");
      setPinVisible(true);
      setToast("This event PIN was updated.");
      setToastTone("success");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not save gate PIN.");
    } finally {
      setBusy(false);
    }
  }

  async function resetPin() {
    if (!folder) return;
    setBusy(true);
    setError(null);
    try {
      const next = resetFolderGatePin(folder.folderId);
      if (cloud) await eventDayEmployerApi.putGatePin(next, folder.folderId);
      setDraftPin("");
      setPinVisible(true);
      setToast("This event PIN was reset. Other event folders are unchanged.");
      setToastTone("success");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not reset gate PIN.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <MitraLabsEventDayModalShell
        open={open}
        onClose={onClose}
        ariaLabel="Security gate PIN"
        eyebrow="Event day security"
        title={folder ? folder.venueName : "Security Gate PIN"}
        subtitle={
          folder
            ? `${folder.eventName} · ${folder.dateLabel}. View or reset this folder’s PIN only.`
            : "Open a venue folder. Labels match your pass folders: venue, event, and date."
        }
        icon={KeyRound}
        tone="pin"
        testId="event-day-gate-pin-modal"
        footer={
          folder ? (
            <button
              type="button"
              className="wm-primarybtn wm-mlEntModal__btnPrimary wm-mlEntModal__btnFull"
              onClick={() => void savePin()}
              disabled={!canSave}
              data-testid="employer-gate-pin-save"
            >
              Save this event PIN
            </button>
          ) : undefined
        }
      >
        {folder ? (
          <>
            <button
              type="button"
              className="wm-outlineBtn wm-mlEntModal__btnFull"
              onClick={() => {
                setFolder(null);
                setDraftPin("");
                setError(null);
                setPinVisible(false);
              }}
            >
              Back to event folders
            </button>
            <EventDayGatePinPanel
              eventName={`${folder.venueName} · ${folder.eventName}`}
              activePin={activePin}
              pinVisible={pinVisible}
              draftPin={draftPin}
              error={error}
              busy={busy}
              onToggleVisible={() => setPinVisible((visible) => !visible)}
              onDraftChange={(value) => {
                setDraftPin(value);
                if (error) setError(null);
              }}
              onReset={() => void resetPin()}
            />
          </>
        ) : (
          <EventDayGatePinFolderList folders={folders} onOpen={setFolder} />
        )}
      </MitraLabsEventDayModalShell>

      <GlobalToast
        message={toast}
        tone={toastTone}
        visible={Boolean(toast)}
        onClose={() => setToast("")}
        testId="event-day-gate-pin-toast"
      />
    </>
  );
}
