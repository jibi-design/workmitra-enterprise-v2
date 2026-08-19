import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Job Mitra — Capacitor shell (Play Store Android).
 * Sprint 2: HTTPS WebView scheme + allowNavigation for API / Supabase hosts.
 *
 * Cookie sessions: API must emit SameSite=None; Secure for Capacitor origins
 * (see server auth cookie builder + WM_COOKIE_SAMESITE). Client uses credentials:include.
 */
const config: CapacitorConfig = {
  appId: "com.mitralabs.jobmitra",
  appName: "Job Mitra",
  webDir: "dist",
  server: {
    /** Capacitor 8 Android WebView origin ≈ https://localhost */
    androidScheme: "https",
    /** Allow in-app navigation / XHR to API + Supabase (not unrestricted cleartext). */
    allowNavigation: [
      "localhost",
      "127.0.0.1",
      "*.supabase.co",
      "*.mitraaccesshub.com",
      "*.mitralabs.app",
    ],
  },
  android: {
    allowMixedContent: false,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    /**
     * Keep native CapacitorHttp OFF so browser fetch + credentialed cookies
     * stay in the WebView cookie jar (session auth).
     */
    CapacitorHttp: {
      enabled: false,
    },
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: "#0f172a",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
