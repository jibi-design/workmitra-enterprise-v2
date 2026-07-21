<!-- App name: WorkMitra / Job Mitra
File name: 03_PLANNER_HYBRID_A2_PHASE1_ROADMAP_v1.0.md
Full file path: C:\projects\WorkMitra_Enterprise_v2\workmitra-master-docs\planner\03_PLANNER_HYBRID_A2_PHASE1_ROADMAP_v1.0.md
Document version: v1.0 -->

# DEMAND PLANNER — HYBRID A2 PHASE-1 REFACTORING ROADMAP (v1.0)

## 1. Document Status

| Field                           | Value                                                                 |
| ------------------------------- | --------------------------------------------------------------------- |
| Status                          | **ACTIVE — Board-authorized phased implementation**                   |
| Strategy                        | **Hybrid A2** (Domain Split + Shift Execution Port)                   |
| Supersedes (execution coupling) | Phase-0 “hidden ShiftPost” source-of-truth for new plans (after P1.7) |
| Amends                          | Scope lock 02 — execution only via ports; Planner owns roster truth   |
| Zero Dead-End                   | Binding                                                               |
| Zero Soft-Wrappers              | Binding (`ShiftWorkspacePage` / `MyShift*` banned under `/planner/*`) |

---

## 2. Hybrid A2 Definition (Frozen)

```txt
Planner owns:  plan, slots, applications, assignments, milestones,
               wm_vault_planner_history_v1, RatingDomain "planner"
Shift retains: day-level check-in / punch ONLY via PlannerExecutionPort
```

Legal-entity ratings: reputation subject = `employerMlId` (agency/enterprise).  
`siteManagerId` / site = telemetry metadata only.

Milestone: 30-day epoch summaries → vault (`vaultFinalized: false`);  
finalize on offboarding or 60-day inactivity.

---

## 3. Strict Execution Model

1. Work **one section at a time**.
2. Section exit requires: clean build, no orphan imports, section tests PASS.
3. Progress report + user validation before next section production code.

---

## 4. Section Breakdown

| Section | Roadmap ID | Scope                                                    |
| ------- | ---------- | -------------------------------------------------------- |
| **S1**  | P1.0       | Route Contract & aliases + crawl gates                   |
| **S2**  | P1.1       | Schema v2 + migrator (`wm_employer_demand_plans_v1`)     |
| **S3**  | P1.2       | `PlannerExecutionPort` + import boundary                 |
| **S4**  | P1.3       | Native applications + employer batch approve             |
| **S5**  | P1.4       | `wm_vault_planner_history_v1` + aggregator               |
| **S6**  | P1.5       | `RatingDomain: "planner"` + entity-vs-agent              |
| **S7**  | P1.6       | Milestone engine + native workspace hub + roster console |
| **S8**  | P1.7       | Dual-write wind-down + full-circuit E2E                  |

---

## 5. Route Contract (Canonical)

### Employee

| Canonical path                                | Role                  | Notes               |
| --------------------------------------------- | --------------------- | ------------------- |
| `/employee/planner/home`                      | Hub                   | Existing            |
| `/employee/planner/discover`                  | Discovery             | Alias → browse (S1) |
| `/employee/planner/browse`                    | Discovery compat      | Kept                |
| `/employee/planner/projects/:planId`          | Detail                | Existing            |
| `/employee/planner/projects/:planId/apply`    | Availability matrix   | Existing            |
| `/employee/planner/applications`              | Applications          | Native (S4)         |
| `/employee/planner/applications/plan/:planId` | Batch summary         | Existing            |
| `/employee/planner/workspace`                 | Roster hub            | Native (S7)         |
| `/employee/planner/workspace/:workspaceId`    | Day/assignment detail | Native (S7)         |
| `/employee/planner/workspaces`                | List compat           | Redirect → hub (S7) |
| `/employee/planner/earnings`                  | Earnings              | Native (S7)         |

### Employer

| Canonical path                            | Role                | Notes            |
| ----------------------------------------- | ------------------- | ---------------- |
| `/employer/planner/home`                  | Hub                 | Existing         |
| `/employer/planner/plans`                 | Plan list           | Existing         |
| `/employer/planner/create`                | Wizard              | Alias → new (S1) |
| `/employer/planner/new`                   | Wizard compat       | Kept             |
| `/employer/planner/plans/:planId`         | Detail              | Existing         |
| `/employer/planner/plans/:planId/finance` | Finance placeholder | Back → detail    |
| `/employer/planner/applications`          | Batch approval      | Native (S4)      |
| `/employer/planner/roster`                | Roster index        | Native (S7)      |
| `/employer/planner/roster/:planId`        | Roster console      | Native (S7)      |

### Status → nextRoute registry

Lived in code: `src/features/shared/planner/plannerRouteContract.ts`.

---

## 6. Zero Dead-End Acceptance (Every Section)

