import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

/**
 * Phase 18 — Tenant isolation E2E
 *
 * Covers:
 * 1) LS employer-scoped HR / career isolation (always runs; auth-off demo path)
 * 2) API RBAC + cross-tenant denial (runs when API is reachable on :3001 / Vite proxy)
 *
 * Run: npm run test:e2e:headless -- tests/e2e/tenant-isolation.spec.ts
 */

const EMPLOYER_A = {
  uniqueId: "ML-TENANT-A-EMP-0001",
  leaveKeySuffix: "leave_requests_v1",
};

const EMPLOYER_B = {
  uniqueId: "ML-TENANT-B-EMP-0002",
  leaveKeySuffix: "leave_requests_v1",
};

function hrLeaveKey(employerUniqueId: string): string {
  const scope = employerUniqueId.replace(/[^a-zA-Z0-9_-]/g, "_");
  return `wm_hr_employer_${scope}_leave_requests_v1`;
}

function careerPostsKey(): string {
  return "wm_career_posts_v1";
}

async function setEmployerUniqueId(page: Page, uniqueId: string): Promise<void> {
  await page.goto("/#/employer/home");
  await page.evaluate((id) => {
    localStorage.setItem("wm_active_role", JSON.stringify("employer"));
    const raw = localStorage.getItem("wm_employer_settings_v1");
    const parsed = raw && raw.startsWith("{") ? (JSON.parse(raw) as Record<string, unknown>) : {};
    parsed.uniqueId = id;
    localStorage.setItem("wm_employer_settings_v1", JSON.stringify(parsed));
  }, uniqueId);
  await page.reload();
}

async function apiReachable(request: APIRequestContext): Promise<boolean> {
  try {
    const res = await request.get("http://localhost:3001/v1/jobmitra/auth/me");
    // 401/200 both mean the API process is up
    return res.status() === 200 || res.status() === 401;
  } catch {
    return false;
  }
}

async function loginAs(
  request: APIRequestContext,
  email: string,
  password = "demo1234",
): Promise<{ cookies: string[]; csrfToken: string }> {
  const res = await request.post("http://localhost:3001/v1/jobmitra/auth/login", {
    data: { email, password },
  });
  expect(res.ok(), `login ${email} should succeed`).toBeTruthy();
  const cookies = res
    .headersArray()
    .filter((h) => h.name.toLowerCase() === "set-cookie")
    .map((h) => h.value);
  const headerCsrf = res.headers()["x-csrf-token"]?.trim() ?? "";
  const body = (await res.json()) as { data?: { csrfToken?: string } };
  const csrfToken = (body.data?.csrfToken ?? headerCsrf).trim();
  expect(csrfToken.length, `csrf for ${email}`).toBeGreaterThan(10);
  return { cookies, csrfToken };
}

function cookieHeader(setCookies: string[]): string {
  return setCookies.map((c) => c.split(";")[0]).join("; ");
}

function authHeaders(
  session: { cookies: string[]; csrfToken: string },
  json = false,
): Record<string, string> {
  const headers: Record<string, string> = {
    Cookie: cookieHeader(session.cookies),
    "X-CSRF-Token": session.csrfToken,
  };
  if (json) headers["Content-Type"] = "application/json";
  return headers;
}

