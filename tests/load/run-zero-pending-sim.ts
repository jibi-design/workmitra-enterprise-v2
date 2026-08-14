/**
 * Zero-pending live sim: 110 unique users, WS pulse, planner Postgres, Shift Ops lifecycle.
 */
import { WebSocket } from "ws";
import { getPool, closePool } from "../../server/db/pool.js";
import { provisionLab110, LAB_SCALE_DOMAIN, loadLabEnv } from "./provision-lab-110.js";

const API = process.env.WM_API_BASE?.trim() || "http://127.0.0.1:3001";
const PIN = "670001";
const report: {
  checks: Array<{ id: string; status: string; detail: unknown }>;
  load?: unknown;
} = { checks: [] };

function note(id: string, status: string, detail: unknown) {
  report.checks.push({ id, status, detail });
  console.log(`[${status}] ${id}`);
}

function parseCookies(res: Response): Record<string, string> {
  const jar: Record<string, string> = {};
  for (const line of res.headers.getSetCookie?.() ?? []) {
    const pair = line.split(";")[0] ?? "";
    const i = pair.indexOf("=");
    if (i > 0) jar[pair.slice(0, i).trim()] = pair.slice(i + 1).trim();
  }
  return jar;
}

function cookieHeader(jar: Record<string, string>): string {
  return Object.entries(jar)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

async function json(res: Response) {
  const text = await res.text();
  try {
    return { status: res.status, body: JSON.parse(text) as Record<string, unknown> };
  } catch {
    return { status: res.status, body: { raw: text.slice(0, 240) } };
  }
}

async function sessionFromMinted(rawSessionToken: string) {
  const jar: Record<string, string> = { wm_session: rawSessionToken };
  const csrfRes = await fetch(`${API}/v1/jobmitra/auth/csrf`, {
    headers: { Cookie: cookieHeader(jar) },
    signal: AbortSignal.timeout(12_000),
  });
  Object.assign(jar, parseCookies(csrfRes));
  const csrfBody = await json(csrfRes);
  const data = csrfBody.body.data as Record<string, unknown> | undefined;
  const csrf = (typeof data?.csrfToken === "string" ? data.csrfToken : jar.wm_csrf) ?? "";
  jar.wm_session = rawSessionToken;
  return { jar, csrf };
}

async function authed(
  session: { jar: Record<string, string>; csrf: string },
  method: string,
  path: string,
  payload?: unknown,
) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": session.csrf,
      Cookie: cookieHeader(session.jar),
    },
    body: payload ? JSON.stringify(payload) : undefined,
    signal: AbortSignal.timeout(35_000),
  });
  Object.assign(session.jar, parseCookies(res));
  if (session.jar.wm_csrf) session.csrf = session.jar.wm_csrf;
  return json(res);
}

function dataOf(body: Record<string, unknown>): Record<string, unknown> {
  return body.data && typeof body.data === "object" && !Array.isArray(body.data)
    ? (body.data as Record<string, unknown>)
    : {};
}

loadLabEnv();
const health = await json(
  await fetch(`${API}/v1/jobmitra/health`, { signal: AbortSignal.timeout(8000) }),
);
const healthBody = health.body as Record<string, unknown>;
const db = healthBody.db as Record<string, unknown> | undefined;
note("API-HEALTH", healthBody.ok && db?.ok ? "PASS" : "FAIL", { dbMs: db?.latencyMs });

const scale = await provisionLab110();
const dbCount = await getPool().query<{ n: string }>(
  `SELECT count(*)::text AS n FROM auth_users WHERE email LIKE $1`,
  [`%@${LAB_SCALE_DOMAIN}`],
);
note(
  "USERS-110",
  scale.employers.length === 10 &&
    scale.employees.length === 100 &&
    Number(dbCount.rows[0]?.n) >= 110
    ? "PASS"
    : "FAIL",
  { employers: scale.employers.length, employees: scale.employees.length, db: dbCount.rows[0]?.n },
);

const burstStarted = Date.now();
const burst = await Promise.all([
  ...scale.employers.map((u) =>
    fetch(`${API}/v1/jobmitra/employer/shift/posts`, {
      headers: { Cookie: `wm_session=${u.rawSessionToken}` },
      signal: AbortSignal.timeout(20_000),
    })
      .then(async (r) => ({ status: r.status, snippet: (await r.text()).slice(0, 80) }))
      .catch((e: Error) => ({ status: 0, snippet: e.message.slice(0, 80) })),
  ),
  ...scale.employees.map((u) =>
    fetch(`${API}/v1/jobmitra/employee/shift/nearby-posts`, {
      headers: { Cookie: `wm_session=${u.rawSessionToken}` },
      signal: AbortSignal.timeout(20_000),
    })
      .then(async (r) => ({ status: r.status, snippet: (await r.text()).slice(0, 80) }))
      .catch((e: Error) => ({ status: 0, snippet: e.message.slice(0, 80) })),
  ),
]);
const okBurst = burst.filter((r) => r.status >= 200 && r.status < 400).length;
const statusCounts: Record<string, number> = {};
for (const r of burst) statusCounts[String(r.status)] = (statusCounts[String(r.status)] ?? 0) + 1;
report.load = {
  uniqueAuthUsers: 110,
  ok: okBurst,
  failed: burst.length - okBurst,
  ms: Date.now() - burstStarted,
  statusCounts,
  sample: burst.find((r) => r.status < 200 || r.status >= 400)?.snippet,
};
note("LOAD-110-UNIQUE", okBurst === 110 ? "PASS" : okBurst >= 100 ? "WARN" : "FAIL", report.load);

