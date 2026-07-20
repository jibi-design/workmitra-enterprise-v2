<!-- App name: WorkMitra / Job Mitra
File name: 02_CAREER_OFFICIAL_HIRING_FLOW_V2.md
Full file path: C:\projects\WorkMitra_Enterprise_v2\workmitra-master-docs\second-update\02_CAREER_OFFICIAL_HIRING_FLOW_V2.md -->

# CAREER JOBS — OFFICIAL HIRING FLOW SOURCE OF TRUTH (V2)

## 1. Document Status

| Field      | Value                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------- |
| Status     | **☑ APPROVED — Product Owner locked (2026-07-04)**                                          |
| Domain     | **Career Jobs + Employment Lifecycle bridge** (never Shift Jobs)                            |
| Priority   | **P0 before backend/auth** (per `architecture-audits/24_...`)                               |
| Build gate | **Section 5 LOCKED — Backend Architecture may reference; V2 coding after Architecture doc** |

## 2. Inherits From

- `architecture/01_CORE_MASTER_TRUTH.md`
- `shared/03_CAREER_JOBS_ARCHITECTURE_FINAL_POSTING_SAFE.md`
- `shared/06_EMPLOYMENT_LIFECYCLE_FINAL_NUMBERED.md`
- `architecture-audits/24_ADVANCED_FEATURE_GAP_AUDIT_AND_BACKEND_READY_LIST_FINAL_LOCKED.md`
- `second-update/00_SECOND_UPDATE_INDEX_AND_WORKFLOW.md`

## 3. Why This Is Second Update (Not MVP)

Phase 1 ships **local demo** offer/hire/workspace flows. Multiple code paths can create employment records today without one locked **official source of truth**.

V2 locks the contract **before backend/auth** so:

- Employee accept-offer and employer mark-hired cannot race or duplicate records.
- Notifications, Employment Lifecycle, and Career workspace use one canonical event chain.
- Backend migration has a single state machine to implement.

**Do not** partially implement backend hire APIs until this document is approved.

## 4. Phase 1 Summary (Already Built or In Progress)

| Flow                         | Phase 1 behavior                                    |
| ---------------------------- | --------------------------------------------------- |
| Employer creates Career post | Local create + publish confirm                      |
| Employee applies             | Local application storage                           |
| Pipeline stages              | Applied → shortlisted → interview → offered         |
| Employer sends offer         | Local offer on HR/candidate record                  |
| Employee offer response      | Accept / decline modal on Employment card           |
| Employer hire action         | Creates workspace, staff, employment record (local) |
| Career workspace             | Per-post chat after hire                            |

Phase 1 is **demo-safe** but **not backend-ready** without the rules in Section 5.

## 5. Phase 2 Scope — Official Source of Truth

### 5.1. Canonical Events (ordered)

```txt
career.application.submitted
career.application.shortlisted
career.interview.scheduled        (optional — simple discussion only in P1)
career.offer.sent
career.offer.accepted_by_employee OR career.offer.declined_by_employee
career.hire.confirmed_by_employer  → ONLY after offer.accepted OR explicit override policy
employment.lifecycle.created
career.workspace.opened
notification.* (per Section 5.4)
```

### 5.2. Decision Table — **LOCKED (Product Owner 2026-07-04)**

| #   | Question                                              | **LOCKED V2 rule**                                                                         |
| --- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Q1  | Which action creates the final employment record?     | **`career.hire.confirmed_by_employer` only after `career.offer.accepted_by_employee`**     |
| Q2  | Employee accepts but employer has not confirmed hire? | Application state `offer_accepted`; employment **not** created until employer hire confirm |
| Q3  | Employer marks hired before employee accepts?         | **BLOCK** — modal: "Offer not accepted yet"; no silent hire; **no PO override in v1**      |
| Q4  | Which flow triggers Employment Lifecycle?             | **Single hook:** `employment.lifecycle.created` on hire confirm (idempotent)               |
| Q5  | Which flow creates notifications?                     | Server event bus per `shared/18_NOTIFICATION_IMPLEMENTATION_CONTRACT.md`                   |
| Q6  | Backend source of truth                               | Server-owned `CareerHireRecord` + `Employment` — localStorage becomes cache only           |

### 5.3. Employee Side (V2)

- Offer card shows **one** clear status: Pending / Accepted / Declined / Expired.
- Accept → cannot create duplicate employment rows on refresh/reopen.
- Employment detail reads **only** from official lifecycle record (no direct HR storage reads).