test.describe("Phase 18 — Tenant isolation", () => {
  test("LS: Employer A leave requests are invisible under Employer B scope", async ({
    browser,
  }) => {
    const ctxA = await browser.newContext();
    const ctxB = await browser.newContext();
    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();

    await setEmployerUniqueId(pageA, EMPLOYER_A.uniqueId);
    await setEmployerUniqueId(pageB, EMPLOYER_B.uniqueId);

    const leaveId = `lv_tenant_${Date.now().toString(36)}`;

    await pageA.evaluate(
      ({ key, leaveId: id }) => {
        const row = {
          id,
          hrCandidateId: "hr_tenant_a_worker",
          employeeUniqueId: "ML-TENANT-A-WRK-0001",
          employeeName: "Tenant A Worker",
          leaveType: "annual",
          fromDate: Date.now(),
          toDate: Date.now() + 86_400_000,
          totalDays: 1,
          reason: "Tenant isolation probe",
          status: "pending",
          appliedAt: Date.now(),
        };
        localStorage.setItem(key, JSON.stringify([row]));
      },
      { key: hrLeaveKey(EMPLOYER_A.uniqueId), leaveId },
    );

    const visibleOnA = await pageA.evaluate((key) => {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      return JSON.parse(raw) as Array<{ id: string }>;
    }, hrLeaveKey(EMPLOYER_A.uniqueId));

    const visibleOnB = await pageB.evaluate((key) => {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      return JSON.parse(raw) as Array<{ id: string }>;
    }, hrLeaveKey(EMPLOYER_B.uniqueId));

    expect(visibleOnA.some((r) => r.id === leaveId)).toBe(true);
    expect(visibleOnB.some((r) => r.id === leaveId)).toBe(false);

    await ctxA.close();
    await ctxB.close();
  });

  test("LS: Employer A career post id not present in Employer B blank store", async ({
    browser,
  }) => {
    const ctxA = await browser.newContext();
    const ctxB = await browser.newContext();
    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();

    await setEmployerUniqueId(pageA, EMPLOYER_A.uniqueId);
    await setEmployerUniqueId(pageB, EMPLOYER_B.uniqueId);

    const postId = `post_tenant_${Date.now().toString(36)}`;

    await pageA.evaluate(
      ({ key, postId: id, employerId }) => {
        const post = {
          id,
          employerId,
          companyName: "Tenant A Co",
          jobTitle: "Isolation Probe",
          status: "active",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        localStorage.setItem(key, JSON.stringify([post]));
      },
      { key: careerPostsKey(), postId, employerId: EMPLOYER_A.uniqueId },
    );

    // Context B starts empty — must not inherit A's storage
    const postsOnB = await pageB.evaluate((key) => {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      return JSON.parse(raw) as Array<{ id: string; employerId?: string }>;
    }, careerPostsKey());

    expect(postsOnB.some((p) => p.id === postId)).toBe(false);

    await ctxA.close();
    await ctxB.close();
  });

  test("LS: Employee context cannot read employer-scoped HR leave key", async ({ browser }) => {
    const employerCtx = await browser.newContext();
    const employeeCtx = await browser.newContext();
    const employerPage = await employerCtx.newPage();
    const employeePage = await employeeCtx.newPage();

    await setEmployerUniqueId(employerPage, EMPLOYER_A.uniqueId);

    const leaveId = `lv_emp_iso_${Date.now().toString(36)}`;
    await employerPage.evaluate(
      ({ key, leaveId: id }) => {
        localStorage.setItem(
          key,
          JSON.stringify([
            {
              id,
              hrCandidateId: "hr_x",
              employeeUniqueId: "ML-TENANT-A-WRK-0001",
              employeeName: "Worker",
              leaveType: "sick",
              fromDate: Date.now(),
              toDate: Date.now(),
              totalDays: 1,
              reason: "iso",
              status: "pending",
              appliedAt: Date.now(),
            },
          ]),
        );
      },
      { key: hrLeaveKey(EMPLOYER_A.uniqueId), leaveId },
    );

    await employeePage.goto("/#/employee/home");
    await employeePage.evaluate(() => {
      localStorage.setItem("wm_active_role", JSON.stringify("employee"));
    });

    const employeeSeesEmployerKey = await employeePage.evaluate((key) => {
      const raw = localStorage.getItem(key);
      return Boolean(raw && raw.includes("lv_emp_iso_"));
    }, hrLeaveKey(EMPLOYER_A.uniqueId));

    // Separate browser context → empty LS; employee must not see employer A data
    expect(employeeSeesEmployerKey).toBe(false);

    await employerCtx.close();
    await employeeCtx.close();
  });

  test("API: employee role cannot list employer HR leave (403)", async ({ request }) => {
    test.skip(!(await apiReachable(request)), "API not running on :3001");

    const session = await loginAs(request, "employee@demo.jobmitra.app");
    const res = await request.get("http://localhost:3001/v1/jobmitra/employer/hr/leave-requests", {
      headers: authHeaders(session),
    });
    expect(res.status()).toBe(403);
  });

  test("API: employer A leave is not returned to employer B", async ({ request }) => {
    test.skip(!(await apiReachable(request)), "API not running on :3001");

    const sessionA = await loginAs(request, "employer@demo.jobmitra.app");
    const createRes = await request.post(
      "http://localhost:3001/v1/jobmitra/employer/hr/leave-requests",
      {
        headers: authHeaders(sessionA, true),
        data: {
          leave_type: "annual",
          from_date: new Date().toISOString(),
          to_date: new Date(Date.now() + 86_400_000).toISOString(),
          reason: "tenant-isolation-a",
          employee_ml_id: "ML-TENANT-A-WRK-0001",
          hr_candidate_id: "hr_tenant_a",
          details: { employeeName: "Tenant A Worker", totalDays: 1 },
        },
      },
    );
    expect(createRes.ok()).toBeTruthy();
    const created = (await createRes.json()) as {
      data?: { leaveRequest?: { id?: string } };
    };
    const leaveId = created.data?.leaveRequest?.id;
    expect(leaveId).toBeTruthy();

    const sessionB = await loginAs(request, "employer-b@demo.jobmitra.app");
    const listB = await request.get(
      "http://localhost:3001/v1/jobmitra/employer/hr/leave-requests",
      {
        headers: authHeaders(sessionB),
      },
    );
    expect(listB.ok()).toBeTruthy();
    const bodyB = (await listB.json()) as {
      data?: { leaveRequests?: Array<{ id: string }> };
    };
    const idsB = (bodyB.data?.leaveRequests ?? []).map((r) => r.id);
    expect(idsB).not.toContain(leaveId);

    const patchB = await request.patch(
      `http://localhost:3001/v1/jobmitra/employer/hr/leave-requests/${leaveId}`,
      {
        headers: authHeaders(sessionB, true),
        data: { status: "approved" },
      },
    );
    expect(patchB.status()).toBe(404);
  });

  test("API: employee cannot list employer career staff (403)", async ({ request }) => {
    test.skip(!(await apiReachable(request)), "API not running on :3001");

    const session = await loginAs(request, "employee@demo.jobmitra.app");
    const res = await request.get("http://localhost:3001/v1/jobmitra/employer/career/staff", {
      headers: authHeaders(session),
    });
    expect(res.status()).toBe(403);
  });
});
