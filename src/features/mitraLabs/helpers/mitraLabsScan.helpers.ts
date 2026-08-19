/** Extract opaque pass token from scanned QR payload. */

export function extractPassTokenFromScan(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const hashMatch = trimmed.match(/\/labs\/pass\/verify\/([^?#&]+)/i);
  if (hashMatch?.[1]) return decodeURIComponent(hashMatch[1]);

  try {
    const url = new URL(trimmed);
    const fromHash = url.hash.match(/\/labs\/pass\/verify\/([^?#&]+)/i);
    if (fromHash?.[1]) return decodeURIComponent(fromHash[1]);
    const fromPath = url.pathname.match(/\/labs\/pass\/verify\/([^/?#]+)/i);
    if (fromPath?.[1]) return decodeURIComponent(fromPath[1]);
  } catch {
    // not a URL — fall through
  }

  const loose = trimmed.match(/verify\/([A-Za-z0-9_-]{8,})/i);
  return loose?.[1] ? decodeURIComponent(loose[1]) : null;
}
