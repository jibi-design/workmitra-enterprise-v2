# Planner Pending & Deferred — Live Note

> **Purpose:** Track-1 Planner product — what is DONE, what is NEXT, what is DEFERRED.  
> Maintain this like Cloudflare / Supabase live notes. Read first; update every Planner session.  
> **Do not** merge into CF/Supabase notes.  
> **Board pointer:** `../architecture/evidence/PENDING_WORK_BOARD.md`  
> **Rule:** `.cursor/rules/infra-live-state-notes.mdc` (Planner section)

**Document:** `07_PLANNER_PENDING_AND_DEFERRED_LIVE_NOTE.md`  
**Last verified:** 2026-08-19 (plannerGateApi dual-write + hydrate)  
**Active track:** Track 1 — Planner product  
**Overall status:** **Track 1 patches T1-1…T1-5 COMPLETE.** Remaining product work = P2 open items + deferred D-xx (see below).

---

## 1. Current truth (quick read)

| Area                                                 | Status                                                                   |
| ---------------------------------------------------- | ------------------------------------------------------------------------ |
| Hybrid A2 Phase-1 circuit                            | COMPLETE                                                                 |
| Phase-2 Ops (audit, concurrency, escalations, RTW)   | COMPLETE                                                                 |
| Employer Ultra UI / Luxury polish tracks (docs)      | COMPLETE                                                                 |
| Employer finance page                                | **DONE (T1-1)**                                                          |
| Employer roster detail                               | **DONE (T1-2)**                                                          |
| Employer plan detail                                 | PARTIAL — fill % / days; not full P2 calendar + day drawer               |
| Retry on cancel/broadcast failure                    | **DONE (T1-3)**                                                          |
| Visual e2e browse / applications / finance           | **DONE (T1-4)**                                                          |
| Master doc §11–12 vs Hybrid A2                       | **DONE (T1-5)** — `01` v1.10                                             |
| Full P3 finance ledger + CSV                         | DEFERRED                                                                 |
| Optional plan snapshot (Phase-2)                     | DEFERRED (PO gate)                                                       |
| V2 workforce intelligence                            | DEFERRED — do not build until PO V2 sprint                               |
| Planner DB cutover (leave localStorage)              | PARTIAL — dual-write + GET hydrate via plannerGateApi; LS still UI cache |
| Company email / Cloudflare Pages / production launch | OUT OF SCOPE — see pre-launch board                                      |

---

## 2. DONE baseline (do not re-build)

### Employee routes

`/employee/planner/home` · `browse` · `projects/:planId` · apply · `applications` · workspace(s) · `earnings`

### Employer routes

`/employer/planner/home` · `plans` · `new` · `plans/:planId` · `applications` · `roster` · `roster/:planId`  
Finance route exists as **placeholder:** `/employer/planner/plans/:planId/finance`

### E2E already covering

Circuit specs · batch approval · route contract · workspace/roster smoke · Phase-2 ops smokes · visual: employee home/browse/applications · employer home/plans/finance

---

## 3. PENDING patches (Track 1 — COMPLETE)

| #       | Patch                                                            | Priority | Status                |
| ------- | ---------------------------------------------------------------- | -------- | --------------------- |
| T1-1    | Finance placeholder polish + e2e smoke                           | —        | **DONE** (2026-07-26) |
| T1-2    | Roster detail cleanup (`*-stub-back` testid, 4-state)            | —        | **DONE** (2026-07-26) |
| T1-3    | Wire cancel/broadcast failures → `wm_retry_queue_v1`             | —        | **DONE** (2026-07-26) |
| T1-4    | Visual e2e: employee browse + applications (+ finance)           | —        | **DONE** (2026-07-26) |
| T1-5    | Sync master doc `01` §11–12 checklists to Hybrid A2 reality      | —        | **DONE** (2026-07-26) |
| P-LOC-1 | Planner work-area matching (Shift kernel + per-day blind counts) | —        | **DONE** (2026-08-13) |

**Hard rule:** When starting new Planner work, add a new PENDING row or promote a D-xx — do not rely on chat memory.

## 4. DEFERRED (later — do not forget, do not build now)

