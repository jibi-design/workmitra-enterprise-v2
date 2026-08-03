// vite.config.ts
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import MillionLint from "@million/lint";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
const isKnipRun = process.env.npm_lifecycle_event === "check:dead";
/** Million Lint instruments hooks in dev and can trigger invalid hook call errors with React 19. */
const enableMillionLint = !isKnipRun && process.env.VITE_ENABLE_MILLION_LINT === "true";

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const authBackendEnabled =
    env.VITE_AUTH_BACKEND_ENABLED === "true" ||
    process.env.VITE_AUTH_BACKEND_ENABLED === "true" ||
    mode === "auth";

  // Wave-1 + Layer 6: refuse production builds without backend auth (client roleStorage is not RBAC).
  if (command === "build" && mode === "production" && !authBackendEnabled) {
    throw new Error(
      "[WorkMitra] Refusing production build: set VITE_AUTH_BACKEND_ENABLED=true " +
        "(e.g. in .env.production) or build with --mode auth.",
    );
  }

  // Layer 6: production build integrity — drop debug instrumentation
  const dropConsole = command === "build" && mode === "production";

  return {
    define:
      mode === "auth"
        ? { "import.meta.env.VITE_AUTH_BACKEND_ENABLED": JSON.stringify("true") }
        : undefined,
    esbuild: dropConsole
      ? {
          /** Drop debugger statements in production bundles. */
          drop: ["debugger"],
          pure: ["console.debug"],
        }
      : undefined,
    resolve: {
      dedupe: ["react", "react-dom", "react-router", "react-router-dom"],
    },
    server: {
      proxy: {
        "/v1": {
          target: "http://localhost:3001",
          changeOrigin: true,
        },
      },
    },
    plugins: [
      ...(enableMillionLint ? [MillionLint.vite()] : []),
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["wm-icon.svg", "wm-icon-192.png", "wm-icon-512.png"],
        devOptions: {
          enabled: false,
        },
        manifest: {
          id: "/",
          name: "WorkMitra",
          short_name: "WorkMitra",
          description: "Find jobs, build trust, grow your career.",
          theme_color: "#1d4ed8",
          background_color: "#ffffff",
          display: "standalone",
          start_url: "/",
          icons: [
            {
              src: "wm-icon-192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "wm-icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "wm-icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          // Vendor chunk can exceed default 2 MiB precache limit after bundling.
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
          globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
          navigateFallback: "index.html",
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-cache",
                expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 },
              },
            },
          ],
        },
      }),
    ],
    test: {
      globals: true,
      environment: "jsdom",
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "tests/e2e/**",
        "tests/load/**",
        "tests/security/**",
      ],
      coverage: {
        provider: "v8",
        reporter: ["text", "lcov", "json-summary"],
        include: ["src/**/*.{ts,tsx}"],
        exclude: ["src/**/*.test.ts", "src/**/__tests__/**", "src/tests/**", "src/**/*.d.ts"],
        thresholds: {
          lines: 90,
          functions: 90,
          branches: 90,
          statements: 90,
        },
      },
    },
    build: {
      sourcemap: false,
      minify: "esbuild",
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("jspdf")) return "pdf-engine";
              if (
                /node_modules[/\\](react-dom|react|scheduler)[/\\]/.test(id) ||
                /node_modules[/\\]react[/\\]index/.test(id)
              ) {
                return "react-vendor";
              }
              if (id.includes("react-router")) return "router-vendor";
              if (id.includes("zustand")) return "state-vendor";
              if (id.includes("html2canvas")) return "html2canvas";
              return "vendor";
            }
            if (id.includes("/features/admin/") || id.includes("\\features\\admin\\")) {
              return "admin-feature";
            }
            if (
              id.includes("/features/employer/hrManagement/") ||
              id.includes("\\features\\employer\\hrManagement\\")
            ) {
              return "hr-feature";
            }
            if (
              id.includes("/features/employer/workforceOps/") ||
              id.includes("\\features\\employer\\workforceOps\\") ||
              id.includes("/features/employee/workforce/") ||
              id.includes("\\features\\employee\\workforce\\")
            ) {
              return "workforce-feature";
            }
            return undefined;
          },
        },
      },
    },
  };
});
