<!-- Inherits: 00_MASTER_ENTERPRISE_AUDIT_TEMPLATE_v1.0.md -->

# EMPLOYMENT LIFECYCLE — ENTERPRISE AUDIT v1.0

## 1. Audit header

| Field              | Value                                                                                                                              |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Domain**         | Employment Lifecycle (Career bridge — **not** Shift Jobs)                                                                          |
| **Audit version**  | v1.0                                                                                                                               |
| **Audit date**     | 2026-07-04                                                                                                                         |
| **Auditor**        | Cursor Agent                                                                                                                       |
| **Evidence**       | `src/shared/employment/**`, `src/features/employee/employment/**`, `careerHireActivationService.ts`, `career-full-circuit.spec.ts` |
| **Overall status** | **PARTIAL**                                                                                                                        |
| **Domain grade**   | **C+**                                                                                                                             |
| **Backend ready**  | **BLOCKED**                                                                                                                        |

---

## 2. Executive summary

Employment Lifecycle connects **Career hire** to ongoing work (diary, resignation, ratings, completed records). Shift Jobs **does not** create employment records — only vault shift history.

**Critical gap:** **Two parallel storage systems** for the same concept:

- `wm_career_employment_v1` (shared — target SoT)
- `wm_employment_lifecycle_v1` (legacy — still used on detail page)

Career hire writes **four stores** at once. This domain **cannot PASS** until unified.

---

## 3. Architecture Health (Employment slice)

| Area              | Current | Target | Notes                             |
| ----------------- | ------- | ------ | --------------------------------- |
| UI / UX           | 82%     | 90%    | Detail page, diary, resignation   |
| Business rules    | 68%     | 95%    | Dual schema; hire trigger unclear |
| Documentation     | 65%     | 95%    | Doc 06 exists; audit now filed    |
| Backend readiness | 10%     | 100%   | Fragmented local writes           |
| Security          | 35%     | 90%    | Local only                        |
| Automation        | 55%     | 85%    | Partial E2E in career circuit     |
| Testing           | 70%     | 90%    | Resign step in E2E only           |
| Performance       | 80%     | 90%    | OK Phase-0                        |

**Employment domain health: 71%**

---

## 4. Lifecycle states (dual schema — P0 issue)

**Shared (`employmentTypes.ts`):**  
`selected` → `working` → `notice` | `resigned` → `completed`

**Legacy (`employmentLifecycle.storage.ts`):**  
`joining_pending` → `active` | `probation` → `resignation_pending` | `notice_period` → `exited`

**Mapper:** `careerEmploymentStatusMap.ts`, `careerEmploymentLifecycleAdapter.ts`

**Status: FAIL** — must converge to one canonical model before backend.

---

## 5. Key routes & pages

| Route                               | Page                                     | Storage used           |
| ----------------------------------- | ---------------------------------------- | ---------------------- |
| `/employee/employment/:id`          | `EmployeeEmploymentDetailPage.tsx`       | **Legacy** lifecycle   |
| Career workspace employment section | `CareerWorkspaceEmploymentSection.tsx`   | **Shared** employment  |
| `/employer/my-staff/:id`            | `EmployerStaffDetailPage.tsx`            | `wm_employer_staff_v1` |
| Completed records                   | `EmployeeCareerCompletedRecordsPage.tsx` | Legacy + shared reads  |

**Workflow continuity: PARTIAL** — different pages may show different truth.

---

## 6. Shift vs Career bridge

| Path                               | Creates employment?                       |
| ---------------------------------- | ----------------------------------------- |
| Career hire (`activateCareerHire`) | **Yes** — 4 stores                        |
| Shift workspace complete           | **No** — `wm_vault_shift_history_v1` only |
| Offer accept (HR storage)          | Partial — separate from career stage      |

---

## 7. Data Ownership

| Entity                     | Keys                                  | Owner (proposed)   | Status             |
| -------------------------- | ------------------------------------- | ------------------ | ------------------ |
| Career employment (shared) | `wm_career_employment_v1`             | Employee + Company | PARTIAL            |
| Lifecycle (legacy)         | `wm_employment_lifecycle_v1`          | Employee           | **FAIL** duplicate |
| Staff mirror               | `wm_employer_staff_v1`                | Company            | PARTIAL            |
| Work diary                 | `wm_work_diary_v1`                    | Employee           | PARTIAL            |
| Primary employment pointer | `wm_primary_current_employment_id_v1` | Employee           | PARTIAL            |

---

## 8. Exception & recovery

| Scenario                     | Status                              |
| ---------------------------- | ----------------------------------- |
| Resignation submit/withdraw  | PASS — code exists                  |
| Duplicate hire records       | PARTIAL — idempotent guards partial |
| Close app during resignation | PARTIAL — not evidenced             |
| Employee inactive            | FAIL — not implemented              |

---

## 9. E2E evidence

`tests/e2e/career-full-circuit.spec.ts` — employment navigation + resignation + vault career history.

---

## 10. P0 blockers

| #   | Blocker                                                   | Status   |
| --- | --------------------------------------------------------- | -------- |
| 1   | Single employment SoT (merge legacy → shared)             | **OPEN** |
| 2   | Career hiring source of truth (linked DEC-006)            | **OPEN** |
| 3   | Remove temporary `careerEmploymentSideSyncService` bridge | **OPEN** |

---

## 11. Backend gate

**Employment backend = BLOCKED** — Ownership **FAIL**

---

## 12. Final Lock

| PO sign | ☐ |

**Audit status: PARTIAL v1.0 — 2026-07-04**
