import { Camera } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { GlobalToast, type ToastTone } from "../../../shared/components/feedback/GlobalToast";
import { ApiRequestError } from "../../../shared/services/apiService";
import { useAuthStore } from "../../../shared/store/authStore";
import {
  formatStaffScanHeadline,
  passVerifyBadgeTone,
  verifyGatePin,
} from "../helpers/mitraLabsGate.helpers";
import { extractPassTokenFromScan } from "../helpers/mitraLabsScan.helpers";
import { runStaffGateScan } from "../helpers/eventDayStaffScan";
import {
  getScannerShiftFolderId,
  isScannerShiftUnlocked,
  markScannerShiftUnlocked,
} from "../helpers/eventDayScanner.session";
import { eventDayEmployerApi, isEventDayCloudEnabled } from "../services/eventDayEmployerApi";
import { readGatePinFolders, useGatePinFolders } from "../helpers/useGatePinFolders";
import type { GatePinFolderCard } from "../helpers/eventDayGatePinFolders.helpers";
import { useMitraLabsStore } from "../storage/mitraLabs.storage";
import { EventDayGateScannerLocked } from "./EventDayGateScannerLocked";
import { EventDayGateScannerResult } from "./EventDayGateScannerResult";
import { MitraLabsEventDayModalShell } from "./MitraLabsEventDayModalShell";

type Props = {
  readonly open: boolean;
  readonly onClose: () => void;
};

type ScanState = "locked" | "idle" | "scanning" | "result";

