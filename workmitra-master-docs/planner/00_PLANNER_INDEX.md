<!-- App name: WorkMitra / Job Mitra
File name: 00_PLANNER_INDEX.md
Full file path: C:\projects\WorkMitra_Enterprise_v2\workmitra-master-docs\planner\00_PLANNER_INDEX.md
Document version: v1.8 -->

# SHIFT DEMAND PLANNER — DOCUMENT INDEX

## Purpose

Official master specification for the **Workforce Intelligence Domain** (Demand Planner).  
Phase-0 ships as Shift demand-planning; domain scope lock in doc 02 — **never Career Jobs execution**.

**Domain freeze:** `02_PLANNER_DOMAIN_SCOPE_LOCK_v1.0.md` — Planner is **not** a Shift feature.

**Quick version check:** see `Document version:` on **line 4** of this file and `01_SHIFT_DEMAND_PLANNER_MASTER_DOCUMENT.md` header — both must always match.

## Documents

| #   | File                                         | Status                                                             |
| --- | -------------------------------------------- | ------------------------------------------------------------------ |
| 01  | `01_SHIFT_DEMAND_PLANNER_MASTER_DOCUMENT.md` | **Locked for implementation (v1.9)**                               |
| 02  | `02_PLANNER_DOMAIN_SCOPE_LOCK_v1.0.md`       | **☑ FROZEN — separate Workforce Intelligence Domain (2026-07-04)** |
| —   | V2 intelligence spec                         | **`second-update/04_PLANNER_WORKFORCE_INTELLIGENCE_V2.md`**        |

## v1.7 Summary (2026-07-01) — Availability + Earnings Predictor Types

| Addition                                                                           | Section |
| ---------------------------------------------------------------------------------- | ------- |
| `EmployeeAvailability` + day status model                                          | 6.11    |
| `SmartEarningsPredictorPayload` + meter types                                      | 6.11    |
| Calendar cell visual map + dopamine meter wiring                                   | 8.11    |
| Service contracts (`EmployeeAvailabilityService`, `SmartEarningsPredictorService`) | 6.11    |

## v1.6 Summary (2026-07-01) — Ultra-Premium Employee Gig (retained)

| Feature                    | Section |
| -------------------------- | ------- |
| Live Earnings Calculator   | 8.10.1  |
| Intelligent Conflict Guard | 8.10.2  |
| Commitment Streak badge    | 8.10.3  |
| Unified Diary Auto-Sync    | 8.10.4  |

## Coding Start Rule

```txt
Product Owner approved v1.7 master document (2026-07-01).
P1 includes EmployeeAvailability + SmartEarningsPredictor (6.11, 8.11).
P1 is not shippable until Appendix D (31 steps) + F1–F32 pass.
```

## Version History

| Version | Date       | Summary                                                         |
| ------- | ---------- | --------------------------------------------------------------- |
| v1.8    | 2026-07-04 | Domain scope lock doc 02 — Workforce Intelligence Domain frozen |
| v1.7    | 2026-07-01 | Employee Availability + Smart Earnings Predictor types          |
| v1.6    | 2026-07-01 | Ultra-Premium Employee Gig features                             |
| v1.5    | 2026-07-01 | Employee Planner Experience parity                              |
| v1.4    | 2026-07-01 | P1 cancel policy hardening                                      |
| v1.3    | 2026-07-01 | Audit hardening — Section 17                                    |
| v1.2    | 2026-07-01 | E2E audit gaps closed                                           |
| v1.1    | 2026-07-01 | Mega Card + Mega Workspace Merge                                |
| v1.0    | 2026-07-01 | Initial Planner master document                                 |

**Last updated:** 2026-07-04 (added Planner V2 doc 04 reference in index v1.8)
