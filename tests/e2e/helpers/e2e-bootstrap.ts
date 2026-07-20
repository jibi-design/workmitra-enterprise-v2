import type { Page } from "@playwright/test";

/** Local Vite dev server — matches playwright.config.ts baseURL */
export const E2E_BASE_URL = "http://localhost:5173";

const ROLE_KEY = "wm_role_session_v1";
const SPLASH_KEY = "wm_splash_intro_played_v1";

export async function bootstrapEmployeeSession(page: Page): Promise<void> {
  await page.addInitScript(
    ({ roleKey, splashKey }) => {
      sessionStorage.setItem(roleKey, "employee");
      sessionStorage.setItem(splashKey, "1");
    },
    { roleKey: ROLE_KEY, splashKey: SPLASH_KEY },
  );
}

export async function bootstrapEmployerSession(page: Page): Promise<void> {
  await page.addInitScript(
    ({ roleKey, splashKey }) => {
      sessionStorage.setItem(roleKey, "employer");
      sessionStorage.setItem(splashKey, "1");
    },
    { roleKey: ROLE_KEY, splashKey: SPLASH_KEY },
  );
}

/**
 * Navigate to a hash route on the running dev server.
 * @param hashPath e.g. `/#/employee/shift` or `/employee/shift`
 */
export async function gotoHash(page: Page, hashPath: string): Promise<void> {
  const normalized = hashPath.startsWith("/#")
    ? hashPath
    : hashPath.startsWith("#")
      ? `/${hashPath}`
      : `/#${hashPath.startsWith("/") ? hashPath : `/${hashPath}`}`;

  await page.goto(`${E2E_BASE_URL}${normalized}`);
  await page.waitForLoadState("domcontentloaded");
}

/** Mitra green active fill on selected availability day circles */
export const SHIFT_ACTIVE_GREEN_RGB = "rgb(22, 163, 74)";
