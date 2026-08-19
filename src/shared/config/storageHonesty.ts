/**
 * Play Store honesty — Shift / Career / Planner remain device-local SoT in v2.0.
 * UI copy must not claim cloud sync for these domains until DB cutover ships.
 */

export const DEVICE_LOCAL_DOMAINS = [
  "shift",
  "career",
  "diary",
  "planner",
] as const;

export type DeviceLocalDomain = (typeof DEVICE_LOCAL_DOMAINS)[number];

/** Short disclosure for domain heroes / empty states. */
export const DEVICE_LOCAL_DISCLOSURE =
  "Saved on this device in this app version — not cloud-synced across phones yet.";

/** Play Console / Data Safety aligned wording. */
export const DEVICE_LOCAL_DATA_SAFETY_NOTE =
  "Shift jobs, Career applications, and Planner plans are stored locally on the device " +
  "unless a specific flow is marked as server-backed. Account login and session data use the Job Mitra API.";

export function isDeviceLocalDomain(domain: string): domain is DeviceLocalDomain {
  return (DEVICE_LOCAL_DOMAINS as readonly string[]).includes(domain);
}