### 5.4. Employer Side (V2)

- Post dashboard **Hire** button disabled until `offer_accepted` — **no override workflow in v1**
- Hire confirm modal lists: applicant name, role, offer date, join date.
- Single audit row on post: who hired whom, when.

### 5.5. Storage / Data Model (future)

```ts
type CareerHireState =
  | "applied"
  | "shortlisted"
  | "offered"
  | "offer_accepted"
  | "offer_declined"
  | "hired"
  | "joined"
  | "withdrawn";

type CareerHireRecord = {
  applicationId: string;
  postId: string;
  employeeWmId: string;
  employerWmId: string;
  state: CareerHireState;
  offerSentAt?: number;
  offerAcceptedAt?: number;
  hireConfirmedAt?: number;
  employmentId?: string;
  workspaceId?: string;
  schemaVersion: 1;
};
```

### 5.6. Notifications / Pulse

| Event          | Channel         | Pulse?                       |
| -------------- | --------------- | ---------------------------- |
| Offer sent     | Bell (employee) | Optional pulse on offer card |
| Offer accepted | Bell (employer) | Pulse on candidate row       |
| Hire confirmed | Bell (employee) | Pulse on employment          |
| Offer declined | Bell (employer) | No pulse                     |

**Never** mix Shift notification domain.

## 6. Explicitly Out of Scope

- Shift Jobs hire or workspace creation
- Full ATS / calendar scheduling ERP
- Payroll execution
- HR Section purple domain automation

## 7. Zero Dead-End Rules

| Entry                             | Next step                                                |
| --------------------------------- | -------------------------------------------------------- |
| Employee sees offer               | Accept / Decline → status updates                        |
| Employee accepts                  | Employment detail or "waiting for employer join confirm" |
| Employer sees accepted offer      | Hire / Join confirm → workspace                          |
| Employer tries hire before accept | Block + explain → back to candidate card                 |

## 8. Privacy and Domain Separation

- Career hire data must not appear in Shift applications or Gig planner bundles.
- Employment Lifecycle rows are **Career-only**.

## 9. Files Likely Touched (Future Only)

| Area           | Files                                                                |
| -------------- | -------------------------------------------------------------------- |
| Offer response | `OfferResponseModal.tsx`, `OfferResponseAcceptStep.tsx`              |
| Employer hire  | `useCareerDashboardPostActions.ts`, `careerPostService.ts`           |
| Employment     | `employmentLifecycle.storage.ts`, `EmployeeEmploymentDetailPage.tsx` |
| Notifications  | `careerNotifications.ts`, employee notification storage              |
| New service    | `careerHireOrchestration.service.ts` (proposed)                      |

## 10. Acceptance Criteria (Future QA)

- [ ] Employer cannot hire before employee accepts offer (unless PO override documented)
- [ ] Employee accept does not create duplicate employment records on reload
- [ ] One employment row per hire — idempotent
- [ ] Notifications fire once per event
- [ ] Shift domain storage has zero writes in Career hire path
- [ ] Close/reopen app preserves hire state correctly

## 11. Per-Page Second Update Backlog

| Page / Component                      | Second Update Item                       | Priority |
| ------------------------------------- | ---------------------------------------- | -------- |
| `EmployerCareerPostDashboardPage.tsx` | Gate Hire on `offer_accepted`            | P0       |
| `OfferResponseModal.tsx`              | Write canonical `CareerHireRecord`       | P0       |
| `EmployeeEmploymentDetailPage.tsx`    | Read lifecycle only — no HR direct reads | P1       |
| `careerPostService.ts`                | `confirmHire()` idempotent API           | P0       |
| `employmentLifecycle.storage.ts`      | Single create hook from hire event       | P0       |
| `careerNotifications.ts`              | Event-driven notification map            | P1       |

---

## 12. Product Owner Approval

| Role                | Status                                                 | Date           |
| ------------------- | ------------------------------------------------------ | -------------- |
| **Product Owner**   | **☑ APPROVED — Source of Truth locked**                | **2026-07-04** |
| Principal Architect | ☑ Drafted from gap audit §7 + Employment Lifecycle doc | 2026-07-01     |
| Decision Maker      | ☐ Acknowledged                                         |                |

**Section 5 is LOCKED.** Backend Architecture Document may reference this contract.  
**V2 implementation coding** begins only after Backend Architecture doc is approved (not before).
