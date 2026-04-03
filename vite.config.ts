// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["wm-icon.svg", "wm-icon-192.png", "wm-icon-512.png"],
      devOptions: {
        enabled: true,
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
            options: { cacheName: "google-fonts-cache", expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 } },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "pdf-engine": ["jspdf"],
        },
      },
    },
  },
});