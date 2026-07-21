/** Job Mitra | enterpriseToast.ts | Presentational employer toast bus (Luxury L3) */

export type EnterpriseToastTone = "success" | "error" | "info" | "warn";

export type EnterpriseToastPayload = {
  message: string;
  tone?: EnterpriseToastTone;
  durationMs?: number;
  id?: string;
};

type Listener = (toast: EnterpriseToastPayload | null) => void;

let current: EnterpriseToastPayload | null = null;
const listeners = new Set<Listener>();

function emit(next: EnterpriseToastPayload | null): void {
  current = next;
  for (const listener of listeners) {
    listener(current);
  }
}

/** Show a single toast (replaces any visible toast). No domain state. */
export function showEnterpriseToast(input: EnterpriseToastPayload): string {
  const id = input.id ?? `ent-toast-${Date.now()}`;
  emit({
    id,
    message: input.message,
    tone: input.tone ?? "info",
    durationMs: input.durationMs ?? 3200,
  });
  return id;
}

export function dismissEnterpriseToast(): void {
  if (!current) return;
  emit(null);
}

export function getEnterpriseToastSnapshot(): EnterpriseToastPayload | null {
  return current;
}

export function subscribeEnterpriseToast(listener: Listener): () => void {
  listeners.add(listener);
  listener(current);
  return () => {
    listeners.delete(listener);
  };
}

/** Test helper — clear listeners + current toast. */
export function __resetEnterpriseToastForTests(): void {
  current = null;
  listeners.clear();
}
