<!-- App name: WorkMitra / Job Mitra
File name: 02_PLANNER_DOMAIN_SCOPE_LOCK_v1.0.md
Full file path: C:\projects\WorkMitra_Enterprise_v2\workmitra-master-docs\planner\02_PLANNER_DOMAIN_SCOPE_LOCK_v1.0.md -->

# DEMAND PLANNER — DOMAIN SCOPE LOCK (v1.0)

## 1. Document Status

| Field                            | Value                                                                     |
| -------------------------------- | ------------------------------------------------------------------------- |
| Status                           | **☑ FROZEN — Product Owner approved (2026-07-04)**                        |
| Domain name                      | **Workforce Intelligence Domain** (internal: Demand Planner)              |
| Relationship                     | **Separate domain** — not a Shift Jobs feature, not a Career Jobs feature |
| Build gate                       | Scope lock is permanent; execution logic must never be added here         |
| Where V2 intelligence specs live | **`second-update/04_PLANNER_WORKFORCE_INTELLIGENCE_V2.md`**               |
| Where domain scope lock lives    | **This file** (`02_PLANNER_DOMAIN_SCOPE_LOCK_v1.0.md`)                    |

---

## 2. Product Owner Decision

**Decision:** Demand Planner is a **separate domain**, not a feature inside Shift Jobs.

**Recommendation:** APPROVE  
**Confidence:** 99%

| Audit lens         | Result  |
| ------------------ | ------- |
| Product Owner view | ✅ PASS |
| Architecture view  | ✅ PASS |
| Scalability        | ✅ PASS |
| Backend view       | ✅ PASS |
| Database view      | ✅ PASS |
| AI view            | ✅ PASS |
| UX view            | ✅ PASS |
| Business view      | ✅ PASS |

---

## 3. What Planner IS (mental model)

Employer question Planner answers:

```txt
"എനിക്ക് അടുത്ത മാസം എത്ര ആളുകൾ വേണം?"
```

That is **planning** — not job posting, not hiring execution, not payroll.

**Golden line:**

```txt
Planner = Workforce Intelligence Domain
        = Plan → Predict → Recommend → Monitor (decision support only)
```

---

## 4. Central orchestration layer (architecture)

```txt
                    Employer
                        ↓
              ┌─────────────────┐
              │  PLANNER DOMAIN  │  ← Workforce Intelligence
              │  (orchestration) │
              └────────┬────────┘
         ┌─────────────┼─────────────┬──────────────┐
         ↓             ↓             ↓              ↓
   Shift Jobs    Career Jobs   Future Staffing   Analytics /
   (execution)   (execution)   Planning          Forecasting / AI
```

**If Planner were only a Shift feature**, it would be trapped under:

```txt
Employer → Shift → Planner   ❌ (wrong — limits growth)
```

**Correct:**

```txt
Employer → Planner → Shift / Career / Future modules   ✅
```

---

## 5. Scope lock — Planner MAY do

| Capability    | Phase-0 (built)                             | V2 (Second Update — doc 04)                 |
| ------------- | ------------------------------------------- | ------------------------------------------- |
| **Plan**      | Multi-day demand plans, calendar, templates | Scenario planning, branch comparison        |
| **Forecast**  | Budget + fill monitoring on plan            | Seasonal prediction, manpower forecasting   |
| **Recommend** | Plan-level CTAs to post shifts              | Labour shortage alerts, overtime prediction |
| **Simulate**  | — (not built)                               | What-if staffing scenarios                  |
| **Monitor**   | Plan dashboard, fill KPIs                   | Demand analytics, reports                   |

**V2 detail:** `second-update/04_PLANNER_WORKFORCE_INTELLIGENCE_V2.md`

**Phase-0 implementation reference:** `01_SHIFT_DEMAND_PLANNER_MASTER_DOCUMENT.md` (v1.9) — demand planning + shift post generation from plans.

---

## 6. Scope lock — Planner MUST NOT do (permanent)

These belong in **other domains**. Never add execution logic to Planner:

| Forbidden in Planner               | Correct domain                          |
| ---------------------------------- | --------------------------------------- |
| Execute / confirm shift workers    | **Shift Jobs**                          |
| Run shift workspace chat actions   | **Shift Jobs**                          |
| Hire employee / offer / employment | **Career Jobs**                         |
| Payroll execution                  | **Future Payroll domain** (or external) |
| Attendance / punch                 | **Employment Lifecycle**                |
| Leave management                   | **HR / Workforce Ops** (hidden)         |
| HR roster operations               | **HR domain** (purple, hidden)          |
| Career application pipeline        | **Career Jobs**                         |

**Risk if violated:** Planner grows into ERP — breaks domain separation, backend rework, subscription packaging confusion.

---

## 7. Domain separation (hard locks — unchanged)

| Rule           | Requirement                                                       |
| -------------- | ----------------------------------------------------------------- |
| Shift ≠ Career | Planner may **recommend** posts to both; never merges pipelines   |
| Storage        | `demandPlannerStorage` separate from shift posts and career posts |
| State          | No shared Zustand slice with Career or Workforce Ops              |
| Visual         | Planner cyan tokens — not Shift green, not Career blue            |
| Pulse          | Silent data UX on dashboard; pulses on explicit CTAs only         |

---

## 8. Future backend entities (V2)

See **`second-update/04_PLANNER_WORKFORCE_INTELLIGENCE_V2.md` §5.5** for full entity list.

**Phase-0 only:** `PlannerPlan` (local) + child shift posts via `planId` link.

---

## 9. Future AI capabilities (V2)

See **`second-update/04_PLANNER_WORKFORCE_INTELLIGENCE_V2.md` §5.1–5.2** — do not build in Phase 1.

---

## 10. Business / subscription packaging (V2)

See **`second-update/04_PLANNER_WORKFORCE_INTELLIGENCE_V2.md` §5.6**.

---

## 11. Relationship to other doc folders

| Folder                 | Planner content rule                                                  |
| ---------------------- | --------------------------------------------------------------------- |
| `planner/`             | Phase 1 master spec + domain scope lock (this file)                   |
| `second-update/04_...` | **V2 intelligence** — forecast, AI, scenarios, analytics, Planner Pro |
| `architecture-audits/` | Cross-domain references only                                          |

**PO rule (2026-07-04):** Unbuilt Planner intelligence items belong in **second-update doc 04**, not in Phase 1 coding.

---

## 12. What is already built (Phase-0 — do not redo)

| Evidence                               | Status               |
| -------------------------------------- | -------------------- |
| Planner master doc v1.9                | Locked               |
| E2E `gig-planner-circuit`              | Pass                 |
| Executive grade                        | A+                   |
| Multi-day plan → shift post generation | Built                |
| Mega card / plan bundle anti-spam      | Built                |
| Bespoke visual tier (Section 18)       | Implemented baseline |

---

## 13. Product Owner final lock

| Role              | Status                         | Date       |
| ----------------- | ------------------------------ | ---------- |
| **Product Owner** | **☑ APPROVED — Domain frozen** | 2026-07-04 |
| Architect         | ☑ Recorded                     | 2026-07-04 |

**Permanent rule:** Planner remains **Plan → Predict → Recommend → Monitor** forever. No execution creep.

---

**Next:** Backend Architecture document references this scope lock for Planner Service boundaries.  
Canonical doc: `HOSTING_BACKEND_DATABASE_/16_JOB_MITRA_BACKEND_ARCHITECTURE_v1.0.md`
