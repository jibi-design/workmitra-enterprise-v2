/** Job Mitra | dailyOs.viewState.helpers.ts | Loading / empty / error / active */

export type DailyOsViewState = "loading" | "empty" | "error" | "active";

export function resolveDailyOsViewState(args: {
  readonly ready: boolean;
  readonly error: string | null;
  readonly isEmpty: boolean;
}): DailyOsViewState {
  if (!args.ready) return "loading";
  if (args.error) return "error";
  if (args.isEmpty) return "empty";
  return "active";
}

export function tryDomainRead<T>(read: () => T, fallback: T): { value: T; error: string | null } {
  try {
    return { value: read(), error: null };
  } catch {
    return { value: fallback, error: "Could not load this module." };
  }
}
