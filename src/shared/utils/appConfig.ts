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
    /** Play / package public name — keep identical to Capacitor appName + Android strings */
    packageId: "com.mitralabs.jobmitra",
    supportEmail: "support@mitraaccesshub.com",
    /** Keep in sync with package.json + android versionName */
    version: "2.0.0",
    /** Android versionCode — bump on every Play upload */
    versionCode: 20000,
  },
  privacy: {
    policyUrl: "https://jibi-design.github.io/workmitra-privacy/",
  },
};
