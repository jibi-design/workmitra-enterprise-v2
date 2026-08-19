import { expect, test, type Page } from "@playwright/test";
import {
  bootstrapEmployeeSession,
  bootstrapEmployerSession,
  gotoHash,
} from "./helpers/e2e-bootstrap";
import { E2E_VERIFIED_EMPLOYER_PROFILE } from "./helpers/e2e-employer-profile";
import { seedEmployerShiftDemo } from "./helpers/storage-seed";

const EXACT_ID = "loc-match-exact";
const TOWN_ID = "loc-match-town";
const FAR_ID = "loc-match-far";

function rollingIsoDates(): string[] {
  const days: string[] = [];
  const base = new Date();
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    days.push(`${y}-${m}-${day}`);
  }
  return days;
}

async function seedEmployerWithoutPincode(page: Page): Promise<void> {
  await page.addInitScript((profile) => {
    localStorage.setItem("wm_employer_profile_v1", JSON.stringify(profile));
    localStorage.setItem("wm:employer-profile", JSON.stringify(profile));
    localStorage.setItem("wm_employer_onboarding_complete_v1", "1");
    localStorage.setItem("wm_onboarding_complete_v1", "1");
  }, { ...E2E_VERIFIED_EMPLOYER_PROFILE, locationPincode: "" });
}

function nearbyFixturePosts() {
  const startAt = Date.now() + 86_400_000;
  const endAt = startAt + 28_800_000;
  return [
    {
      id: EXACT_ID,
      companyName: "Exact Pin Co",
      jobName: "Exact Pin Shift",
      category: "warehouse",
      experience: "helper",
      payPerDay: 900,
      locationName: "Kannur",
      locationPincode: "670001",
      distanceKm: 0,
      startAt,
      endAt,
    },
    {
      id: TOWN_ID,
      companyName: "Nearby Town Co",
      jobName: "Nearby Town Shift",
      category: "warehouse",
      experience: "helper",
      payPerDay: 900,
      locationName: "Nearby town",
      locationPincode: "670002",
      distanceKm: 1,
      startAt,
      endAt,
    },
    {
      id: FAR_ID,
      companyName: "Far Town Co",
      jobName: "Far Town Shift",
      category: "warehouse",
      experience: "helper",
      payPerDay: 900,
      locationName: "Kasargod",
      locationPincode: "671121",
      distanceKm: 40,
      startAt,
      endAt,
    },
  ];
}

async function seedEmployeeNearbyFixture(
  page: Page,
  opts: { basePincode: string; commuteRadius: 0 | 5 | 10 | 15 },
): Promise<void> {
  const posts = nearbyFixturePosts();
  await page.addInitScript(
    ({ profile, posts: seeded }) => {
      localStorage.setItem("wm_employee_profile_v1", JSON.stringify(profile));
      localStorage.setItem("wm_employee_shift_search_v1", JSON.stringify(seeded));
      localStorage.setItem("wm_employee_onboarding_complete_v1", "1");
      localStorage.setItem("wm_onboarding_complete_v1", "1");
    },
    {
      posts,
      profile: {
        uniqueId: "ML-E2E-LOC-AAA1",
        fullName: "E2E Location Worker",
        city: "Kannur",
        basePincode: opts.basePincode,
        commuteRadius: opts.commuteRadius,
        skills: ["warehouse"],
        experience: "fresher",
        languages: ["English"],
        preferShiftJobs: true,
        preferCareerJobs: true,
        availability: {
          weekdays: true,
          weekends: false,
          morning: true,
          afternoon: true,
          evening: false,
        },
      },
    },
  );
}