| ID   | Item                                                                            | Gate                                                                |
| ---- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| D-01 | Full P3 finance ledger + CSV export                                             | PO + Track 1 finance placeholder closed                             |
| D-02 | Phase-2 optional plan snapshot                                                  | PO explicit approve                                                 |
| D-03 | Wizard Step4 Budget wired into create flow                                      | PO (file exists, unwired by design)                                 |
| D-04 | Full P2 calendar grid + day drawer on plan detail                               | PO                                                                  |
| D-05 | Smart match ranking / near-you planner bell / offline public index / day-reopen | PO                                                                  |
| D-06 | V2 intelligence (forecast, Auto Planner, scenarios, analytics)                  | `second-update/04_PLANNER_WORKFORCE_INTELLIGENCE_V2.md` + PO sprint |
| D-07 | Planner DB / service cutover (leave localStorage)                               | Architecture track — not Track 1                                    |
| D-08 | Duplicate plan / templates / advanced analytics (master P3/P4)                  | PO                                                                  |

---

## 5. Explicit non-goals this note

- Supabase SQL / `shift_ops` migrations
- Cloudflare www / Pages / Coming Soon replace
- Company email ownership migrate
- Production deploy approve

Those live on `PENDING_WORK_BOARD.md` Tracks 2–4 / pre-launch bundle.

---

## 6. Key file pointers

| Kind                        | Path                                                                               |
| --------------------------- | ---------------------------------------------------------------------------------- |
| Finance placeholder         | `src/features/employer/planner/pages/EmployerPlannerFinancePlaceholderPage.tsx`    |
| Cancel TODOs                | `src/features/employer/planner/services/plannerCancel.service.ts` — **wired T1-3** |
| Broadcast TODOs             | `src/features/employer/planner/services/planBroadcast.service.ts` — **wired T1-3** |
| Retry queue                 | `src/shared/shift/shiftRetryQueue.ts` (`wm_retry_queue_v1`)                        |
| Roster detail               | `src/features/employer/planner/pages/EmployerPlannerRosterDetailPage.tsx`          |
| Master (§11–12 synced T1-5) | `01_SHIFT_DEMAND_PLANNER_MASTER_DOCUMENT.md` (v1.10)                               |
| V2 (locked off)             | `../second-update/04_PLANNER_WORKFORCE_INTELLIGENCE_V2.md`                         |

---

## 7. How to maintain (every Planner session)

1. Read this file first.
2. Work only on the current **PENDING** row (or re-order with Change log).
3. When a patch finishes: set Status = DONE, bump Last verified, add Change log line.
4. When something is newly deferred: add a **D-xx** row — never rely on chat memory.
5. Do not delete DEFERRED rows when done later — mark DONE + date in Change log.

---

## 8. Change log

| Date       | Who               | What changed                                                                                                                                                     |
| ---------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-26 | Leader + Cursor   | Created live note from Track 1 inventory. T1-1 Finance = NEXT.                                                                                                   |
| 2026-07-26 | Leader + Cursor   | **T1-1 DONE** — Finance placeholder polish + `planner-finance-placeholder.spec.ts` (2 PASS). Next = T1-2.                                                        |
| 2026-07-26 | Leader + Cursor   | **T1-2 DONE** — Roster detail stub-back→back; missing-plan empty; workspace/route/rtw e2e 6 PASS. Next = T1-3.                                                   |
| 2026-07-26 | Leader + Cursor   | **T1-3 DONE** — cancel/broadcast enqueue to wm_retry_queue_v1; unit 5 PASS. Next = T1-4.                                                                         |
| 2026-07-26 | Leader + Cursor   | **T1-4 DONE** — visual e2e browse + applications + finance (3 PASS). Next = T1-5.                                                                                |
| 2026-08-13 | Operator + Cursor | **P-LOC-1 DONE** — DemandPlan work area code; per-day blind counts via Shift radar kernel; employee browse fail-closed filter. D-05 bell/ranking still deferred. |
| 2026-08-19 | Operator + Cursor | **plannerGateApi** — client GET/POST/PATCH `/v1/jobmitra/employer/planner/plans` when AUTH_BACKEND_ENABLED; LS cache + fail-soft.                                |
