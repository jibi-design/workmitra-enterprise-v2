/** Job Mitra | featureFlags.ts — global build-time feature gates */

/**
 * Phase 2 domains (Workforce, HR, Manager Console) are fully active in development
 * and hidden from production navigation, menus, and pulse routing.
 */
export const showPhase2Features = import.meta.env.DEV;