- [ ] Every new/changed route has Back + empty-state CTA
- [ ] No new soft-wrappers introduced
- [ ] Modals: primary + dismiss with known route
- [ ] Status tags map to `nextAction` / `nextRoute` where applicable
- [ ] Section Playwright/unit tests PASS
- [ ] `npm run build` PASS

---

## 7. Section status

| Section                                             | Status                    |
| --------------------------------------------------- | ------------------------- |
| **S1** P1.0 Route Contract                          | **COMPLETE** (2026-07-21) |
| **S2** P1.1 Schema v2                               | **COMPLETE** (2026-07-21) |
| **S3** P1.2 Execution Port                          | **COMPLETE** (2026-07-21) |
| **S4** P1.3 Native applications + batch approve     | **COMPLETE** (2026-07-21) |
| **S5** P1.4 Planner vault history + aggregator      | **COMPLETE** (2026-07-21) |
| **S6** P1.5 RatingDomain planner + entity-vs-agent  | **COMPLETE** (2026-07-21) |
| **S7** P1.6 Milestone + workspace hub + roster      | **COMPLETE** (2026-07-21) |
| **S8** P1.7 Dual-write wind-down + full-circuit E2E | **COMPLETE** (2026-07-21) |

### Section 3 exit criteria (P1.2) — DONE

- `PlannerExecutionPort` + Shift adapter for daily check-in
- Planner-owned check-in ledger `wm_planner_daily_checkins_v1`
- `plannerLegacyShiftBridge` anti-corruption surface for dual-write helpers
- ESLint + Vitest boundary: no direct `shiftJobs` imports in planner (soft-wrap UI debt allowlisted until S4/S7)
- Workspace hub check-in stays on `/employee/planner/workspace`
- Vitest + Playwright + `npm run build` PASS

### Section 4 exit criteria (P1.3) — DONE

- Native employee `/planner/applications` presenters (no `MyShiftApplications*` soft-wrap)
- Employer Batch Approval Engine at `/employer/planner/applications` (bulk approve/reject by `planApplyBatchId`)
- Approve nextRoute = `/employer/planner/roster` (not Shift confirm screens)
- Soft-wrap allowlist: Applications page removed (Workspaces/Earnings/Browse remain until S7)
- Vitest batch service + Playwright batch circuit + `npm run build` PASS

### Section 5 exit criteria (P1.4) — DONE

- `wm_vault_planner_history_v1` storage with idempotent `(planId, employeeMlId, epochIndex)` upsert
- `vaultPlannerAggregator` + `getVaultSectionData` branch (`source: "planner"`)
- Board rule: planner ratings do **not** dilute shift/career overallRating
- Service façade: `recordPlannerEpochInVault` / `syncPlannerVaultRatings` / `recordPlannerOffboardInVault`
- Plan cancel wires `exitType: "plan_cancelled"` finalize for confirmed workers
- Vitest + Playwright vault surface + `npm run build` PASS

### Section 6 exit criteria (P1.5) — DONE

- `RatingDomain` includes `"planner"` with optional `RatingPlannerMeta`
- Reputation subject = legal entity `employerMlId`; `siteManagerId` telemetry-only (guarded)
- Public summaries (`getWorkerSummary` / `getEmployerSummary`) exclude planner; domain-scoped getters added
- `submitPlannerEmployerRating` / `submitPlannerWorkerRating` sync `wm_vault_planner_history_v1`
- Modals accept `domain: "planner"` + `plannerMeta`
- Vitest + Playwright isolation + `npm run build` PASS

### Section 7 exit criteria (P1.6) — DONE

- Milestone engine: plan-local epoch windows (`epochDays`), idempotent vault upsert, 60-day inactivity finalize
- Native employee workspace hub + day detail (no `ShiftWorkspacePage` under `/planner/*`)
- `/workspaces` redirects to hub; earnings + browse soft-wraps cleared
- Native employer roster index + plan console (coverage + milestone rollups)
- Soft-wrap allowlist empty; Vitest + Playwright + `npm run build` PASS

### Section 8 exit criteria (P1.7) — DONE

- New plan publish does **not** create hidden ShiftPosts (`slot.postId` absent; `slotId` retained)
- Public index keyed by plan slots (`slotIdsByDate` / `payByDate` / `workersByDate`); `postIdsByDate` legacy-only
- Pick & Choose + batch approve work via planner-native apply targets when no child post
- Legacy plans with existing `postId`s still readable/confirmable/cancellable via bridge
- Full-circuit E2E: publish → Mega Card → apply → batch approve → roster → check-in
- `gig-planner-circuit` asserts zero child posts for new publishes
- Vitest wind-down gate + Playwright + `npm run build` PASS

---

## 8. Version History

| Version | Date       | Summary                                            |
| ------- | ---------- | -------------------------------------------------- |
| v1.0    | 2026-07-21 | Board Hybrid A2 + Zero Dead-End Phase-1 roadmap    |
| v1.1    | 2026-07-21 | S1–S8 Phase-1 complete (P1.7 dual-write wind-down) |
