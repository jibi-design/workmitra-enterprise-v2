/** Job Mitra | Work area code parse (no GPS, no country lock). */

const PINCODE_RE = /^[1-9][0-9]{5}$/;

export function parsePincode(raw: string | null | undefined): string | null {
  if (typeof raw !== "string") return null;
  const digits = raw.replace(/\D/g, "");
  if (!PINCODE_RE.test(digits)) return null;
  return digits;
}

export function sanitizePincodeInput(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 6);
}

export function isValidPincode(raw: string | null | undefined): boolean {
  return parsePincode(raw) !== null;
}
