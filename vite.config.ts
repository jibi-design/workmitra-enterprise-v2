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
      watch: {
        ignored: ["**/.tmp/**"],
      },
      proxy: {
        "/v1": {
          target: "http://localhost:3001",
          changeOrigin: true,
          ws: true,
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
          name: "Job Mitra",
          short_name: "Job Mitra",
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
      /**
       * Chunk policy:
       * - Split heavy node_modules into named vendor chunks (load-speed / cache).
       * - Do NOT force feature/bridge path chunks — that created Circular chunk
       *   cycles with supabase/vendor. Domain barrels use import+bind instead of
       *   `export { x } from` to avoid Rollup reexport circular-chunk warnings.
       * - App code-splitting stays route-level via React.lazy / lazyPage.
       * - jspdf / html2canvas are dynamic-imported at export call sites only.
       */
      rollupOptions: {
        onwarn(warning, defaultHandler) {
          const msg = warning.message ?? "";
          // Fail hard on true Circular chunk cycles (manualChunks mistakes).
          // Reexport-across-async-chunk notices are tracked separately; const SoT
          // live bindings are required for ESM TDZ safety under planner↔shift cycles.
          if (msg.includes("Circular chunk:")) {
            throw new Error(`[circular-chunks] ${msg}`);
          }
          if (
            msg.includes("circular dependency between chunks") ||
            msg.includes("will end up in different chunks by current Rollup settings")
          ) {
            console.warn(`[circular-chunks:reexport] ${msg}`);
            return;
          }
          defaultHandler(warning);
        },
        output: {
          manualChunks(id) {
            const norm = id.replace(/\\/g, "/").split("?")[0];
            if (!norm.includes("/node_modules/")) return undefined;

            // PDF / canvas export engines — keep isolated (eager shell must not pull these)
            if (norm.includes("jspdf") || norm.includes("canvg") || norm.includes("svg2pdf")) {
              return "pdf-engine";
            }
            if (norm.includes("html2canvas")) return "html2canvas";

            // Core framework
            if (
              /\/node_modules\/(react-dom|react|scheduler)\//.test(norm) ||
              /\/node_modules\/react\/index/.test(norm)
            ) {
              return "react-vendor";
            }
            if (norm.includes("react-router")) return "router-vendor";
            if (norm.includes("zustand")) return "state-vendor";

            // Named mid-weight libs (shrink catch-all vendor)
            if (norm.includes("lucide-react")) return "icons-vendor";
            if (norm.includes("/zod/") || norm.endsWith("/zod")) {
              return "zod-vendor";
            }
            if (norm.includes("@dnd-kit")) return "dnd-vendor";
            if (norm.includes("framer-motion")) return "motion-vendor";

            // Heavy optional SDKs — isolate from catch-all vendor
            if (norm.includes("agora-rtc-sdk") || norm.includes("agora-token"))
              return "agora-vendor";
            if (norm.includes("@sentry")) return "sentry-vendor";
            if (norm.includes("@supabase")) return "supabase-vendor";
            if (norm.includes("@tanstack")) return "virtual-vendor";
            if (
              norm.includes("sanitize-html") ||
              norm.includes("htmlparser") ||
              norm.includes("domhandler")
            ) {
              return "sanitize-vendor";
            }
            if (norm.includes("qrcode")) return "qrcode-vendor";

            return "vendor";
          },
        },
      },
    },
  };
});
