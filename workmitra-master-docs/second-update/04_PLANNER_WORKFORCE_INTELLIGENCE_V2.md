<!-- App name: WorkMitra / Job Mitra
File name: 04_PLANNER_WORKFORCE_INTELLIGENCE_V2.md
Full file path: C:\projects\WorkMitra_Enterprise_v2\workmitra-master-docs\second-update\04_PLANNER_WORKFORCE_INTELLIGENCE_V2.md -->

# DEMAND PLANNER — WORKFORCE INTELLIGENCE V2 (SECOND UPDATE)

## 1. Document Status

| Field                | Value                                                                                                       |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| Status               | **Locked for V2 — do not build in Phase 1**                                                                 |
| Domain               | **Workforce Intelligence Domain** (Demand Planner)                                                          |
| Related Phase 1 docs | `planner/01_SHIFT_DEMAND_PLANNER_MASTER_DOCUMENT.md` (v1.9), `planner/02_PLANNER_DOMAIN_SCOPE_LOCK_v1.0.md` |
| Build gate           | Product Owner approves this document before V2 Planner intelligence coding                                  |
| PO domain decision   | Planner = separate domain (not Shift feature) — frozen 2026-07-04                                           |

## 2. Inherits From

- `architecture/01_CORE_MASTER_TRUTH.md`
- `planner/02_PLANNER_DOMAIN_SCOPE_LOCK_v1.0.md`
- `planner/01_SHIFT_DEMAND_PLANNER_MASTER_DOCUMENT.md`
- `shared/18_NOTIFICATION_IMPLEMENTATION_CONTRACT.md`

## 3. Why This Is Second Update (Not MVP)

Phase 1 (built) ships **multi-day demand planning**, plan calendar, budget visibility, fill monitoring, and planner-generated shift posts.

The items in this document are **intelligence and orchestration upgrades** that require:

- Backend Planner Service + dedicated tables
- Historical demand data across plans and branches
- AI / prediction models (or rule engines with training data)
- Subscription packaging (Planner Pro)

**Do not** build these during Phase 1 or during Backend Architecture phase unless PO explicitly requests a V2 sprint.

**Permanent scope rule (from domain lock):** Planner stays **Plan → Predict → Recommend → Monitor**. V2 adds intelligence inside that boundary — **never** shift execution, hiring, payroll, attendance, or HR ops.

## 4. Phase 1 Summary (Already Built — Do Not Redo)

| Capability                                                      | Phase 1 status          |
| --------------------------------------------------------------- | ----------------------- |
| Multi-day demand plan create / edit                             | ✅ Built                |
| Plan calendar + day slots                                       | ✅ Built                |
| Budget + payment-schedule UI (not connected)                    | ✅ Built                |
| Plan → auto shift post generation (`planId`, `source: planner`) | ✅ Built                |
| Fill monitoring on plan dashboard                               | ✅ Built                |
| Mega Project Card / plan bundle anti-spam                       | ✅ Built                |
| Plan broadcast workspace merge                                  | ✅ Built                |
| Employee Pick & Choose + availability types (P1 contracts)      | ✅ Built / specified    |
| E2E `gig-planner-circuit`                                       | ✅ Pass                 |
| Bespoke visual tier (Section 18 master doc)                     | ✅ Implemented baseline |

## 5. Phase 2 Scope — Workforce Intelligence

### 5.1. Forecasting & Prediction

| Feature                         | Description                                                              | Priority |
| ------------------------------- | ------------------------------------------------------------------------ | -------- |
| **Seasonal demand prediction**  | Predict headcount need by season / month from historical plan fill rates | P1       |
| **Manpower forecasting**        | Forward-looking FTE / shift-slot estimates per role                      | P1       |
| **Holiday / festival forecast** | Calendar-aware demand spikes (regional festivals)                        | P2       |
| **Weather / rain impact**       | Optional external signal → staffing adjustment suggestions               | P3       |
| **Sales impact model**          | Link revenue / footfall signals to labour need (integration TBD)         | P3       |
| **Overtime prediction**         | Warn when plan pattern likely exceeds budget or legal OT thresholds      | P2       |
| **Labour shortage alerts**      | Proactive alert when fill rate trend + calendar → understaff risk        | P1       |

