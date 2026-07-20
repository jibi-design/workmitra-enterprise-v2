<!-- Inherits: 00_MASTER_ENTERPRISE_AUDIT_TEMPLATE_v1.0.md -->

# SHIFT JOBS — ENTERPRISE AUDIT v1.0

## 1. Audit header

| Field              | Value                                                                                                                                                            |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Domain**         | Shift Jobs (Employer + Employee — never Career Jobs)                                                                                                             |
| **Audit version**  | v1.0                                                                                                                                                             |
| **Audit date**     | 2026-07-04                                                                                                                                                       |
| **Auditor**        | Cursor Agent (code + doc evidence)                                                                                                                               |
| **Evidence**       | `src/features/**/shiftJobs/**`, `tests/e2e/shift-full-circuit.spec.ts`, `availability-phase1.spec.ts`, `shared/02_SHIFT_JOBS_ARCHITECTURE_FINAL_POSTING_SAFE.md` |
| **Overall status** | **PARTIAL**                                                                                                                                                      |
| **Domain grade**   | **B+**                                                                                                                                                           |
| **Backend ready**  | **BLOCKED** (pending Data Ownership PASS)                                                                                                                        |

---

## 2. Executive summary

Shift Jobs is the **most mature launch-visible job domain** after Planner. Full circuit E2E passes: apply → shortlist → confirm → workspace → complete → rating → vault history.

**PARTIAL because:** no post reopen; draft auto-save is manual not continuous; Phase-0 localStorage only; negative paths (withdraw, replace, direct invite) lack E2E evidence.

---

## 3. Architecture Health (Shift slice)

| Area              | Current | Target | Notes                         |
| ----------------- | ------- | ------ | ----------------------------- |
| UI / UX           | 90%     | 95%    | Strong dashboard + workspace  |
| Business rules    | 88%     | 95%    | Stage machine clear           |
| Documentation     | 78%     | 95%    | Architecture doc + this audit |
| Backend readiness | 14%     | 100%   | localStorage bridge pattern   |
| Security          | 42%     | 90%    | Doc-access snapshot only      |
| Automation        | 72%     | 85%    | Full circuit E2E              |
| Testing           | 90%     | 95%    | 1 full + availability tests   |
| Performance       | 82%     | 90%    | Acceptable Phase-0            |

**Shift domain health: 82%**

---

## 4. Layer 1 — Workflow Continuity (summary)

| Screen                  | Dead-end?                  | Status      |
| ----------------------- | -------------------------- | ----------- |
| Employer create wizard  | No — draft save/resume     | **PASS**    |
| Employer post dashboard | No — tab actions + notices | **PASS**    |
| Employee search / apply | Apply may navigate away    | **PARTIAL** |
| Employee workspace      | Exit flow exists           | **PASS**    |
| Employer workspace      | Complete + broadcast       | **PASS**    |

**Gap:** Closed/cancelled post **cannot reopen** — employer must create new post.

---

## 5. Layer 2 — Exception Flow (summary)

| Scenario                   | Status                         |
| -------------------------- | ------------------------------ |
| Vacancy full on confirm    | **PASS** — guarded             |
| Duplicate apply            | **PASS**                       |
| Replace confirmed worker   | **PASS** — code exists; no E2E |
| Direct invite bypass apply | **PASS** — code exists; no E2E |
| Employee withdraw          | **PASS** — code exists         |
| Post expiry auto-close     | **PASS** — `checkExpiredPosts` |
| Network / server timeout   | **N/A** Phase-0                |
| Reopen cancelled post      | **FAIL** — not implemented     |

---

## 6. Layer 3 — Permission Matrix (Phase-0)

| Action                      | Employee | Employer      | Status  |
| --------------------------- | -------- | ------------- | ------- |
| Search / apply              | ✅       | —             | PASS    |
| Pipeline actions            | —        | ✅            | PASS    |
| Confirm / replace           | —        | ✅            | PASS    |
| Workspace broadcast         | —        | ✅            | PASS    |
| Document access             | —        | Snapshot only | PARTIAL |
| Edit post with applications | —        | Blocked       | PASS    |

---

## 7. Layer 4 — Lifecycle

**Post:** `active` → `completed` | `cancelled` (no reopen)

**Application:** `applied` → `shortlisted` | `waiting` → `confirmed` → `withdrawn` | `replaced` | `exited`

**Workspace:** `active` | `upcoming` → `completed` | `left` | `replaced`

Evidence: `employerShift.types.ts`, `employerShift.candidateActions.ts`

