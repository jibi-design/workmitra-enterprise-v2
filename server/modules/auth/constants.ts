/** Job Mitra product scope for auth_user_roles — separates future HomeFix/Admin platforms. */
export const PRODUCT_SCOPE_JOBMITRA = "jobmitra";

export const SESSION_ABSOLUTE_TTL_SEC = Number(
  process.env.WM_SESSION_ABSOLUTE_TTL_SEC ?? 7 * 24 * 60 * 60,
);

export const SESSION_IDLE_TTL_SEC = Number(process.env.WM_SESSION_IDLE_TTL_SEC ?? 24 * 60 * 60);

export const LOGIN_RATE_LIMIT_MAX = Number(process.env.WM_LOGIN_RATE_LIMIT_MAX ?? 5);

export const LOGIN_RATE_LIMIT_WINDOW_SEC = Number(
  process.env.WM_LOGIN_RATE_LIMIT_WINDOW_SEC ?? 15 * 60,
);

export const ACCOUNT_LOCK_THRESHOLD = Number(process.env.WM_ACCOUNT_LOCK_THRESHOLD ?? 10);

export const ACCOUNT_LOCK_WINDOW_SEC = Number(process.env.WM_ACCOUNT_LOCK_WINDOW_SEC ?? 60 * 60);

export const ACCOUNT_LOCK_DURATION_SEC = Number(
  process.env.WM_ACCOUNT_LOCK_DURATION_SEC ?? 24 * 60 * 60,
);