### 5.2. Planning Intelligence (non-AI and AI)

| Feature                      | Description                                                  | Priority |
| ---------------------------- | ------------------------------------------------------------ | -------- |
| **Scenario planning**        | Compare 2–3 staffing scenarios side-by-side before posting   | P1       |
| **What-if simulate**         | Adjust headcount / pay / days → see budget + fill projection | P1       |
| **Branch comparison**        | Multi-location employers compare demand across branches      | P2       |
| **Auto Planner**             | AI-suggested plan draft from historical + forecast inputs    | P2       |
| **Demand prediction engine** | Core ML or rules service feeding recommendations             | P1       |
| **Planner recommendations**  | Actionable cards: "Post 3 more Tue slots", "Raise pay band"  | P1       |

### 5.3. Analytics & Monitoring (V2 depth)

| Feature                         | Description                                                   | Priority |
| ------------------------------- | ------------------------------------------------------------- | -------- |
| **Demand analytics dashboard**  | Trends: fill rate, cost per filled slot, time-to-fill by role | P1       |
| **Enterprise planning reports** | Exportable PDF/CSV for agency owners                          | P2       |
| **Planner snapshot**            | Point-in-time freeze of plan state for audit / comparison     | P2       |
| **Monitor alerts**              | Bell notifications for forecast thresholds (not pulse spam)   | P1       |

### 5.4. Backend — Planner Service (V2)

Separate **Planner domain** micro-boundary (not Shift tables):

```txt
Planner Service
  ├── Planner APIs (REST or GraphQL — per Backend Architecture doc)
  ├── Planner Database (dedicated schema)
  ├── Planner Analytics (read models)
  └── Planner AI (prediction jobs — async)
```

**Orchestration model:**

```txt
Employer → Planner Service → recommends / generates → Shift Jobs (execution)
                          → recommends (future)     → Career Jobs (execution)
                          → future                  → Workforce Planning module
```

### 5.5. Storage / Data Model (V2 entities)

Phase 1 uses `demandPlannerStorage` (`wm_employer_demand_plans_v1`) + linked shift posts.

V2 adds server-owned entities — **never columns on Shift post tables:**

```ts
type PlannerDemandForecast = {
  id: string;
  companyId: string;
  planId?: string;
  periodStart: string;
  periodEnd: string;
  roleId?: string;
  predictedHeadcount: number;
  confidence: number; // 0–1
  signals: ("seasonal" | "holiday" | "weather" | "sales" | "historical")[];
  createdAt: number;
  schemaVersion: 1;
};

type PlannerScenario = {
  id: string;
  planId: string;
  label: string;
  headcountDelta: number;
  budgetDelta: number;
  projectedFillRate: number;
  isSelected: boolean;
  schemaVersion: 1;
};

type PlannerRecommendation = {
  id: string;
  planId: string;
  type: "post_more" | "raise_pay" | "shortage_risk" | "overtime_risk" | "auto_draft";
  message: string;
  actionHref?: string;
  dismissedAt?: number;
  schemaVersion: 1;
};

type PlannerSnapshot = {
  id: string;
  planId: string;
  capturedAt: number;
  payload: Record<string, unknown>; // frozen plan + fill KPIs
  schemaVersion: 1;
};
```

**Also server-owned (may partially exist in Phase 1 local only):**

- `PlannerTemplate` — reusable plan templates across months
- `PlannerCalendar` — normalized calendar layer (may sync from plan days)

### 5.6. Subscription / Business Packaging (V2)

| Module                  | Contents                                        |
| ----------------------- | ----------------------------------------------- |
| **Planner Pro**         | Scenario planning + branch comparison + reports |
| **Forecast AI**         | Seasonal + holiday + demand prediction          |
| **Demand Analytics**    | Dashboard + export                              |
| **Enterprise Planning** | Multi-branch + API access + snapshot audit      |

