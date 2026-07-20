<!-- App name: WorkMitra / Job Mitra
File name: 00_SECOND_UPDATE_INDEX_AND_WORKFLOW.md
Full file path: C:\projects\WorkMitra_Enterprise_v2\workmitra-master-docs\second-update\00_SECOND_UPDATE_INDEX_AND_WORKFLOW.md -->

# WORKMITRA / JOB MITRA — SECOND UPDATE INDEX AND WORKFLOW

## 1. Document Status

Status: **Active planning folder — internal only**  
Scope: Version 2.0 / Second Update features that are **approved for the product** but **must not be built in the current MVP pass**  
Applies to: Job Mitra / WorkMitra_Enterprise_v2  
Does not replace: Core Master Truth or domain architecture documents

## 2. Inherits From

This folder inherits:

- `architecture/01_CORE_MASTER_TRUTH.md`
- `architecture/12_CROSS_DOMAIN_SYSTEM_RULES_FINAL_POSTING_SAFE.md`
- `architecture/16_FEATURE_IMPLEMENTATION_PRIORITY_MAP.md`
- `shared/02_SHIFT_JOBS_ARCHITECTURE_FINAL_POSTING_SAFE (1).md`
- `shared/03_CAREER_JOBS_ARCHITECTURE_FINAL_POSTING_SAFE.md`
- Mitra Labs Universal Working Agreement v3.1.2

If any document in this folder conflicts with `01_CORE_MASTER_TRUTH.md`, Core Master Truth wins.

## 3. Purpose — Why This Folder Exists

WorkMitra features are often delivered in **two passes**:

| Pass                             | Name                      | Rule                                                                       |
| -------------------------------- | ------------------------- | -------------------------------------------------------------------------- |
| **First Update (MVP / Phase 1)** | Build now                 | Minimum safe loop inside the app. No platform leakage.                     |
| **Second Update (V2 / Phase 2)** | Document now, build later | Premium intelligence, discovery, and shortcuts — only after MVP is stable. |

This folder stores **Second Update** specifications so that:

1. Good ideas are **never lost** during MVP work.
2. Developers do **not** accidentally build V2 features during Phase 1.
3. Product Owner and Architect can **approve V2 docs first**, then code later.
4. Every page discussion can leave a clear **“what comes in Second Update”** trail.

## 4. Mandatory Workflow (All Future Page Audits)

Whenever we audit or build a page, the Architect must produce **two lists**:

### 4.1. First Update List (MVP — build now)

- What ships in the current pass.
- Must be complete enough for a **no dead-end** loop inside the app.
- Must follow domain separation (Shift ≠ Career, Employer ≠ Employee).

### 4.2. Second Update List (V2 — document only until approved)

- What is **intentionally deferred**.
- Why it is deferred (risk, leakage, backend, UX dependency).
- Where the locked spec will live (this folder).
- **Do not code** until Product Owner approves the V2 document and explicitly requests implementation.

### 4.3. Document Template Per Feature

Each Second Update feature gets its own file in this folder:

```txt
second-update/
  00_SECOND_UPDATE_INDEX_AND_WORKFLOW.md        ← this file
  01_SHIFT_WORKER_AVAILABILITY_V2.md            ← Shift: availability Phase 2
  02_CAREER_OFFICIAL_HIRING_FLOW_V2.md          ← Career: hire/employment source of truth
  03_SHIFT_CAREER_POSTING_DRAFT_SAFETY_PHASE1_AUDIT.md  ← MVP gap tracker (NOT V2)
  04_PLANNER_WORKFORCE_INTELLIGENCE_V2.md       ← Planner: forecast, AI, scenarios (V2)
  _TEMPLATE_SECOND_UPDATE_FEATURE.md            ← copy for new features
```

## 5. Folder Index — Second Update Documents

| #   | File                                                   | Domain                                        | Status                                      |
| --- | ------------------------------------------------------ | --------------------------------------------- | ------------------------------------------- |
| 01  | `01_SHIFT_WORKER_AVAILABILITY_V2.md`                   | Shift Jobs — Worker Availability              | **Locked for V2 — do not build in Phase 1** |
| 02  | `02_CAREER_OFFICIAL_HIRING_FLOW_V2.md`                 | Career Jobs — Official hire / employment flow | **Locked for V2 — P0 before backend/auth**  |
| 03  | `03_SHIFT_CAREER_POSTING_DRAFT_SAFETY_PHASE1_AUDIT.md` | Shift + Career — Posting draft safety         | **Phase 1 gap tracker (build now, not V2)** |
| 04  | `04_PLANNER_WORKFORCE_INTELLIGENCE_V2.md`              | Planner — Workforce Intelligence V2           | **Locked for V2 — do not build in Phase 1** |

### 5.1. Verification Summary (2026-07-04)

| Domain      | Second Update docs                            | Phase 1 gaps still open                                                |
| ----------- | --------------------------------------------- | ---------------------------------------------------------------------- |
| **Shift**   | Doc 01 (Availability V2) ✅                   | Incomplete draft reminder on employer home (doc 03 §4)                 |
| **Career**  | Doc 02 (Hiring flow V2) ✅ **approved**       | Duplicate warning, full preview modal, home draft reminder (doc 03 §4) |
| **Planner** | Doc 04 (Workforce Intelligence V2) ✅ **new** | Phase 1 built — V2 forecast/AI/scenarios deferred                      |
| **Both**    | —                                             | Close/reopen verification (all flows) — Evidence per doc 24            |

## 6. Relationship to Other Docs

| Document                                                 | Relationship                                                 |
| -------------------------------------------------------- | ------------------------------------------------------------ |
| `architecture/16_FEATURE_IMPLEMENTATION_PRIORITY_MAP.md` | Classifies _when_ a feature may be built                     |
| `architecture-audits/24_ADVANCED_FEATURE_GAP_AUDIT...`   | Gap audit source material                                    |
| `second-update/*`                                        | **Locked V2 product specs** ready for future sprint          |
| `technical-debt/*`                                       | Bugs and boundary debt — not the same as planned V2 features |

**Rule:** Second Update = planned product enhancement. Technical debt = fix or boundary correction.

**Planner rule (PO 2026-07-04):** Phase 1 Planner is built (`planner/01_...`). Unbuilt intelligence (forecast, AI, scenarios, Planner Pro) lives in **`second-update/04_PLANNER_WORKFORCE_INTELLIGENCE_V2.md`**. Domain scope lock stays in `planner/02_...`.

## 7. Approval Gate Before V2 Coding

Before any Second Update file is implemented:

1. Product Owner reads and approves the V2 document in this folder.
2. Architect confirms Phase 1 for that area is complete and stable.
3. Explicit instruction: **“Execute Second Update document 01”** (or relevant number).
4. Code changes stay scoped to that document only.

## 8. Launch Visibility

```txt
Internal documentation only.
Not for Play Store listing or public marketing copy.
```

---

**Last updated:** 2026-07-04 (added Planner V2 doc 04 + domain lock cross-ref)
