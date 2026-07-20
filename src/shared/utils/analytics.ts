/** Job Mitra | analytics.ts | src/shared/utils/analytics.ts */

/**
 * ARCHITECTURE NOTE:
 * Centralized logging and event tracking infrastructure.
 */

type EventName =
  "page_view" | "button_click" | "job_applied" | "auth_login" | "error_boundary_triggered";

export const analytics = {
  trackEvent(event: EventName, data: Record<string, unknown> = {}) {
    // AUDIT: Replaced 'any' with 'unknown' to satisfy ESLint
    const payload = {
      event,
      data,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    if (import.meta.env.DEV) {
      console.log(`[Analytics Event]: ${event}`, payload);
    }
  },

  trackPageView(pageName: string) {
    this.trackEvent("page_view", { page: pageName });
  },
};