Packaging is **Planner domain** — not bundled as Shift Jobs premium tier.

### 5.7. Notifications / Pulse (V2)

| Event                         | Channel         | Pulse?                               |
| ----------------------------- | --------------- | ------------------------------------ |
| Labour shortage alert         | Bell (employer) | Optional pulse on planner home KPI   |
| Forecast threshold crossed    | Bell            | No pulse on full card                |
| Scenario recommendation ready | Bell            | Pulse on recommendation row CTA only |
| Auto Planner draft ready      | Bell            | Pulse on "Review draft" button       |

**Never** mix Shift or Career notification domains in one row.

## 6. Explicitly Out of Scope (V2 doc — permanent)

| Item                            | Correct domain              |
| ------------------------------- | --------------------------- |
| Execute / confirm shift workers | Shift Jobs                  |
| Shift workspace messaging       | Shift Jobs                  |
| Hire / offer / employment       | Career Jobs                 |
| Payroll run                     | Payroll domain (future)     |
| Attendance / punch              | Employment Lifecycle        |
| Leave / HR roster               | HR / Workforce Ops (hidden) |
| Career application pipeline     | Career Jobs                 |

**Risk:** If V2 adds execution here, Planner becomes ERP — violates domain lock.

## 7. Zero Dead-End Rules

| Entry                            | Next step                                                   |
| -------------------------------- | ----------------------------------------------------------- |
| Employer sees shortage alert     | Open plan → recommended action → post shifts (Shift domain) |
| Employer opens scenario compare  | Select scenario → apply to plan draft → review calendar     |
| Employer sees Auto Planner draft | Review → edit → publish plan (existing Phase 1 flow)        |
| Forecast low confidence          | Show explanation + manual override → continue planning      |

## 8. Privacy and Domain Separation

- Forecast inputs may use aggregated anonymized fill data — no worker PII in prediction API responses.
- Branch comparison uses company-owned branch IDs only.
- Planner V2 read models **never** expose employee phone/email on blind surfaces.
- Career and Shift execution data are **read-only inputs** to Planner — Planner does not write hiring or shift confirm state.

## 9. Files Likely Touched (Future Only)

| Area              | Files / services                                      |
| ----------------- | ----------------------------------------------------- |
| Planner home KPIs | `EmployerPlannerHomePage.tsx` (or equivalent)         |
| Scenario UI       | New `PlannerScenarioCompare.tsx`                      |
| Forecast service  | `plannerForecast.service.ts` (proposed)               |
| Recommendations   | `plannerRecommendation.service.ts` (proposed)         |
| Storage migration | `demandPlannerStorage.ts` → server sync adapter       |
| Backend           | Planner Service module (per Backend Architecture doc) |

## 10. Acceptance Criteria (Future QA)

- [ ] Seasonal forecast generates without blocking Phase 1 plan create flow
- [ ] Scenario compare does not duplicate shift posts on apply
- [ ] Labour shortage alert fires once per threshold crossing
- [ ] Auto Planner draft is idempotent on refresh
- [ ] No writes to Career or Shift execution stores from Planner intelligence layer
- [ ] Planner Pro gate hides V2 features when subscription inactive
- [ ] Branch comparison works for 2+ branches without cross-company leak

## 11. Per-Page Second Update Backlog

| Page / Component      | Second Update Item                       | Priority |
| --------------------- | ---------------------------------------- | -------- |
| Employer Planner Home | Forecast KPI strip + shortage alert card | P1       |
| Plan detail           | Scenario tab + simulate slider           | P1       |
| Plan wizard           | Auto Planner "draft from history" entry  | P2       |
| Planner settings      | Branch selector for comparison           | P2       |
| Reports               | Enterprise export button                 | P2       |

---

## 12. Product Owner Approval

| Role          | Status                                 | Date       |
| ------------- | -------------------------------------- | ---------- |
| Product Owner | ☐ Pending V2 implementation approval   |            |
| Architect     | ☑ Spec filed from domain lock decision | 2026-07-04 |

**Phase 1 Planner remains shipped as-is. This document defines V2 intelligence only.**
