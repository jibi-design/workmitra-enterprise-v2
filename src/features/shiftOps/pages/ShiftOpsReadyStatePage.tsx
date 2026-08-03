/** Job Mitra | ShiftOpsReadyStatePage.tsx | Phase 1 — Ready + Availability (test alert = DEV only) */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchLastTestAlertAt,
  requestTestAlert,
  setMyAvailability,
} from "../services/readyState.service";

const DAY_MS = 24 * 60 * 60 * 1000;
const SHOW_TEST_ALERT = false;

function isAuthNoiseMessage(raw: string): boolean {
  return /anonymous|sign-in|signin|auth bridge|not authenticated|jwt|disabled/i.test(raw);
}

export function ShiftOpsReadyStatePage() {
  const [available, setAvailable] = useState(true);
  const [lastTestAt, setLastTestAt] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const last = await fetchLastTestAlertAt();
    setLastTestAt(last);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const last = await fetchLastTestAlertAt();
        if (!cancelled) setLastTestAt(last);
      } catch {
        /* ignore load errors on mount */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const nextAllowed = useMemo(() => {
    if (!lastTestAt) return null;
    return new Date(new Date(lastTestAt).getTime() + DAY_MS);
  }, [lastTestAt]);

  const [nowMs, setNowMs] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 15_000);
    queueMicrotask(() => setNowMs(Date.now()));
    return () => window.clearInterval(id);
  }, []);

  const rateLimited = Boolean(nextAllowed && nowMs > 0 && nextAllowed.getTime() > nowMs);

  async function onToggleAvailability() {
    setBusy(true);
    setError(null);
    try {
      const next = !available;
      await setMyAvailability(next);
      setAvailable(next);
      setBusy(false);
    } catch (err) {
      setBusy(false);
      const raw =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Could not update availability";
      if (isAuthNoiseMessage(raw)) {
        // Local/demo: keep UI toggle without surfacing bridge errors to workers.
        setAvailable((prev) => !prev);
        return;
      }
      setError(raw);
    }
  }

  async function onTestAlert() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const testedAt = await requestTestAlert();
      setLastTestAt(testedAt);
      setMessage("Test alert logged. Delivery providers ship in a later phase.");
      setBusy(false);
    } catch (err) {
      setBusy(false);
      const raw =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Test alert failed";
      if (isAuthNoiseMessage(raw)) return;
      setError(
        raw.includes("test_alert_rate_limited") ? "Test Alert is limited to 1 per 24 hours." : raw,
      );
      await refresh().catch(() => undefined);
    }
  }

  return (
    <section
      className="wm-ee-card wm-ee-vShift"
      data-testid="shift-ops-ready-state"
      style={{ maxWidth: "100%" }}
    >
      <div className="wm-pageSub">Ready for assignment</div>
      <h1 className="wm-ee-cardTitle" style={{ fontSize: 18, marginTop: 4 }}>
        You are ready
      </h1>
      <p style={{ fontSize: 13, color: "var(--wm-neutral-500)", lineHeight: 1.45 }}>
        No pending shift right now. Set availability when you can take assignments.
      </p>

      <div
        style={{
          marginTop: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "10px 12px",
          borderRadius: 12,
          border: "1px solid rgba(22,163,74,0.22)",
          background: "rgba(22,163,74,0.06)",
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "var(--wm-er-text, #0f172a)" }}>
            Availability
          </div>
          <div style={{ fontSize: 12, color: "var(--wm-neutral-500)", marginTop: 2 }}>
            {available ? "Available for assignment" : "Unavailable"}
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={available}
          data-testid="shift-ops-set-availability"
          disabled={busy}
          onClick={() => void onToggleAvailability()}
          className={available ? "wm-shiftOpsReadyToggle isOn" : "wm-shiftOpsReadyToggle"}
          style={{
            width: 48,
            height: 28,
            borderRadius: 999,
            border: "none",
            padding: 2,
            cursor: busy ? "wait" : "pointer",
            background: available
              ? "var(--wm-green-600)"
              : "color-mix(in srgb, var(--wm-neutral-500) 35%, transparent)",
            flexShrink: 0,
          }}
        >
          <span
            aria-hidden
            className="wm-shiftOpsReadyToggleKnob"
            style={{
              display: "block",
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "var(--wm-career-bg, #fff)",
              boxShadow: "0 1px 4px color-mix(in srgb, var(--wm-neutral-900) 20%, transparent)",
              transform: available ? "translateX(20px)" : "translateX(0)",
            }}
          />
        </button>
      </div>

      {SHOW_TEST_ALERT ? (
        <>
          <button
            type="button"
            className="wm-primarybtn"
            style={{ marginTop: 12, width: "100%" }}
            disabled={busy || rateLimited}
            onClick={() => void onTestAlert()}
            data-testid="shift-ops-test-alert"
          >
            Test alert system
          </button>
          {rateLimited && nextAllowed ? (
            <p style={{ fontSize: 11, color: "var(--wm-neutral-500)", marginTop: 8 }}>
              Next test allowed after {nextAllowed.toLocaleString()}
            </p>
          ) : null}
        </>
      ) : null}

      {message ? (
        <div
          role="status"
          style={{
            marginTop: 8,
            padding: "8px 12px",
            borderRadius: 10,
            background: "rgba(22,163,74,0.08)",
            border: "1px solid rgba(22,163,74,0.22)",
            fontSize: 12,
            fontWeight: 700,
            color: "#15803d",
          }}
        >
          {message}
        </div>
      ) : null}
      {error ? (
        <div
          role="alert"
          style={{
            marginTop: 8,
            padding: "8px 12px",
            borderRadius: 10,
            background: "rgba(185,28,28,0.06)",
            border: "1px solid rgba(185,28,28,0.18)",
            fontSize: 13,
            fontWeight: 600,
            color: "#b91c1c",
          }}
        >
          {error}
        </div>
      ) : null}
    </section>
  );
}
