/** Job Mitra | knip.config.ts
 *  Dead code detection — tuned for lazyPage() route loading and Phase 2 dev routing.
 *  Pages are explicit entry files because knip cannot trace lazyPage() wrappers.
 */

import type { KnipConfig } from "knip";

const config: KnipConfig = {
  vite: false,

  entry: [
    "src/main.tsx",
    "src/App.tsx",
    "src/app/router/AppRouter.tsx",
    "src/app/router/routePaths.ts",
    "src/app/router/guards/**/*.{ts,tsx}",
    "src/app/shells/**/*.{ts,tsx}",
    /** Lazy-loaded route pages (lazyPage abstracts dynamic import strings) */
    "src/features/**/pages/**/*.{ts,tsx}",
    /** Phase 2 + navigation runtime wired from shells */
    "src/config/navigation.runtime.ts",
    "src/shared/config/featureFlags.ts",
    "src/shared/launch/**/*.{ts,tsx}",
    /** Cross-cutting feature roots wired from shells / router */
    "src/features/pulse/**/*.{ts,tsx}",
    "src/hooks/useDynamicNav.ts",
    "src/components/layout/BottomNav/BottomNav.tsx",
  ],

  project: ["src/**/*.{ts,tsx}"],

  ignore: [
    "src/dev/**",
    "scripts/**",
    "tests/**",
    "dist/**",
    "android/**",
    "src/shared/schemas/**",
    /** Scaffold modal — page inlines doc-access steps until DocAccessModal is mounted */
    "src/features/employer/careerJobs/docAccess/DocAccessModal.tsx",
  ],

  ignoreExportsUsedInFile: true,

  /** Enforce dependency hygiene; file/export noise suppressed for lazy-loaded feature layer */
  rules: {
    files: "off",
    exports: "off",
    types: "off",
    enumMembers: "off",
    duplicates: "off",
  },

  ignoreDependencies: [
    "@capacitor/cli",
    "@million/lint",
    "@playwright/test",
    "@vitejs/plugin-react",
    "eslint-plugin-react-hooks",
    "eslint-plugin-react-refresh",
    "husky",
    "jsdom",
    "lint-staged",
    "madge",
    "knip",
    "prettier",
    "vite-bundle-visualizer",
    "vite-plugin-pwa",
    "vitest",
  ],

  treatConfigHintsAsErrors: false,
};

export default config;
