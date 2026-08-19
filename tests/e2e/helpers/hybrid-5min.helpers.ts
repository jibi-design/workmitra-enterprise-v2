import { expect, type Page } from "@playwright/test";
import { runVisualInspector } from "./visual-assertion-inspector";

export type HttpProbe = {
  status429: number;
  status5xx: number;
  status5xxUrls: string[];
  pageErrors: string[];
  overflowHits: string[];
};

export function attachHybridProbes(page: Page, label: string, probe: HttpProbe): void {
  page.on("response", (res) => {
    const url = res.url();
    if (!url.includes("/v1/jobmitra/") && !url.includes(":3001")) return;
    if (res.status() === 429) probe.status429 += 1;
    if (res.status() >= 500) {
      probe.status5xx += 1;
      if (probe.status5xxUrls.length < 12) probe.status5xxUrls.push(`${res.status()} ${url}`);
    }
  });
  page.on("pageerror", (err) => {
    probe.pageErrors.push(`${label}: ${err.message}`);
  });
}

export async function assertNoHorizontalOverflow(page: Page, route: string, probe: HttpProbe): Promise<void> {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth > window.innerWidth + 2;
  });
  if (overflow) probe.overflowHits.push(route);
}

export async function inspectRoute(
  page: Page,
  hash: string,
  domain: "shift" | "career" | "planner",
  label: string,
): Promise<{ critical: number; high: number; messages: string[] }> {
  await page.goto(hash, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => undefined);
  const verdict = await runVisualInspector(page, {
    target: label,
    domain,
    proofMustCapture: [],
    reportPath: `test-results/hybrid-5min/inspect-${label}.json`,
  });
  const blocking = verdict.findings.filter(
    (f) => f.severity === "critical" || f.severity === "high",
  );
  return {
    critical: verdict.summary.critical,
    high: verdict.summary.high,
    messages: blocking.map((f) => `${f.severity}:${f.message}`),
  };
}

export async function probeHomeTicker(page: Page, testId: string): Promise<"visible" | "absent"> {
  const ticker = page.getByTestId(testId);
  await ticker.scrollIntoViewIfNeeded({ timeout: 8_000 }).catch(() => undefined);
  return (await ticker.isVisible().catch(() => false)) ? "visible" : "absent";
}

export async function dismissHomeTickerIfPresent(page: Page, testId: string): Promise<string> {
  const state = await probeHomeTicker(page, testId);
  if (state === "absent") return "absent";
  const dismiss = page.getByTestId(testId).getByTestId("home-status-strip-dismiss");
  if (await dismiss.isVisible().catch(() => false)) {
    await dismiss.click();
    return "dismissed";
  }
  return "visible-no-dismiss";
}

export async function ensureCareerSaveJobVisible(page: Page): Promise<boolean> {
  const save = page.getByTestId("career-save-job").first();
  if (await save.isVisible().catch(() => false)) return true;

  await page.evaluate(async () => {
    const rawProfile = localStorage.getItem("wm_employee_profile_v1") ?? "{}";
    let pin = "";
    try {
      const profile = JSON.parse(rawProfile) as { basePincode?: string };
      pin = typeof profile.basePincode === "string" ? profile.basePincode : "";
    } catch {
      pin = "";
    }
    const now = Date.now();
    const post = {
      id: "hybrid-career-save-001",
      companyName: "Hybrid Career Co",
      jobTitle: "Hybrid Save Role",
      department: "Operations",
      jobType: "full-time",
      workMode: "on-site",
      location: "",
      locationPincode: pin || undefined,
      salaryMin: 25000,
      salaryMax: 35000,
      salaryPeriod: "monthly",
      experienceMin: 0,
      experienceMax: 3,
      qualifications: [],
      skills: ["Operations"],
      description: "Hybrid save-control seed.",
      responsibilities: [],
      interviewRounds: 1,
      closingDate: now + 30 * 86_400_000,
      createdAt: now,
    };
    localStorage.setItem("wm_employee_career_posts_search_v1", JSON.stringify([post]));
    const nearby = await import("/src/features/employee/careerJobs/helpers/careerNearby.cache.ts");
    nearby.setNearbyCareerIds([post.id]);
    window.dispatchEvent(new Event("wm:employee-career-posts-changed"));
  });

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => undefined);
  await page.evaluate(async () => {
    const nearby = await import("/src/features/employee/careerJobs/helpers/careerNearby.cache.ts");
    nearby.setNearbyCareerIds(["hybrid-career-save-001"]);
  });
  await save.scrollIntoViewIfNeeded({ timeout: 12_000 }).catch(() => undefined);
  return save.isVisible().catch(() => false);
}

export async function probePlannerPlansApi(page: Page): Promise<{ status: number; ok: boolean }> {
  return page.evaluate(async () => {
    const res = await fetch("/v1/jobmitra/employer/planner/plans", {
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    return { status: res.status, ok: res.ok };
  });
}

export async function expectShellAlive(page: Page): Promise<void> {
  await expect(page.locator("body")).toBeVisible();
  const frozen = await page.evaluate(() => document.hidden);
  expect(frozen).toBe(false);
}
