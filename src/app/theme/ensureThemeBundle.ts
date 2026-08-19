/** Job Mitra | ensureThemeBundle.ts | Lazy-load role/route CSS once */

export type ThemeBundleId =
  | "employee-shell"
  | "employer-shell"
  | "admin-shell"
  | "shift-create-wizard"
  | "shift-planner"
  | "analytics-dashboard"
  | "mitra-labs";

const loaded = new Set<ThemeBundleId>();
const inflight = new Map<ThemeBundleId, Promise<void>>();

const LOADERS: Record<ThemeBundleId, () => Promise<unknown>> = {
  "employee-shell": () => import("./bundles/employee-shell.css"),
  "employer-shell": () => import("./bundles/employer-shell.css"),
  "admin-shell": () => import("./bundles/admin-shell.css"),
  "shift-create-wizard": () => import("./shift-create-wizard.css"),
  "shift-planner": () => import("./shift-planner.css"),
  "analytics-dashboard": () => import("./analytics-dashboard.css"),
  "mitra-labs": () => import("./mitra-labs.css"),
};

/** Idempotent CSS bundle loader — resolves only after the stylesheet import settles. */
export function ensureThemeBundle(bundleId: ThemeBundleId): Promise<void> {
  if (loaded.has(bundleId)) return Promise.resolve();
  const existing = inflight.get(bundleId);
  if (existing) return existing;

  const pending = LOADERS[bundleId]()
    .then(() => {
      loaded.add(bundleId);
    })
    .finally(() => {
      inflight.delete(bundleId);
    });

  inflight.set(bundleId, pending);
  return pending;
}
