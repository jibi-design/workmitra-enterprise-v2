/** Job Mitra | personalWorkDiary.storage.ts
 * Personal Work Diary only — NEVER touch wm_work_diary_* (Hub Work Diary).
 */

export const PERSONAL_WORK_DIARY_KEY = "wm_personal_work_diary_v1";
export const PERSONAL_WORK_DIARY_CHANGED = "wm_personal_work_diary_changed";

export type PersonalWorkDiaryMetrics = {
  attendanceHours: number;
  tasks: number;
  notes: number;
  updatedAt: number;
};

type PersonalWorkDiaryState = {
  version: 1;
  metrics: PersonalWorkDiaryMetrics;
};

const EMPTY_METRICS: PersonalWorkDiaryMetrics = {
  attendanceHours: 0,
  tasks: 0,
  notes: 0,
  updatedAt: 0,
};

function emptyState(): PersonalWorkDiaryState {
  return { version: 1, metrics: { ...EMPTY_METRICS } };
}

function read(): PersonalWorkDiaryState {
  try {
    const raw = localStorage.getItem(PERSONAL_WORK_DIARY_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as PersonalWorkDiaryState;
    if (parsed?.version !== 1 || !parsed.metrics) return emptyState();
    return {
      version: 1,
      metrics: {
        attendanceHours: Number(parsed.metrics.attendanceHours) || 0,
        tasks: Number(parsed.metrics.tasks) || 0,
        notes: Number(parsed.metrics.notes) || 0,
        updatedAt: Number(parsed.metrics.updatedAt) || 0,
      },
    };
  } catch {
    return emptyState();
  }
}

function write(next: PersonalWorkDiaryState): void {
  localStorage.setItem(PERSONAL_WORK_DIARY_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(PERSONAL_WORK_DIARY_CHANGED));
}

export const personalWorkDiaryStorage = {
  getMetrics(): PersonalWorkDiaryMetrics {
    return read().metrics;
  },

  getMetricsSnapshot(): string {
    return JSON.stringify(read().metrics);
  },

  hasActivity(): boolean {
    const m = read().metrics;
    return m.attendanceHours > 0 || m.tasks > 0 || m.notes > 0;
  },

  setMetrics(partial: Partial<Omit<PersonalWorkDiaryMetrics, "updatedAt">>): PersonalWorkDiaryMetrics {
    const prev = read();
    const metrics: PersonalWorkDiaryMetrics = {
      attendanceHours:
        partial.attendanceHours !== undefined
          ? Math.max(0, partial.attendanceHours)
          : prev.metrics.attendanceHours,
      tasks: partial.tasks !== undefined ? Math.max(0, Math.floor(partial.tasks)) : prev.metrics.tasks,
      notes: partial.notes !== undefined ? Math.max(0, Math.floor(partial.notes)) : prev.metrics.notes,
      updatedAt: Date.now(),
    };
    write({ version: 1, metrics });
    return metrics;
  },

  subscribe(callback: () => void): () => void {
    const onStorage = (event: StorageEvent) => {
      if (event.key === PERSONAL_WORK_DIARY_KEY || event.key === null) callback();
    };
    window.addEventListener(PERSONAL_WORK_DIARY_CHANGED, callback);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(PERSONAL_WORK_DIARY_CHANGED, callback);
      window.removeEventListener("storage", onStorage);
    };
  },
};
