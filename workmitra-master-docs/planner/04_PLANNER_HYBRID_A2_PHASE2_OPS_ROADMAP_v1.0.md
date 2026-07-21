<!-- App name: WorkMitra / Job Mitra
File name: 04_PLANNER_HYBRID_A2_PHASE2_OPS_ROADMAP_v1.0.md
Full file path: C:\projects\WorkMitra_Enterprise_v2\workmitra-master-docs\planner\04_PLANNER_HYBRID_A2_PHASE2_OPS_ROADMAP_v1.0.md
Document version: v1.0 -->

# DEMAND PLANNER — HYBRID A2 PHASE-2 OPS & TRUST HARDENING ROADMAP (v1.0)

## 1. Document Status

| Field         | Value                                                                                                 |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| Status        | **COMPLETE — Phase-2 Ops & Trust Hardening (P2.0–P2.5 RTW; optional snapshot deferred)**              |
| Depends on    | Phase-1 complete (`03_…PHASE1…`, tag `v1.0.0-planner-hybrida2-p1`)                                    |
| Strategy      | Ops & Trust Hardening on Hybrid A2 baseline                                                           |
| Out of scope  | V2 forecasting / Auto Planner / scenario AI (`second-update/04_PLANNER_WORKFORCE_INTELLIGENCE_V2.md`) |
| Domain lock   | Doc 02 — Planner never becomes Shift/Career/HR execution                                              |
| Zero Dead-End | Binding                                                                                               |
| Pulse vs Bell | Pulse = action-required only; Bell = information-only                                                 |

---

## 2. Phase-2 Mission (Frozen)

```txt
Phase-2 makes Hybrid A2 trustworthy under multi-tab agency use:
  Deep Audit Trails  →  who changed what, plan-scoped, exportable
  Concurrency Locks  →  no silent overwrite / double approve / double publish
  Real-time Escalations → understaff, no-show, publish failure (Bell + Pulse)
  RTW Expiry Safeguard → lightweight Visa / Right-to-Work tracker (not NMC clinical)
```

Legal entity remains reputation / audit actor subject.  
`siteManagerId` / site = telemetry metadata only (same as Phase-1 S6).

---

## 3. Strict Execution Model

1. Work **one section at a time** (P2.0 → P2.5).
2. Section exit: clean build, no orphan imports, section tests PASS.
3. Progress report + user validation before next section production code.
4. Do not start V2 intelligence features from this roadmap.

---

## 4. Section Breakdown

| Section  | Roadmap ID              | Scope                                                                              |
| -------- | ----------------------- | ---------------------------------------------------------------------------------- |
| **P2.0** | Scope freeze            | This document + index link; non-goals locked                                       |
| **P2.1** | Deep Audit Trails       | `wm_planner_audit_log_v1` (200/plan FIFO), wire events, Activity UI, CSV export    |
| **P2.2** | Concurrency Locks       | Optimistic `updatedAt`, publish lock tokens, `planApplyBatchId` tab/session dedupe |
| **P2.3** | Escalation registry     | Planner-scoped Bell/Pulse mapping + registry (no spam)                             |
| **P2.4** | Escalation triggers     | Understaff risk, no-show / miss check-in, publish failure                          |
| **P2.5** | RTW + optional snapshot | Visa / Right-to-Work expiry tracker; optional plan snapshot bridge                 |

---

## 5. Non-Goals (Explicit)

- Seasonal forecast, Auto Planner, what-if scenarios, sales/weather models
- Clinical NMC / PIN / professional registration engines
- Admin domain audit mixing (`wm_admin_audit_log_v1` stays separate)
- Career / Employment diary writes from planner escalations
- Distributed DB locks (those wait Planner Service / server truth)
- Full-card blinking, text dimming, right-edge pulse lights

---

## 6. Zero Dead-End Acceptance (Every Section)

- [ ] Every new/changed surface has Back + empty-state CTA
- [ ] No new soft-wrappers under `/planner/*`
- [ ] Modals: primary + dismiss with known route
- [ ] Escalations map to `nextAction` / `nextRoute` when Pulse
- [ ] Section Vitest / Playwright PASS
- [ ] `npm run build` PASS

---

## 7. Section Detail

### P2.0 — Scope freeze — DONE (this document)

- Roadmap filed; index updated
- Pillars and non-goals frozen for implementation

### P2.1 — Deep Audit Trails

**Storage:** `wm_planner_audit_log_v1`

```ts
type PlannerAuditAction =
  | "draft_saved"
  | "published"
  | "publish_failed"
  | "cancelled"
  | "batch_approved"
  | "batch_rejected"
  | "native_confirmed"
  | "crew_broadcast"
  | "plan_completed"
  | "edit_unfilled_slot"
  | "rtw_flagged"; // reserved for P2.5

type PlannerAuditEntry = {
  id: string;
  planId: string;
  at: number;
  actor: "employer" | "system";
  actorMlId?: string; // legal entity when known
  siteManagerId?: string; // telemetry only
  action: PlannerAuditAction;
  summary: string;
  meta?: Record<string, string | number | boolean>;
};
```

**Rules:** Cap **200 entries per planId** (FIFO trim). Employer-visible only. Not Admin.

**Must log (P2.1):** publish (incl. wind-down / zero child posts), publish_failed, cancel, batch approve/reject, native confirm.

**UI:** Plan Detail → Activity panel (collapsible). Empty: `No activity yet. Publish your plan to start tracking.`

**CSV:** Export plan-scoped audit for agencies (filename includes planId + date).

