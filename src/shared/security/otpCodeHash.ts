/** Job Mitra | otpCodeHash.ts | Hash OTP codes — never persist plaintext */

/**
 * SHA-256 hex digest of an OTP code (Web Crypto).
 * Used so browser storage never holds the raw OTP string.
 */
export async function hashOtpCode(code: string): Promise<string> {
  const normalized = code.trim();
  const bytes = new TextEncoder().encode(normalized);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function otpCodesMatch(submittedCode: string, storedHash: string): Promise<boolean> {
  if (!storedHash || !submittedCode.trim()) return false;
  const submittedHash = await hashOtpCode(submittedCode);
  return submittedHash === storedHash;
}