const employer = await sessionFromMinted(scale.employers[0].rawSessionToken);
const employee = await sessionFromMinted(scale.employees[0].rawSessionToken);
note("AUTH-SCALE-SESSION", employer.csrf && employee.csrf ? "PASS" : "FAIL", {
  employerCsrf: Boolean(employer.csrf),
  employeeCsrf: Boolean(employee.csrf),
});

await authed(employer, "PUT", "/v1/jobmitra/employer/verification", {
  contactVerified: true,
  registrationNo: "LAB-REG-001",
});

const wsReady = await new Promise<{ socket: WebSocket; gotInbox: Promise<boolean> }>(
  (resolve, reject) => {
    const socket = new WebSocket(`${API.replace("http", "ws")}/v1/jobmitra/realtime/pulse`, {
      headers: { Cookie: cookieHeader(employee.jar) },
    });
    const gotInbox = new Promise<boolean>((resolveInbox) => {
      const timer = setTimeout(() => resolveInbox(false), 20_000);
      socket.on("message", (buf) => {
        const text = String(buf);
        if (text.includes("inbox")) {
          clearTimeout(timer);
          resolveInbox(true);
        }
      });
    });
    socket.on("open", () => resolve({ socket, gotInbox }));
    socket.on("error", () => reject(new Error("ws-connect-failed")));
    setTimeout(() => reject(new Error("ws-connect-timeout")), 8_000);
  },
).catch(() => null);

const start = new Date();
start.setDate(start.getDate() + 1);
start.setHours(8, 0, 0, 0);
const end = new Date(start);
end.setHours(18, 0, 0, 0);
const isoDay = start.toISOString().slice(0, 10);

const created = await authed(employer, "POST", "/v1/jobmitra/employer/shift/posts", {
  jobName: "Zero Pending Dock Loader",
  category: "Warehouse",
  vacancies: 1,
  startAt: start.toISOString(),
  endAt: end.toISOString(),
  status: "active",
  details: { locationPincode: PIN, pay: "12/hr" },
});
const post = dataOf(created.body).post as Record<string, unknown> | undefined;
const postId = typeof post?.id === "string" ? post.id : "";
note("SHIFT-POST", created.status < 300 && postId ? "PASS" : "FAIL", { status: created.status });

await authed(employee, "PUT", "/v1/jobmitra/employee/shift/availability", {
  selectedDates: [isoDay],
  city: "Area 1",
  basePincode: PIN,
  commuteRadius: 10,
});
const apply = await authed(
  employee,
  "POST",
  `/v1/jobmitra/employee/shift/posts/${postId}/apply`,
  {},
);
const application = dataOf(apply.body).application as Record<string, unknown> | undefined;
const appId = typeof application?.id === "string" ? application.id : "";
note("SHIFT-APPLY", apply.status < 300 && appId ? "PASS" : "FAIL", { status: apply.status });

await authed(
  employer,
  "POST",
  `/v1/jobmitra/employer/shift/posts/${postId}/applications/${appId}/status`,
  {
    status: "shortlisted",
  },
);
const confirm = await authed(
  employer,
  "POST",
  `/v1/jobmitra/employer/shift/posts/${postId}/applications/${appId}/confirm`,
  {},
);
const workspace = dataOf(confirm.body).workspace as Record<string, unknown> | undefined;
const workspaceId = typeof workspace?.id === "string" ? workspace.id : "";
note("SHIFT-CONFIRM", confirm.status < 300 && workspaceId ? "PASS" : "FAIL", {
  status: confirm.status,
});

const wsGotInbox = wsReady ? await wsReady.gotInbox : false;
wsReady?.socket.close();
note("PULSE-WS", wsGotInbox ? "PASS" : "FAIL", {
  gotInboxEvent: wsGotInbox,
  connected: Boolean(wsReady),
});

