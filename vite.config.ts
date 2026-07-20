// vite.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import MillionLint from "@million/lint";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
const isKnipRun = process.env.npm_lifecycle_event === "check:dead";
/** Million Lint instruments hooks in dev and can trigger invalid hook call errors with React 19. */
const enableMillionLint = !isKnipRun && process.env.VITE_ENABLE_MILLION_LINT === "true";

export default defineConfig(({ mode }) => ({
  define:
    mode === "auth"
      ? { "import.meta.env.VITE_AUTH_BACKEND_ENABLED": JSON.stringify("true") }
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
    exclude: ["**/node_modules/**", "**/dist/**", "tests/e2e/**"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "pdf-engine": ["jspdf"],
        },
      },
    },
  },
}));
