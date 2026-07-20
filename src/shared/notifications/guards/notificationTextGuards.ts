// App name: Job Mitra
// File name: notificationTextGuards.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\shared\notifications\guards\notificationTextGuards.ts

export function cleanNotificationText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";

  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

export function cleanOptionalNotificationText(
  value: unknown,
  maxLength: number,
): string | undefined {
  const clean = cleanNotificationText(value, maxLength);

  return clean || undefined;
}
