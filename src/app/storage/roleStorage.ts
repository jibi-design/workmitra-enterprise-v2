// src/app/storage/roleStorage.ts
export type AppRole = "employee" | "employer" | "admin";

const KEY = "wm_role_v2";

export const roleStorage = {
  get(): AppRole | null {
    const raw = localStorage.getItem(KEY);
    if (raw === "employee" || raw === "employer" || raw === "admin") return raw;
    return null;
  },
  set(role: AppRole) {
    localStorage.setItem(KEY, role);
  },
  clear() {
    localStorage.removeItem(KEY);
  },
};