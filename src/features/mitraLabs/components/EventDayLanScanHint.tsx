/** Warn when this session is local-only — phones cannot scan loopback URLs. */

function isLoopbackHost(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
}

export function EventDayLanScanHint() {
  if (!isLoopbackHost()) return null;
  return (
    <p className="wm-mlHonesty" data-testid="event-day-lan-scan-hint">
      Local preview: printed QR payloads use the public Job Mitra origin, not this computer address.
    </p>
  );
}
