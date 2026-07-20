// Job Mitra | pendingRoute.ts | Preserve deep links across landing role pick

import { plannerPublicIndex } from "../../features/employer/planner/storage/plannerPublicIndex.storage";
import type { AppRole } from "../storage/roleStorage";

const PENDING_ROUTE_KEY = "wm_pending_route_v1";
const EMPLOYEE_PLANNER_PROJECT_ROUTE =
  /^\/employee\/(?:shift\/projects|planner\/projects)\/([^/]+)(?:\/(apply))?\/?$/;

export function stashPendingRoute(path: string): void {
  const normalized = path.trim();
  if (!normalized || normalized === "/") return;
  if (!/^\/(employee|employer|admin)(\/|$)/.test(normalized)) return;

  try {
    sessionStorage.setItem(PENDING_ROUTE_KEY, normalized);
  } catch {
    /* storage unavailable */
  }
}

export function consumePendingRoute(): string | null {
  try {
    const pending = sessionStorage.getItem(PENDING_ROUTE_KEY);
    if (pending) sessionStorage.removeItem(PENDING_ROUTE_KEY);
    return pending;
  } catch {
    return null;
  }
}

export function isPlannerProjectRouteAvailable(path: string): boolean {
  const match = path.match(EMPLOYEE_PLANNER_PROJECT_ROUTE);
  if (!match) return true;

  const planId = match[1] ?? "";
  const entry = plannerPublicIndex.getByPlanId(planId);
  return Boolean(entry && entry.status === "active");
}

/** Drop stale planner deep links so users land on home, not a dead project screen. */
export function sanitizeAppRoute(path: string, role: AppRole, fallback: string): string {
  const normalized = path.trim();
  if (!normalized || normalized === "/") return fallback;
  if (!normalized.startsWith(`/${role}`)) return fallback;

  if (role === "employee" && !isPlannerProjectRouteAvailable(normalized)) {
    return fallback;
  }

  return normalized;
}

export function resolvePostAuthRoute(role: AppRole, fallback: string): string {
  const pending = consumePendingRoute();
  if (!pending) return fallback;
  return sanitizeAppRoute(pending, role, fallback);
}

/** HashRouter deep links: /employee/... in pathname → /#/employee/... */
export function normalizeHashRouterDeepLink(): void {
  const { pathname, search } = window.location;
  if (!pathname || pathname === "/" || pathname === "/index.html") return;
  if (!/^\/(employee|employer|admin)(\/|$)/.test(pathname)) return;

  const target = `${window.location.origin}/#${pathname}${search}`;
  if (window.location.href === target) return;

  window.location.replace(target);
}
