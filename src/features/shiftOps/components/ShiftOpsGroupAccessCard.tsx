/** Job Mitra | ShiftOpsGroupAccessCard.tsx | Manager: static link + today’s Daily OTP */

import { useCallback, useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  buildGroupJoinPath,
  ensureSiteStaticLink,
  listManagedSites,
  rotateSiteDailyOtp,
  rotateSiteStaticLink,
  siteDailyOtpStatus,
} from "../services/groupDailyOtp.service";
import type { SiteRow } from "../types";
import { extractErrorMessage, mapGroupJoinError } from "../helpers/groupJoinErrors";
import {
  isShiftOpsAuthConfigNoise,
  shiftOpsAuthNoiseCopy,
} from "../helpers/shiftOpsAuthNoise.helpers";

function errMessage(err: unknown): string {
  return mapGroupJoinError(extractErrorMessage(err));
}

function buildJoinAbsoluteUrl(joinPath: string): string {
  return `${window.location.origin}/#${joinPath}`;
}

export function ShiftOpsGroupAccessCard() {
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [groupId, setGroupId] = useState("");
  const [rawToken, setRawToken] = useState<string | null>(null);
  const [dailyOtp, setDailyOtp] = useState<string | null>(null);
  const [otpDay, setOtpDay] = useState<string | null>(null);
  const [hasActiveOtp, setHasActiveOtp] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authNoise, setAuthNoise] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  const refreshStatus = useCallback(async (id: string) => {
    if (!id) return;
    const status = await siteDailyOtpStatus(id);
    setHasActiveOtp(status.has_active_otp);
    setOtpDay(status.otp_day);
  }, []);

  useEffect(() => {
    void listManagedSites()
      .then((rows) => {
        setSites(rows);
        if (rows[0]) setGroupId(rows[0].id);
      })
      .catch((err) => {
        const msg = errMessage(err);
        if (isShiftOpsAuthConfigNoise(msg) || isShiftOpsAuthConfigNoise(extractErrorMessage(err))) {
          setAuthNoise(true);
          setError(null);
          return;
        }
        setError(msg);
      });
  }, []);

  useEffect(() => {
    if (!groupId) return;
    let cancelled = false;
    void (async () => {
      if (cancelled) return;
      setRawToken(null);
      setDailyOtp(null);
      setInfo(null);
      try {
        await refreshStatus(groupId);
      } catch (err) {
        if (cancelled) return;
        const msg = errMessage(err);
        if (isShiftOpsAuthConfigNoise(msg) || isShiftOpsAuthConfigNoise(extractErrorMessage(err))) {
          setAuthNoise(true);
          return;
        }
        setError(msg);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [groupId, refreshStatus]);

  async function onEnsureLink() {
    if (!groupId) return;
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const result = await ensureSiteStaticLink(groupId);
      if (result.raw_token) {
        setRawToken(result.raw_token);
        setInfo("New static group link created. Copy now — raw token is not shown again.");
      } else {
        setInfo(
          "Static link already exists. Raw token is not stored; rotate to issue a new QR (old QR stops working).",
        );
      }
    } catch (err) {
      const msg = errMessage(err);
      if (isShiftOpsAuthConfigNoise(msg) || isShiftOpsAuthConfigNoise(extractErrorMessage(err))) {
        setAuthNoise(true);
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  }

  async function onRotateLink() {
    if (!groupId) return;
    setBusy(true);
    setError(null);
    try {
      const result = await rotateSiteStaticLink(groupId);
      setRawToken(result.raw_token);
      setInfo("Static link rotated. Update printed QR / shared link.");
    } catch (err) {
      const msg = errMessage(err);
      if (isShiftOpsAuthConfigNoise(msg) || isShiftOpsAuthConfigNoise(extractErrorMessage(err))) {
        setAuthNoise(true);
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  }

  async function onMintDailyOtp() {
    if (!groupId) return;
    setBusy(true);
    setError(null);
    try {
      const result = await rotateSiteDailyOtp(groupId);
      setDailyOtp(result.daily_otp);
      setOtpDay(result.otp_day);
      setHasActiveOtp(true);
      setInfo("Today’s Active Daily OTP minted. Share with workers joining today only.");
    } catch (err) {
      const msg = errMessage(err);
      if (isShiftOpsAuthConfigNoise(msg) || isShiftOpsAuthConfigNoise(extractErrorMessage(err))) {
        setAuthNoise(true);
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  }

  const joinPath = rawToken ? buildGroupJoinPath(rawToken, groupId) : null;
  const joinUrl = joinPath ? buildJoinAbsoluteUrl(joinPath) : null;

  async function onCopyJoinUrl() {
    if (!joinPath) return;
    const url = buildJoinAbsoluteUrl(joinPath);
    try {
      await navigator.clipboard.writeText(url);
      setInfo("Join URL copied.");
    } catch {
      /* TIER: ADVISORY */ console.warn("[ShiftOpsGroupAccess] clipboard unavailable");
      setInfo(url);
    }
  }

  return (
    <section className="wm-shiftOpsSectionCard" data-testid="shift-ops-group-access">
      <header className="wm-shiftOpsSectionHead">
        <div>
          <div className="wm-shiftOpsSectionEyebrow">Group access &amp; access keys</div>
          <h2 className="wm-shiftOpsSectionTitle">Static link / QR + Daily OTP</h2>
        </div>
      </header>

      <p className="wm-shiftOpsSectionCopy">
        Link stays valid across days. Workers must enter today’s Active Daily OTP to join.
      </p>

      {authNoise ? (
        <p className="wm-shiftOpsAuthNote" data-testid="shift-ops-auth-noise-once">
          {shiftOpsAuthNoiseCopy()}
        </p>
      ) : null}

      {sites.length === 0 ? (
        <div className="wm-shiftOpsEmptyState">
          <div className="wm-shiftOpsEmptyTitle">No managed sites yet</div>
          <p className="wm-shiftOpsEmptySubtitle">Create a group first to unlock access keys.</p>
        </div>
      ) : (
        <label className="wm-shiftOpsField">
          Group (site)
          <select
            className="wm-input"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            data-testid="shift-ops-group-select"
          >
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.id.slice(0, 8)}…)
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="wm-shiftOpsActionPillRow">
        <button
          type="button"
          className="wm-shiftOpsActionPill wm-shiftOpsActionPill--primary"
          disabled={busy || !groupId}
          onClick={() => void onEnsureLink()}
        >
          Ensure Static Link
        </button>
        <button
          type="button"
          className="wm-shiftOpsActionPill"
          disabled={busy || !groupId}
          onClick={() => void onRotateLink()}
        >
          Rotate Link
        </button>
        <button
          type="button"
          className="wm-shiftOpsActionPill wm-shiftOpsActionPill--primary"
          disabled={busy || !groupId}
          onClick={() => void onMintDailyOtp()}
          data-testid="shift-ops-mint-daily-otp"
        >
          Mint Today’s OTP
        </button>
      </div>

      {otpDay ? (
        <p className="wm-shiftOpsMetaLine">
          OTP day (UTC): {otpDay} — {hasActiveOtp ? "active code on file" : "no code yet"}
        </p>
      ) : null}

      {rawToken ? (
        <div className="wm-shiftOpsCodeBlock">
          <div className="wm-shiftOpsCodeLabel">Raw static token (copy once)</div>
          <code data-testid="shift-ops-static-token">{rawToken}</code>
        </div>
      ) : null}

      {joinUrl ? (
        <div className="wm-shiftOpsQrBlock">
          <QRCodeSVG
            value={joinUrl}
            size={168}
            level="M"
            data-testid="shift-ops-group-qr"
            style={{ borderRadius: 12, padding: 8, background: "#fff" }}
          />
          <p className="wm-shiftOpsMetaLine">Scan to join · updates with today’s OTP</p>
          <button
            type="button"
            className="wm-shiftOpsActionPill"
            data-testid="shift-ops-copy-join-url"
            onClick={() => void onCopyJoinUrl()}
          >
            Copy join URL
          </button>
        </div>
      ) : null}

      {dailyOtp ? (
        <div className="wm-shiftOpsOtpBlock">
          <div className="wm-shiftOpsCodeLabel">Today’s Active Daily OTP</div>
          <div
            data-testid="shift-ops-daily-otp"
            className="wm-shiftOpsOtpDigits"
            aria-label={`Daily OTP ${dailyOtp}`}
          >
            {dailyOtp.split("").map((digit, i) => (
              <span key={`${digit}-${i}`} className="wm-shiftOpsOtpDigit">
                {digit}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {info ? <div className="wm-shiftOpsInfoNote">{info}</div> : null}
      {error ? (
        <div role="alert" className="wm-shiftOpsErrorNote">
          {error}
        </div>
      ) : null}
    </section>
  );
}
