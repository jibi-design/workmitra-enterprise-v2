/** Job Mitra | appConfig.ts | src/shared/utils/appConfig.ts */

/**
 * ARCHITECTURE NOTE:
 * Central control for API URLs, feature flags, and global constants.
 * No hardcoded logic for environment-specific features.
 */

export const APP_CONFIG = {
  api: {
    baseUrl: import.meta.env.VITE_API_URL || "https://api.mitralabs.app",
    timeout: 30000,
  },
  features: {
    enableAnalytics: import.meta.env.PROD,
    enableBetaFeatures: false,
    /** Mirrored by runtimeOpsFlags poll (Sprint 3 remote actuators). */
    maintenanceMode: false,
  },
  branding: {
    appName: "Job Mitra",
    supportEmail: "support@mitralabs.app",
    version: "2.0.0",
  },
};
