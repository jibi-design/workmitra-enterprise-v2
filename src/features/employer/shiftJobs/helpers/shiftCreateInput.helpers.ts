// App name: Job Mitra
// File name: shiftCreateInput.helpers.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\helpers\shiftCreateInput.helpers.ts

import type { ShiftPayBasis } from "../storage/employerShift.types";
import type { ShiftPayBasisDraft } from "./shiftCreateHelpers";

export function capitalizeFirstLetter(value: string): string {
  const leadingSpace = value.match(/^\s*/)?.[0] ?? "";
  const rest = value.slice(leadingSpace.length);

  if (!rest) {
    return value;
  }

  return `${leadingSpace}${rest.charAt(0).toUpperCase()}${rest.slice(1)}`;
}

export function removeAutocompleteDuplicate(previousValue: string, nextValue: string): string {
  const previous = previousValue.trim();
  const next = nextValue.trim();

  if (previous.length < 2 || next.length <= previous.length) {
    return nextValue;
  }

  const previousLower = previous.toLowerCase();
  const nextLower = next.toLowerCase();

  if (!nextLower.startsWith(previousLower)) {
    return nextValue;
  }

  const appended = next.slice(previous.length);
  const appendedLower = appended.toLowerCase();

  if (appendedLower.startsWith(previousLower)) {
    return appended;
  }

  return nextValue;
}

export function normalizeTextInput(previousValue: string, nextValue: string): string {
  return capitalizeFirstLetter(removeAutocompleteDuplicate(previousValue, nextValue));
}

export function normalizeEachLine(previousValue: string, nextValue: string): string {
  const previousLines = previousValue.split("\n");
  const nextLines = nextValue.split("\n");

  return nextLines
    .map((line, index) => normalizeTextInput(previousLines[index] ?? "", line))
    .join("\n");
}

export function toCreatePayBasis(value: ShiftPayBasisDraft): ShiftPayBasis {
  return value || "per_day";
}