test.describe("Location matching — fail-closed (AUTH off)", () => {
  test("employer without pincode: radar stays 0 and never leaks names", async ({ page }) => {
    test.setTimeout(90_000);
    const todayIso = new Date().toISOString().slice(0, 10);
    const rolling = rollingIsoDates();

    await bootstrapEmployerSession(page);
    await seedEmployerWithoutPincode(page);
    await seedEmployerShiftDemo(page, {
      withAppliedApps: false,
      withPendingReview: false,
      availabilityBroadcasts: [
        {
          workerMlId: "ML-E2EA-RDR-AAA2",
          workerName: "Hidden Worker Alpha",
          selectedDates: [todayIso],
          basePincode: "670001",
          commuteRadius: 15,
        },
        {
          workerMlId: "ML-E2EB-RDR-AAA3",
          workerName: "Hidden Worker Beta",
          selectedDates: [rolling[2] ?? todayIso],
          basePincode: "670001",
          commuteRadius: 15,
        },
        {
          workerMlId: "ML-E2EC-RDR-AAA4",
          workerName: "Hidden Worker Gamma",
          selectedDates: [rolling[4] ?? todayIso],
          basePincode: "670001",
          commuteRadius: 0,
        },
      ],
    });

    await gotoHash(page, "/#/employer/shift");
    await expect(page.getByRole("button", { name: "New Shift" })).toBeVisible({ timeout: 20_000 });

    const radar = page.getByTestId("local-workers-radar-card");
    await expect(radar).toBeVisible();
    await expect(radar).not.toHaveClass(/wm-shiftLocalWorkersRadar--active/);
    await expect(radar).toContainText(/When workers in your area mark themselves as available/i);
    await expect(radar).not.toContainText(/workers ready to work this week/i);
    await expect(radar).not.toContainText("Hidden Worker Alpha");
    await expect(radar).not.toContainText("Hidden Worker Beta");
    await expect(radar).not.toContainText("Hidden Worker Gamma");
  });

  test("employee without base pincode: nearby search and featured stay empty", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await bootstrapEmployeeSession(page);
    await seedEmployeeNearbyFixture(page, { basePincode: "", commuteRadius: 15 });

    await gotoHash(page, "/#/employee/shift");
    await expect(page.getByTestId("shift-jobs-home-page")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("shift-control-preview-empty")).toBeVisible();
    await expect(page.getByText("No featured shifts nearby yet.")).toBeVisible();
    await expect(page.getByText("Exact Pin Shift")).toHaveCount(0);

    await gotoHash(page, "/#/employee/shift/search");
    await expect(page.getByTestId("shift-search-page")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("shift-search-empty")).toBeVisible();
    await expect(page.getByTestId(`shift-search-result-${EXACT_ID}`)).toHaveCount(0);
    await expect(page.getByTestId(`shift-search-result-${TOWN_ID}`)).toHaveCount(0);
    await expect(page.getByTestId(`shift-search-result-${FAR_ID}`)).toHaveCount(0);
  });

  test("exact pincode + 0 km always matches; other pins stay out", async ({ page }) => {
    test.setTimeout(90_000);
    await bootstrapEmployeeSession(page);
    await seedEmployeeNearbyFixture(page, { basePincode: "670001", commuteRadius: 0 });

    await gotoHash(page, "/#/employee/shift/search");
    await expect(page.getByTestId("shift-search-page")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId(`shift-search-result-${EXACT_ID}`)).toBeVisible();
    await expect(page.getByText("Exact Pin Shift").first()).toBeVisible();
    await expect(page.getByTestId(`shift-search-result-${TOWN_ID}`)).toHaveCount(0);
    await expect(page.getByTestId(`shift-search-result-${FAR_ID}`)).toHaveCount(0);
    await expect(page.getByText("Nearby Town Shift")).toHaveCount(0);
    await expect(page.getByText("Far Town Shift")).toHaveCount(0);

    await gotoHash(page, "/#/employee/shift");
    await expect(page.getByTestId("shift-jobs-home-page")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("shift-jobs-featured-preview")).toContainText("Exact Pin Shift");
    await expect(page.getByTestId("shift-control-preview-empty")).toHaveCount(0);
    await expect(page.getByText("Nearby Town Shift")).toHaveCount(0);
    await expect(page.getByText("Far Town Shift")).toHaveCount(0);
  });
});