const tokenRes = await authed(
  employer,
  "POST",
  `/v1/jobmitra/employer/shift/workspaces/${workspaceId}/checkin-token`,
  {},
);
const qrToken = dataOf(tokenRes.body).qrToken;
note("QR-TOKEN", tokenRes.status < 300 && typeof qrToken === "string" ? "PASS" : "FAIL", {
  status: tokenRes.status,
});
const checkIn = await authed(
  employee,
  "POST",
  `/v1/jobmitra/employee/shift/workspaces/${workspaceId}/check-in`,
  { qrToken },
);
note("QR-CHECKIN", checkIn.status < 300 ? "PASS" : "FAIL", { status: checkIn.status });
await new Promise((r) => setTimeout(r, 400));
const att = await authed(
  employee,
  "GET",
  `/v1/jobmitra/employee/shift/workspaces/${workspaceId}/attendance`,
);
const openElapsed = dataOf(att.body).openElapsedMs;
note("ATTENDANCE-TIMER", typeof openElapsed === "number" && openElapsed >= 0 ? "PASS" : "FAIL", {
  openElapsedMs: openElapsed,
});
const checkOut = await authed(
  employee,
  "POST",
  `/v1/jobmitra/employee/shift/workspaces/${workspaceId}/check-out`,
  {},
);
note("QR-CHECKOUT", checkOut.status < 300 ? "PASS" : "FAIL", { status: checkOut.status });

const erReview = await authed(employer, "POST", "/v1/jobmitra/employer/shift/reviews", {
  workspaceId,
  rating: 5,
  body: "On time",
});
const eeReview = await authed(employee, "POST", "/v1/jobmitra/employee/shift/reviews", {
  workspaceId,
  rating: 4,
  body: "Clear site",
});
note("REVIEWS-BIDI", erReview.status < 300 && eeReview.status < 300 ? "PASS" : "FAIL", {
  er: erReview.status,
  ee: eeReview.status,
});

async function careerHire(title: string) {
  const job = await authed(employer, "POST", "/v1/jobmitra/employer/career/jobs", {
    title,
    description: "Zero pending career sim",
    status: "published",
    details: { locationPincode: PIN },
  });
  const jobId = (dataOf(job.body).post as Record<string, unknown> | undefined)?.id;
  if (typeof jobId !== "string") return { job, apply: job, hire: job, employmentId: "" };
  const cApply = await authed(
    employee,
    "POST",
    `/v1/jobmitra/employee/career/jobs/${jobId}/apply`,
    {
      cover_note: "Sim",
    },
  );
  const careerAppId = (dataOf(cApply.body).application as Record<string, unknown> | undefined)?.id;
  if (typeof careerAppId !== "string")
    return { job, apply: cApply, hire: cApply, employmentId: "" };
  await authed(
    employer,
    "POST",
    `/v1/jobmitra/employer/career/applications/${careerAppId}/shortlist`,
    {},
  );
  await authed(employer, "POST", `/v1/jobmitra/employer/career/applications/${careerAppId}/offer`, {
    terms: { role: title },
  });
  await authed(
    employee,
    "POST",
    `/v1/jobmitra/employee/career/applications/${careerAppId}/offer/accept`,
    {},
  );
  const hire = await authed(
    employer,
    "POST",
    `/v1/jobmitra/employer/career/applications/${careerAppId}/confirm-hire`,
    {},
  );
  const employmentId = (dataOf(hire.body).employment as Record<string, unknown> | undefined)?.id;
  return {
    job,
    apply: cApply,
    hire,
    employmentId: typeof employmentId === "string" ? employmentId : "",
  };
}

const a = await careerHire("Zero Pending Clerk A");
note("CAREER-HIRE-A", a.hire.status < 300 && a.employmentId ? "PASS" : "FAIL", {
  status: a.hire.status,
});
const resign = a.employmentId
  ? await authed(
      employee,
      "POST",
      `/v1/jobmitra/employee/career/employments/${a.employmentId}/resign`,
      {
        details: { reason: "sim" },
      },
    )
  : { status: 0, body: {} };
note("RESIGN", resign.status < 300 ? "PASS" : "FAIL", { status: resign.status });

const b = await careerHire("Zero Pending Clerk B");
note("CAREER-HIRE-B", b.hire.status < 300 && b.employmentId ? "PASS" : "FAIL", {
  status: b.hire.status,
});
const offboard = b.employmentId
  ? await authed(
      employer,
      "POST",
      `/v1/jobmitra/employer/career/employments/${b.employmentId}/offboard`,
      {
        details: { reason: "sim" },
      },
    )
  : { status: 0, body: {} };
note("OFFBOARD", offboard.status < 300 ? "PASS" : "FAIL", { status: offboard.status });

const planner = await authed(employer, "POST", "/v1/jobmitra/employer/planner/plans", {
  name: "Zero Pending Roster",
  status: "draft",
  details: { locationPincode: PIN },
});
const planId = (dataOf(planner.body).plan as Record<string, unknown> | undefined)?.id;
const dbPlan = planId
  ? await getPool().query<{ n: string }>(
      `SELECT count(*)::text AS n FROM planner_plans WHERE id = $1`,
      [planId],
    )
  : { rows: [{ n: "0" }] };
note("PLANNER-DB", planner.status < 300 && dbPlan.rows[0]?.n === "1" ? "PASS" : "FAIL", {
  status: planner.status,
  db: dbPlan.rows[0]?.n,
});

const failed = report.checks.filter((c) => c.status === "FAIL").length;
console.log(JSON.stringify({ failed, checks: report.checks, load: report.load }, null, 2));
await closePool();
process.exit(failed > 0 ? 1 : 0);
