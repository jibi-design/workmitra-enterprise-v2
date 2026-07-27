# Group Join GJ-4 — Error UX + smoke

> Companion: `TRACK_GROUP_JOIN_LIVE_NOTE.md`  
> Depends on: GJ-1 SQL **APPLIED**, GJ-2 deep-link, GJ-3 bridge (env for live join)

**Status:** **DONE** (2026-07-26) — FE error panels + unit tests + SQL/UI smoke checklist.

---

## Error UX (in repo)

| Code                                    | Worker UI                                     |
| --------------------------------------- | --------------------------------------------- |
| `daily_otp_invalid` / missing           | Soft alert on join form                       |
| `group_link_invalid` / `invite_invalid` | Terminal `EnterpriseEmpty` fallback           |
| `group_deleted` / `group_inactive`      | Terminal fallback (peek can surface early)    |
| `dual_verification_required`            | Soft alert; stay on verify                    |
| `not_authenticated`                     | Soft alert; deep-link stash keeps return path |
| `bridge_not_configured`                 | Soft alert pointing at GJ-3 API env           |
| `not_site_manager`                      | Manager card mapped copy                      |

Files:

- `src/features/shiftOps/helpers/groupJoinErrors.ts` — `classifyGroupJoinError`
- `src/features/shiftOps/components/ShiftOpsJoinFallbackPanel.tsx`
- Invite + manager card wired

---

## Smoke checklist

### A. SQL (Dashboard — read-only)

1. Run `supabase/smoke/shift_ops_gj4_smoke.sql`
2. Expect: tables=2, fns=6; `join_site_via_group_link` mentions deleted/invalid/inactive flags true

### B. UI (manual — needs auth bridge env for full pass)

| #   | Step                                                               | Expect                                                     |
| --- | ------------------------------------------------------------------ | ---------------------------------------------------------- |
| 1   | Open `/#/employee/shift-ops/invite` with garbage token + daily OTP | Soft or terminal invalid-link UX                           |
| 2   | Manager `/#/employer/shift-ops/approvals` → Group access           | Errors mapped (not raw stack) if not manager / bridge down |
| 3   | Mint daily OTP + ensure static link (with bridge)                  | Token + 6-digit OTP shown once                             |
| 4   | Worker: wrong OTP                                                  | Soft “Wrong daily code”                                    |
| 5   | Worker: correct OTP after dual verify                              | Pending approval                                           |

Full live join may still fail until API has `SUPABASE_URL` + `SUPABASE_ANON_KEY` + `SUPABASE_SERVICE_ROLE_KEY` (GJ-3).

---

## Unit tests

```
npx vitest run src/tests/groupJoinErrors.test.ts
```

Expect PASS (classify terminal + bridge mapping).