**Exit:** Vitest FIFO + action coverage; Playwright Activity smoke; build PASS.

### P2.2 — Concurrency Locks — COMPLETE

- Optimistic concurrency on `updatePlan` via `expectedUpdatedAt` (stale → Reload CTA)
- Publish lock token (tab/session); only holder completes publish
- `planApplyBatchId` dedupe across tabs/sessions (ignore duplicate approve/apply)
- Multi-tab: `storage` / BroadcastChannel notify of plan changes
- Post–S8: locks key on `planId` / `slotId` / `planApplyBatchId` (not Shift `postId`)
- Shared module: `src/features/shared/planner/services/plannerConcurrency.service.ts`

**Exit:** Vitest race cases; dual-tab Playwright; build PASS.

### P2.3 — Escalation registry — COMPLETE

- Central planner escalation catalog (id, severity, channel, nextRoute)
- Bell = info; Pulse = action-required with left-edge only (card) / button halo
- Components use PulseNode / PulseTarget only (enforced by catalog `pulseSurface`)
- Module: `src/features/shared/planner/plannerEscalationRegistry.ts`
- **No live triggers in P2.3** (understaff / no-show / publish fail → P2.4)

**Exit:** Unit registry contract; no Career/Admin mix; build PASS.

### P2.4 — Escalation triggers — COMPLETE

| Trigger                 | Channel                  | Notes                               |
| ----------------------- | ------------------------ | ----------------------------------- |
| Understaff risk         | Bell (+ Pulse if action) | Open slots near start / fill % drop |
| No-show / miss check-in | Pulse on roster          | Via Execution Port ledger           |
| Publish failure         | Bell + audit             | `publishStatus: failed`             |

- Service: `src/features/shared/planner/services/plannerEscalationTriggers.service.ts`
- Roster `PulseTargetCard` on understaff / no-show cards
- Publish fail bell from submit catch (audit already P2.1)

**Exit:** Smoke E2E; Pulse contract; build PASS.

### P2.5 — RTW expiry safeguard (+ optional snapshot) — COMPLETE (RTW only)

**RTW (in scope):** Lightweight, configurable Visa / Right-to-Work expiry tracker for workers on planner roster — warn before expiry; audit `rtw_flagged`; never a clinical NMC engine.

- Storage: `wm_planner_rtw_tracker_v1` (`plannerRtw.storage.ts`)
- Service: `plannerRtw.service.ts` — detect / fire Bell+Pulse / audit
- Roster detail: warn-days setting, expiry editor, badge, `PulseTargetCard`

**Optional snapshot:** Not implemented (requires separate PO confirm).

**Exit:** Storage + roster badge/warn + audit hook; build PASS.

---

## 8. Section status

| Section                       | Status                                                 |
| ----------------------------- | ------------------------------------------------------ |
| **P2.0** Scope freeze         | **COMPLETE** (2026-07-21)                              |
| **P2.1** Deep Audit Trails    | **COMPLETE** (2026-07-21)                              |
| **P2.2** Concurrency Locks    | **COMPLETE** (2026-07-21)                              |
| **P2.3** Escalation registry  | **COMPLETE** (2026-07-21)                              |
| **P2.4** Escalation triggers  | **COMPLETE** (2026-07-21)                              |
| **P2.5** RTW expiry safeguard | **COMPLETE** (2026-07-21) — optional snapshot deferred |

### P2.1 exit criteria — DONE

- `wm_planner_audit_log_v1` with 200/plan FIFO
- Wired: published, publish_failed, cancelled, batch_approved/rejected, native_confirmed, crew_broadcast
- Plan Detail Activity panel + CSV export
- Vitest + Playwright Activity smoke + `npm run build` PASS

### P2.2 exit criteria — DONE

- `updatePlan` returns `UpdatePlanResult`; stale → Reload CTA on wizard
- Publish lock + batch action lock + `planApplyBatchId` seen set (shared/planner)
- Vitest race cases + dual-tab Playwright + `npm run build` PASS

### P2.3 exit criteria — DONE

- Catalog: understaff, no-show, publish_failed, plan_cancelled (legacy), rtw_expiring (P2.5 reserved)
- Pulse entries require `nextAction` / `nextRoute` / `pulseNodeId` / `pulseSurface`
- Bell-only for publish_failed (no pulse spam)
- Vitest registry contract (no Career/Admin mix) + `npm run build` PASS

### P2.4 exit criteria — DONE

- Triggers service: detect + fire understaff / no-show / publish_failed (deduped)
- Roster PulseTargetCard (left-edge) for understaff + no-show
- Publish fail → employer shift Bell (GROUP_UPDATE) + existing audit
- Vitest + Playwright smoke + `npm run build` PASS

### P2.5 exit criteria — DONE

- `wm_planner_rtw_tracker_v1` with configurable `warnDaysBefore` (default 30)
- Roster badge + expiry editor; audit `rtw_flagged` (meta `notNmcClinical: true`)
- Catalog `PLANNER_RTW_EXPIRING` Bell + Pulse
- Vitest + Playwright smoke + `npm run build` PASS
- Optional plan snapshot: deferred (PO confirm required)

---

## 9. Version History

| Version | Date       | Summary                                                          |
| ------- | ---------- | ---------------------------------------------------------------- |
| v1.0    | 2026-07-21 | Board Phase-2 Ops & Trust Hardening roadmap (P2.0–P2.5)          |
| v1.0    | 2026-07-21 | P2.0–P2.5 implemented; RTW live; optional plan snapshot deferred |
