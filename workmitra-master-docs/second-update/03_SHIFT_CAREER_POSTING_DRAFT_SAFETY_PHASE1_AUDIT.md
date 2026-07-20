<!-- App name: WorkMitra / Job Mitra
File name: 03_SHIFT_CAREER_POSTING_DRAFT_SAFETY_PHASE1_AUDIT.md
Full file path: C:\projects\WorkMitra_Enterprise_v2\workmitra-master-docs\second-update\03_SHIFT_CAREER_POSTING_DRAFT_SAFETY_PHASE1_AUDIT.md -->

# SHIFT + CAREER — POSTING DRAFT SAFETY PHASE 1 AUDIT

## 1. Document Status

| Field   | Value                                                                                   |
| ------- | --------------------------------------------------------------------------------------- |
| Status  | **Phase 1 gap tracker — NOT a V2 build spec**                                           |
| Purpose | Record what architecture requires in MVP vs what the app has today                      |
| Audited | 2026-07-01 against `shared/02_SHIFT_JOBS...` §1.27 and `shared/03_CAREER_JOBS...` §1.25 |
| Action  | **Build in Phase 1** (MVP pass) — do not wait for V2 approval                           |

> This file lives in `second-update/` for traceability only. Items here are **First Update**, not Second Update.

## 2. Architecture Requirements (Both Domains)

| Feature                                   | Shift §1.27 | Career §1.25 | MVP? |
| ----------------------------------------- | ----------- | ------------ | ---- |
| Save as Draft                             | ✓           | ✓            | Yes  |
| Resume Draft                              | ✓           | ✓            | Yes  |
| Auto-save while filling                   | ✓           | ✓            | Yes  |
| Preview Before Publish                    | ✓           | ✓            | Yes  |
| Duplicate Job Warning                     | ✓           | ✓            | Yes  |
| Publish Confirmation                      | ✓           | ✓            | Yes  |
| Incomplete Draft Reminder (employer home) | ✓           | ✓            | Yes  |

## 3. Implementation Status (Code Audit 2026-07-01)

### 3.1. Shift Jobs

| Feature                           | Status         | Evidence                                                         |
| --------------------------------- | -------------- | ---------------------------------------------------------------- |
| Save Draft                        | ✅ Built       | `employerShiftDraftStorage`, `ShiftCreateWizardTopBar`           |
| Resume Draft                      | ✅ Built       | `ShiftDraftControlPanel`, `onResumeDraft`                        |
| Auto-save                         | ✅ Partial     | Draft save on explicit action; verify autosave timer if required |
| Preview Before Publish            | ✅ Built       | `ShiftCreateConfirmModal` + `createPreview` summary              |
| Duplicate Warning                 | ✅ Built       | `findDuplicateShiftWarnings` in confirm modal                    |
| Publish Confirmation              | ✅ Built       | `ShiftCreateConfirmModal`                                        |
| Incomplete Draft Reminder on Home | ❌ **Missing** | Drafts on `EmployerShiftPostsPage` state only — no home hub card |

### 3.2. Career Jobs

| Feature                           | Status         | Evidence                                                                |
| --------------------------------- | -------------- | ----------------------------------------------------------------------- |
| Save Draft                        | ✅ Built       | `careerCreateDraftStorage`, `CareerCreatePageControls`                  |
| Resume Draft                      | ✅ Built       | Auto-load on `EmployerCareerCreatePage` + resume banner                 |
| Auto-save                         | ✅ Partial     | Save on leave confirm; verify continuous autosave if required           |
| Preview Before Publish            | ⚠️ **Partial** | Text `ConfirmModal` only — no employee-facing preview layout like Shift |
| Duplicate Career Job Warning      | ❌ **Missing** | No `findDuplicateCareerWarnings` equivalent                             |
| Publish Confirmation              | ✅ Built       | `handleCreate` → `ConfirmModal` before `doCreate`                       |
| Incomplete Draft Reminder on Home | ❌ **Missing** | No draft card on `EmployerCareerHomePage`                               |

## 4. Phase 1 Build List (MVP — Not V2)

Priority order for next implementation pass:

### P1 — Career parity with Shift

1. **`findDuplicateCareerWarnings`** helper + show in publish confirm (advisory only).
2. **`CareerCreatePreviewModal`** — employee-facing layout preview (mirror `ShiftCreateConfirmModal` depth).
3. **Incomplete draft reminder** on `EmployerCareerHomePage` when `careerCreateDraftStorage.get()` exists.

### P1 — Shift completion

4. **Incomplete draft reminder** on `EmployerShiftHomePage` when `employerShiftDraftStorage.getAll().length > 0`.

### P2 — Polish

5. Continuous auto-save debounce on both create wizards (if PO requires strict §1.27.3 / §1.25.3).

## 5. Per-Page Backlog (Phase 1)

| Page / Component               | Item                                         | Domain | Priority |
| ------------------------------ | -------------------------------------------- | ------ | -------- |
| `EmployerCareerCreatePage.tsx` | Duplicate warning in publish confirm         | Career | P1       |
| `EmployerCareerCreatePage.tsx` | Full employee-facing preview modal           | Career | P1       |
| `EmployerCareerHomePage.tsx`   | "You have unfinished Career Job drafts" card | Career | P1       |
| `EmployerShiftHomePage.tsx`    | Unfinished shift draft reminder card         | Shift  | P1       |
| `careerCreateHelpers.ts` (new) | `findDuplicateCareerWarnings()`              | Career | P1       |
| `ShiftCreateConfirmModal.tsx`  | Reference pattern for Career preview         | Shared | —        |

## 6. What Stays in V2 (Not This File)

| Doc                                    | Feature                                       |
| -------------------------------------- | --------------------------------------------- |
| `01_SHIFT_WORKER_AVAILABILITY_V2.md`   | Talent Radar, Direct Invite list, Magic Alert |
| `02_CAREER_OFFICIAL_HIRING_FLOW_V2.md` | Offer/hire/employment source of truth         |

## 7. Cross-Domain Rules

- Shift draft safety must never expose drafts in Career search.
- Career draft safety must never expose drafts in Shift search.
- Gig Projects (Planner) uses separate `demandPlannerStorage` — out of scope for this audit.

---

**Last updated:** 2026-07-01  
**Maintainer:** Product Architecture / Mitra Labs

---

## 8. Re-Audit Note (2026-07-16)

Implementation sync packet **PHASE-DOCS-SHIFT-CAREER-IMPLEMENTATION-SYNC-001** re-verified posting draft features against live code:

| Feature                | Shift                                            | Career                                             | Evidence               |
| ---------------------- | ------------------------------------------------ | -------------------------------------------------- | ---------------------- |
| Save/resume draft      | IMPLEMENTED (`wm_employer_shift_post_drafts_v1`) | IMPLEMENTED (`wm_employer_career_create_draft_v1`) | Create pages           |
| Draft reminder card    | IMPLEMENTED                                      | IMPLEMENTED                                        | Home pages             |
| Publish confirmation   | IMPLEMENTED                                      | IMPLEMENTED                                        | Create flows           |
| Preview before publish | PARTIALLY IMPLEMENTED                            | PARTIALLY IMPLEMENTED                              | Verify per wizard step |
| Duplicate warning      | PLANNED / partial                                | PLANNED / partial                                  | Not fully evidenced    |
| Continuous auto-save   | NOT IMPLEMENTED                                  | NOT IMPLEMENTED                                    | Manual save only       |

Full current behaviour: Shift architecture §1.30 Current Application Implementation Sync; Career architecture §1.28 Current Application Implementation Sync.
