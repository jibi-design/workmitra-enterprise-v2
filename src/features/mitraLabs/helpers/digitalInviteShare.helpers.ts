/** Event Day issued-pass share text. Isolated from Shift/Career. */

export function formatPassValidityInstant(value: string): string {
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) return "See pass for dates";
  return new Date(ms).toLocaleString();
}

/** Gate portal clock — 17 Aug 2026, 08:51 PM */
export function formatGatePortalDateTime(value: string): string {
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) return "See pass for dates";
  const date = new Date(ms);
  const day = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
    .format(date)
    .replace(/\s*(am|pm)$/i, (_, mer) => ` ${String(mer).toUpperCase()}`);
  return `${day}, ${time}`;
}

export function formatPassValidityRange(validFrom: string, validUntil: string): string {
  const from = formatPassValidityInstant(validFrom);
  const until = formatPassValidityInstant(validUntil);
  if (from === "See pass for dates" || until === "See pass for dates") return "See pass for dates";
  return `${from} to ${until}`;
}

export function resolvePassEventLabel(eventName: string | undefined, purpose: string): string {
  const named = eventName?.trim();
  return named || purpose;
}

export function buildEventPassShareText(params: {
  readonly companyName: string;
  readonly guestName: string;
  readonly eventName: string;
  readonly venueName: string;
  readonly validFrom: string;
  readonly validUntil: string;
  readonly verifyUrl: string;
}): string {
  const company = params.companyName.trim() || "Employer";
  const valid = formatPassValidityRange(params.validFrom, params.validUntil);
  return [
    `🎟️ *${company} - Event Entry Pass*`,
    "",
    `👤 *Name:* ${params.guestName}`,
    `🎪 *Event:* ${params.eventName}`,
    `📍 *Venue:* ${params.venueName}`,
    `📅 *Valid:* ${valid}`,
    "",
    "🔗 *Show this verification link at the security gate:*",
    params.verifyUrl,
  ].join("\n");
}

export function buildWhatsAppShareHref(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function canUseNativeShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export async function sharePassNatively(params: {
  readonly title: string;
  readonly text: string;
  readonly url: string;
}): Promise<"shared" | "aborted" | "unavailable"> {
  if (!canUseNativeShare()) return "unavailable";
  try {
    await navigator.share({ title: params.title, text: params.text, url: params.url });
    return "shared";
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return "aborted";
    return "unavailable";
  }
}
