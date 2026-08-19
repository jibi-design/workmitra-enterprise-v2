/** Pass validity window — presets and outside-window detection. */

import type { PassValidityFields } from "./mitraLabs.helpers";

export type PassDurationPresetId = "single_shift" | "three_day" | "one_week";

export type PassDurationPreset = {
  readonly id: PassDurationPresetId;
  readonly label: string;
  readonly detail: string;
  readonly durationMs: number;
};

export const PASS_DURATION_PRESETS: ReadonlyArray<PassDurationPreset> = [
  {
    id: "single_shift",
    label: "Single shift",
    detail: "8-hour event window",
    durationMs: 8 * 60 * 60 * 1000,
  },
  {
    id: "three_day",
    label: "3-day pass",
    detail: "Multi-day event access",
    durationMs: 3 * 24 * 60 * 60 * 1000,
  },
  {
    id: "one_week",
    label: "1-week pass",
    detail: "Seven-day access window",
    durationMs: 7 * 24 * 60 * 60 * 1000,
  },
];

export function toLocalInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function applyPassDurationPreset(
  presetId: PassDurationPresetId,
  anchor = new Date(),
): { validFrom: string; validUntil: string } {
  const preset = PASS_DURATION_PRESETS.find((p) => p.id === presetId) ?? PASS_DURATION_PRESETS[0]!;
  const from = new Date(anchor);
  const until = new Date(from.getTime() + preset.durationMs);
  return {
    validFrom: toLocalInputValue(from),
    validUntil: toLocalInputValue(until),
  };
}

export function isOutsidePassWindow(pass: PassValidityFields): boolean {
  const now = Date.now();
  const fromMs = Date.parse(pass.validFrom);
  const untilMs = Date.parse(pass.validUntil);
  if (Number.isFinite(fromMs) && now < fromMs) return true;
  if (Number.isFinite(untilMs) && now > untilMs) return true;
  return false;
}

export const OUTSIDE_PASS_WINDOW_COPY = "Pass Inactive / Outside Event Shift Timing";
