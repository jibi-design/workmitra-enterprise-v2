# Group Join GJ-3 — Auth Bridge (Job Mitra → Supabase)

> Companion: `TRACK_GROUP_JOIN_LIVE_NOTE.md`  
> Goal: Stop silent `not_authenticated` on `shift_ops` RPCs while Job Mitra UI shows logged-in.

**Status:** **IN REPO** (2026-07-26). Requires API env secrets (never paste into chat).

---

## How it works

1. Worker logs into Job Mitra (cookie session).
2. FE calls `POST /v1/jobmitra/auth/supabase-bridge` (CSRF + cookie).
3. API (service_role) ensures a Supabase Auth user for that JM email, mints session via magiclink `hashed_token` + `verifyOtp`.
4. FE `supabase.auth.setSession(...)`.
5. `shift_ops` RPCs see `auth.uid()` → `ensure_so_user` works.

```
JobMitraCookie → API supabase-bridge → Supabase JWT → shift_ops RPC
```

---

## Server env (API only — never in Vite)

| Var                         | Purpose                                                 |
| --------------------------- | ------------------------------------------------------- |
| `SUPABASE_URL`              | Project URL                                             |
| `SUPABASE_ANON_KEY`         | Used server-side only to exchange hashed_token          |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin createUser / generateLink — **never** in frontend |

Frontend still uses only `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`.

---

## Dev fallback (no auth backend)

When `VITE_AUTH_BACKEND_ENABLED` is not true:

1. Try Supabase Anonymous sign-in (must be enabled in Supabase Auth settings).
2. Else `VITE_SHIFT_OPS_DEV_EMAIL` + `VITE_SHIFT_OPS_DEV_PASSWORD` (local only).

---

## Files

- `server/modules/auth/supabaseBridge.service.ts`
- `server/modules/auth/auth.routes.ts` — `POST .../supabase-bridge`
- `src/features/shiftOps/services/authBridge.service.ts`
- Wired: identity/onboarding/approval/groupDailyOtp + authStore login/hydrate/logout

---

## Hard rules

- No `service_role` in browser / chat / git.
- Bridge route requires JM session.
- Logout clears Shift Ops Supabase session (`wm-shift-ops-auth` storage key).