**Status: PASS** (demo scope) · **Reopen: FAIL**

---

## 8. Layer 5 — Data Ownership

| Entity       | Writer (Phase-0)                 | Storage key                             | Backend owner (proposed) | Status  |
| ------------ | -------------------------------- | --------------------------------------- | ------------------------ | ------- |
| ShiftPost    | Employer                         | `wm_employer_shift_posts_v1`            | Company                  | PARTIAL |
| Application  | Employee create; Employer status | `wm_employee_shift_applications_v1`     | Company + Employee       | PARTIAL |
| Workspace    | Employer create; both use        | `wm_employee_shift_workspaces_v1`       | Company                  | PARTIAL |
| Draft        | Employer                         | `wm_employer_shift_post_drafts_v1`      | Company                  | PARTIAL |
| Availability | Employee                         | `wm_employee_availability_broadcast_v1` | Employee                 | PARTIAL |

Cross-role writes via `employerShift.employeeBridge.ts` — **backend must replace with API**.

**Ownership layer: PARTIAL**

---

## 9. Layers 6–8 (summary)

| Layer              | Status           | Key note                                               |
| ------------------ | ---------------- | ------------------------------------------------------ |
| Offline / Recovery | PARTIAL          | localStorage; close/reopen not evidenced               |
| Automation         | PARTIAL          | E2E happy path; invite/replace manual                  |
| AI Readiness       | READY for design | Match quality, availability suggest, fill-rate predict |

---

## 10. P0 blockers (Shift-specific)

| #   | Blocker                                            | Status    |
| --- | -------------------------------------------------- | --------- |
| 1   | Cross-domain ownership map (with Employment/Vault) | OPEN      |
| 2   | Reopen post policy — build or explicitly reject    | OPEN      |
| 3   | Draft continuous auto-save policy                  | OPEN (PO) |

---

## 11. E2E evidence

| Test         | Path                                         |
| ------------ | -------------------------------------------- |
| Full circuit | `tests/e2e/shift-full-circuit.spec.ts`       |
| Availability | `tests/e2e/availability-phase1.spec.ts`      |
| Helpers      | `tests/e2e/helpers/shift-circuit.helpers.ts` |

---

## 12. Backend gate

| Gate      | Result      |
| --------- | ----------- |
| Ownership | PARTIAL     |
| Lifecycle | PASS (demo) |
| Workflow  | PARTIAL     |

**Shift backend = BLOCKED** until Data Ownership Audit PASS.

---

## 13. Final Lock

| PO sign | ☐   |
| ------- | --- |

**Audit status: PARTIAL v1.0 — 2026-07-04**

---

## 14. Implementation Sync Appendix (Evidence: 2026-07-16)

Full inventory added to `shared/02_SHIFT_JOBS_ARCHITECTURE_FINAL_POSTING_SAFE (1).md` **§1.30**.

| Area                                              | Implemented status                                                                                                                                                      | Doc prior gap                             |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Routes `/employee/shift/**`, `/employer/shift/**` | **IMPLEMENTED** — **19 core** routes in `routePaths.ts` (§1.30.3); **4 legacy** compatibility routes excluded (§1.30.3a); **1** redirect (`employerShiftDemandPlanner`) | Route table scattered; §1.30 consolidates |
| Application statuses                              | 8 values (`applied`…`exited`)                                                                                                                                           | §1.10 target list differed                |
| Post statuses                                     | `active`, `completed`, `cancelled`                                                                                                                                      | §1.10 had 15+ target post states          |
| Availability broadcast + pulse                    | **IMPLEMENTED**                                                                                                                                                         | Under-documented                          |
| Direct invite loop                                | **IMPLEMENTED**                                                                                                                                                         | Under-documented                          |
| Templates + drafts                                | **IMPLEMENTED**                                                                                                                                                         | Partially in §1.27                        |
| Earnings page                                     | **IMPLEMENTED** (local compute)                                                                                                                                         | Missing from audit                        |
| Payment stages                                    | **NOT CONNECTED**                                                                                                                                                       | UI only — now labelled                    |
| Backend API                                       | **NOT IMPLEMENTED**                                                                                                                                                     | Unchanged                                 |

**E2E:** `shift-full-circuit.spec.ts`, `availability-phase1.spec.ts` — still **Yes verified**.

**Shift → Employment:** **NOT IMPLEMENTED** — confirmed no employment writes from shift code.

**Audit refresh verdict:** Documentation now aligned with code for Phase-0 Shift scope. Backend remains **BLOCKED**.