export function EventDayGateScannerModal({ open, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const scanningRef = useRef(false);

  const issuerId = useAuthStore((s) => s.user?.id ?? "");
  const staffName = useAuthStore((s) => s.user?.fullName?.trim() || "Gate staff");
  const getFolderGatePin = useMitraLabsStore((s) => s.getFolderGatePin);
  const folders = useGatePinFolders(issuerId);

  const [scanState, setScanState] = useState<ScanState>("locked");
  const [folder, setFolder] = useState<GatePinFolderCard | null>(null);
  const [shiftPin, setShiftPin] = useState("");
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [unlockBusy, setUnlockBusy] = useState(false);
  const [headline, setHeadline] = useState("");
  const [tone, setTone] = useState<"valid" | "fail">("fail");
  const [guestName, setGuestName] = useState("");
  const [detail, setDetail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [toastTone, setToastTone] = useState<ToastTone>("info");
  const [cameraSession, setCameraSession] = useState(0);

  const stopCamera = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const handleScan = useCallback(
    async (raw: string) => {
      const token = extractPassTokenFromScan(raw);
      if (!token || !folder || scanningRef.current) return false;
      scanningRef.current = true;
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      try {
        const outcome = await runStaffGateScan(token, staffName, folder.folderId, issuerId);
        setHeadline(formatStaffScanHeadline(outcome.badge));
        setTone(passVerifyBadgeTone(outcome.badge));
        setGuestName(outcome.guestName);
        setDetail(outcome.detail);
        setScanState("result");
        setToast(outcome.badge === "VALID" ? "Entry confirmed." : "Pass not authorized.");
        setToastTone(outcome.badge === "VALID" ? "success" : "error");
        return true;
      } catch (err) {
        scanningRef.current = false;
        setError(err instanceof Error ? err.message : "Could not verify this pass.");
        return false;
      }
    },
    [staffName, folder, issuerId],
  );

  async function unlockShift() {
    setUnlockError(null);
    if (!issuerId || !folder) {
      setUnlockError("Open an event folder before unlocking.");
      return;
    }
    setUnlockBusy(true);
    try {
      if (isEventDayCloudEnabled()) {
        await eventDayEmployerApi.unlockScanner(shiftPin, folder.folderId);
      } else if (!verifyGatePin(shiftPin, getFolderGatePin(folder.folderId, issuerId))) {
        setUnlockError("Shift PIN was not accepted.");
        return;
      }
      markScannerShiftUnlocked(issuerId, folder.folderId);
      setShiftPin("");
      setScanState("scanning");
      setCameraSession((n) => n + 1);
    } catch (err) {
      setUnlockError(
        err instanceof ApiRequestError ? err.message : "Could not unlock the scanner.",
      );
    } finally {
      setUnlockBusy(false);
    }
  }

  useEffect(() => {
    if (!open) {
      stopCamera();
      scanningRef.current = false;
      setScanState("locked");
      setHeadline("");
      setDetail("");
      setGuestName("");
      setError(null);
      setShiftPin("");
      setUnlockError(null);
      setFolder(null);
      return;
    }
    const unlockedFolderId = getScannerShiftFolderId(issuerId);
    const list = readGatePinFolders(issuerId);
    const unlocked = list.find((item) => item.folderId === unlockedFolderId) ?? null;
    setFolder(unlocked);
    setScanState(unlocked && isScannerShiftUnlocked(issuerId, unlocked.folderId) ? "scanning" : "locked");
  }, [open, issuerId, stopCamera]);

  useEffect(() => {
    if (!open || scanState !== "scanning") {
      stopCamera();
      return;
    }
    let cancelled = false;
    async function start() {
      setError(null);
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Camera access is not available on this device.");
        setScanState("idle");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
        }
        const BarcodeDetectorCtor = (
          window as unknown as {
            BarcodeDetector?: new (opts: { formats: string[] }) => {
              detect: (src: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>>;
            };
          }
        ).BarcodeDetector;
        if (!BarcodeDetectorCtor) {
          setError("QR auto-detect needs a modern browser. Use public verify link as fallback.");
          setScanState("idle");
          return;
        }
        const detector = new BarcodeDetectorCtor({ formats: ["qr_code"] });
        timerRef.current = window.setInterval(() => {
          const el = videoRef.current;
          if (!el || el.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
          detector
            .detect(el)
            .then(async (codes) => {
              const raw = codes[0]?.rawValue;
              if (raw && (await handleScan(raw))) stopCamera();
            })
            .catch(() => undefined);
        }, 700);
      } catch {
        setError("Could not open camera. Check permissions and try again.");
        setScanState("idle");
      }
    }
    void start();
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [open, scanState, cameraSession, handleScan, stopCamera]);

  const subtitle =
    scanState === "locked"
      ? "Pick the venue folder, then unlock with that folder PIN."
      : scanState === "result"
        ? "Name and status loaded from the server."
        : "Point the camera at the pass QR.";

  return (
    <>
      <MitraLabsEventDayModalShell
        open={open}
        onClose={onClose}
        ariaLabel="Live gate camera scanner"
        eyebrow="Event day security"
        title="Live gate scanner"
        subtitle={subtitle}
        icon={Camera}
        tone="scanner"
        testId="event-day-scanner-modal"
        maxWidth={480}
        footer={
          scanState === "result" ? (
            <button
              type="button"
              className="wm-primarybtn wm-mlEntModal__btnPrimary wm-mlEntModal__btnFull"
              onClick={() => {
                scanningRef.current = false;
                setScanState("scanning");
                setHeadline("");
                setDetail("");
                setGuestName("");
                setCameraSession((n) => n + 1);
              }}
            >
              Scan next pass
            </button>
          ) : undefined
        }
      >
        {scanState === "locked" ? (
          <EventDayGateScannerLocked
            folders={folders}
            folder={folder}
            pin={shiftPin}
            error={unlockError}
            busy={unlockBusy}
            onPick={setFolder}
            onBack={() => {
              setFolder(null);
              setShiftPin("");
              setUnlockError(null);
            }}
            onPinChange={setShiftPin}
            onUnlock={() => void unlockShift()}
          />
        ) : scanState === "result" ? (
          <EventDayGateScannerResult
            headline={headline}
            tone={tone}
            guestName={guestName}
            detail={detail}
          />
        ) : error ? (
          <div className="wm-mlEntModal__fallback" data-testid="scanner-fallback">
            <div className="wm-ent-error" role="alert">
              <div className="wm-ent-error__subtitle">{error}</div>
            </div>
          </div>
        ) : (
          <div className="wm-mlEntModal__cameraWrap">
            <video
              ref={videoRef}
              className="wm-mlEntModal__camera"
              playsInline
              muted
              data-testid="scanner-video"
            />
            <div className="wm-mlEntModal__cameraGuide">
              Align the pass QR inside the frame
            </div>
          </div>
        )}
      </MitraLabsEventDayModalShell>

      <GlobalToast
        message={toast}
        tone={toastTone}
        visible={Boolean(toast)}
        onClose={() => setToast("")}
        testId="event-day-scanner-toast"
      />
    </>
  );
}
