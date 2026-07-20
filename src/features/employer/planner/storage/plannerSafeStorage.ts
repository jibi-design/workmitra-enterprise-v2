// Job Mitra | plannerSafeStorage.ts | Crash-safe localStorage (authStore pattern)

export function plannerGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error("[planner] storage read error", key, error);
    return null;
  }
}

export function plannerSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error("[planner] storage write error", key, error);
    return false;
  }
}

export function plannerRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("[planner] storage delete error", key, error);
  }
}

export function plannerReadJson<T>(key: string, fallback: T): T {
  const raw = plannerGetItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error("[planner] storage parse error", key, error);
    return fallback;
  }
}

export function plannerWriteJson(key: string, value: unknown): boolean {
  try {
    return plannerSetItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("[planner] storage stringify error", key, error);
    return false;
  }
}

export function plannerDispatchChanged(eventName: string): void {
  try {
    window.dispatchEvent(new Event(eventName));
  } catch {
    /* noop */
  }
}
