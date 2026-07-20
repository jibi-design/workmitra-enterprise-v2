<!-- App name: Job Mitra / WorkMitra Enterprise v2
File name: 25_CAREER_JOBS_ENTERPRISE_AUDIT_v1.0.md
Inherits: 00_MASTER_ENTERPRISE_AUDIT_TEMPLATE_v1.0.md -->

# CAREER JOBS — ENTERPRISE AUDIT v1.0

## 1. Audit header

| Field              | Value                                                                                                                                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Domain**         | Career Jobs (Employer + Employee — never Shift Jobs)                                                                                                                                                                     |
| **Audit version**  | v1.0                                                                                                                                                                                                                     |
| **Audit date**     | 2026-07-04                                                                                                                                                                                                               |
| **Auditor**        | Cursor Agent (code + doc evidence)                                                                                                                                                                                       |
| **Evidence**       | `src/features/**/careerJobs/**`, `tests/e2e/career-full-circuit.spec.ts`, `shared/03_CAREER_JOBS_ARCHITECTURE_FINAL_POSTING_SAFE.md`, `second-update/02_CAREER_OFFICIAL_HIRING_FLOW_V2.md`, `architecture-audits/24_...` |
| **Overall status** | **PARTIAL**                                                                                                                                                                                                              |
| **Domain grade**   | **B**                                                                                                                                                                                                                    |
| **Backend ready**  | **BLOCKED**                                                                                                                                                                                                              |

---

## 2. Executive summary (decision maker)

Career Jobs **works well as Phase-0 local demo**: post → apply → pipeline → offer → hire → workspace → employment. Robot test **career-full-circuit** passes.

**However, this domain cannot PASS enterprise audit yet** because:

1. **Hiring source of truth is not locked** — employer can mark hired from `offered` without employee offer-accept gate in app stage machine.
2. **Multiple employment records** can be created on hire (`myStaff`, `employmentLifecycle`, `employmentStorage`, `hrStorage`) — ownership not unified.
3. **V2 hiring document** (`second-update/02_CAREER_OFFICIAL_HIRING_FLOW_V2.md`) is **PO-approved** (2026-07-04 per Executive Master Decision) but **Phase-0 app code does not yet enforce** V2 hire gates — see §1.28 in architecture doc and §22 below.

**Recommendation:** Lock `02_CAREER_OFFICIAL_HIRING_FLOW_V2.md` Section 5.2 with Product Owner signatures **before** backend entity mapping.

---

## 3. Architecture Health (Career slice)

| Area              | Score | Notes                                                                 |
| ----------------- | ----- | --------------------------------------------------------------------- |
| UI / UX           | 88%   | Rich pipeline UI, modals, workspace; motion on other domains stronger |
| Business rules    | 75%   | Stage transitions exist; offer-accept vs hire race unresolved         |
| Documentation     | 72%   | Architecture doc + V2 hiring draft; audit was missing until now       |
| Backend readiness | 12%   | localStorage only; no server `CareerHireState`                        |
| Security          | 38%   | Role pick only; no employer verification gate on hire                 |
| Automation        | 60%   | E2E circuit; no close/reopen evidence sheet                           |
| Testing           | 88%   | Full circuit E2E; no negative-path E2E for hire race                  |
| Performance       | 78%   | Acceptable for Phase-0                                                |

**Career domain health (weighted): 74%**

---

## 4. KPI snapshot (Career)

| KPI                   | Value                                                      |
| --------------------- | ---------------------------------------------------------- |
| Primary routes        | 12+ (employer + employee)                                  |
| Core entities         | 6 (Post, Application, Offer, Workspace, Employment, Staff) |
| E2E coverage          | 1 full circuit spec                                        |
| Critical bugs open    | 0                                                          |
| P0 blockers           | 3 (this domain)                                            |
| Master doc references | 3+                                                         |

---

## 5. Release readiness (Career)

| Release                   | Status                 |
| ------------------------- | ---------------------- |
| Play Store demo (Phase-0) | **READY**              |
| Production backend        | **NOT READY**          |
| Enterprise launch         | **NOT READY**          |
| Documentation             | **PARTIAL**            |
| Testing                   | **READY** (happy path) |
| Security                  | **PARTIAL**            |

---

## 6. Layer 1 — Workflow Continuity Audit

| Screen / Route                               | Entry reason     | Success exit                | Back                 | Cancel           | Draft               | Resume          | Dead-end?        | Status      |
| -------------------------------------------- | ---------------- | --------------------------- | -------------------- | ---------------- | ------------------- | --------------- | ---------------- | ----------- |
| `/employer/career/create`                    | Post new job     | Dashboard or posts list     | Previous wizard step | Cancel → confirm | Save draft ✅       | Resume draft ✅ | No               | **PASS**    |
| `/employer/career/posts`                     | Manage posts     | Open dashboard              | Home                 | —                | —                   | —               | No               | **PASS**    |
| `/employer/career/post/:id`                  | Pipeline actions | Tab change / notice         | Posts list           | —                | —                   | —               | No               | **PASS**    |
| `/employer/career/post/:id/candidate/:appId` | Candidate detail | Action complete → dashboard | Dashboard            | —                | —                   | —               | No               | **PASS**    |
| `/employee/career/search`                    | Find jobs        | Post details                | Career home          | Clear filters    | Save search pref ✅ | —               | No               | **PASS**    |
| `/employee/career/post/:id`                  | Apply            | Success → search (1.2s)     | Search               | —                | —                   | —               | Weak exit        | **PARTIAL** |
| `/employee/career/applications`              | Track apps       | Workspace / details         | Career home          | —                | —                   | —               | No               | **PASS**    |
| `/employee/career/workspace/:id`             | Post-hire chat   | Employment / rating         | Applications         | —                | —                   | —               | No               | **PASS**    |
| Employment detail (offer)                    | Respond to offer | Accept/reject → employment  | Previous             | Modal cancel     | —                   | —               | HR path separate | **PARTIAL** |

**Findings:**

- Apply success navigates away quickly — acceptable but **in-place completion feel** differs from Shift quick-apply pattern.
- Offer accept on **Employment/HR card** vs employer **Hire** on dashboard — **two paths**; user may not understand order.

---

## 7. Layer 2 — Exception Flow Audit

| Scenario                           | Expected (enterprise)    | Phase-0 actual                                         | Status                        |
| ---------------------------------- | ------------------------ | ------------------------------------------------------ | ----------------------------- |
| No network                         | Queue + retry message    | Local works; no sync message                           | **PARTIAL**                   |
| Backend timeout                    | Graceful error           | N/A                                                    | **N/A**                       |
| Duplicate apply                    | Block second application | Blocked in `careerApplyService`                        | **PASS**                      |
| Duplicate submit (hire)            | Idempotent hire          | Partial guards in `activateCareerHire` (find existing) | **PARTIAL**                   |
| Employer deletes/closes post       | Apps handled             | Close post flows exist                                 | **PARTIAL** — verify evidence |
| Employee inactive                  | Block actions            | Not implemented                                        | **FAIL**                      |
| Company suspended                  | Block post/hire          | Not implemented                                        | **FAIL**                      |
| Storage write fail                 | User-visible error       | Some services toast/notice                             | **PARTIAL**                   |
| Invalid stage transition           | Block with message       | `canTransition` in `careerValidation.ts`               | **PASS**                      |
| Hire without valid offer details   | Block                    | `hireCandidate` checks `offerDetails`                  | **PASS**                      |
| Hire before employee accepts offer | **Block** (V2 rule)      | **Allowed** `offered → hired`                          | **FAIL**                      |

**Critical:** Code allows employer **Hire** when stage is `offered` without requiring employee `offer_accepted` state.

Evidence: `careerValidation.ts` — `offered: ["hired", ...]`; `hireCandidate()` in `careerOfferHireService.ts`.

---

## 8. Layer 3 — Permission Matrix Audit

Phase-0 uses **role pick**, not real auth.

| Action                    | Employee           | Employer              | Admin | HR     | Status      |
| ------------------------- | ------------------ | --------------------- | ----- | ------ | ----------- |
| View career search        | ✅                 | —                     | —     | —      | PASS        |
| Create career post        | —                  | ✅                    | dev   | hidden | PASS (demo) |
| Apply                     | ✅                 | —                     | —     | —      | PASS        |
| Shortlist / reject        | —                  | ✅                    | —     | —      | PASS        |
| Send offer                | —                  | ✅                    | —     | —      | PASS        |
| Accept/decline offer      | ✅ (employment/HR) | —                     | —     | —      | PARTIAL     |
| Mark hired                | —                  | ✅                    | —     | —      | PASS (demo) |
| View work vault review    | —                  | ✅                    | —     | —      | PASS        |
| Edit closed post pipeline | —                  | Blocked if not active | —     | —      | PASS        |

**Gap:** No fine-grained employer team permissions (multi-user company) — expected Phase-2.

---

## 9. Layer 4 — Lifecycle Audit

### 9.1 Career Job Post

```txt
draft → active → (paused | filled | closed) → archived/demo
```

| Transition          | Supported | Evidence                   | Status  |
| ------------------- | --------- | -------------------------- | ------- |
| Create draft        | ✅        | `EmployerCareerCreatePage` | PASS    |
| Publish             | ✅        | create flow                | PASS    |
| Mark filled on hire | ✅        | `hireCandidate`            | PASS    |
| Reopen filled post  | ⚠️        | Not verified               | PARTIAL |

### 9.2 Career Application

```txt
applied → shortlisted → interview → offered → hired
         ↘ rejected / withdrawn at several stages
```

| Transition        | Supported | Reverse?                      | Status      |
| ----------------- | --------- | ----------------------------- | ----------- |
| Stage machine     | ✅        | Limited remove-from-shortlist | PASS        |
| offered → hired   | ✅        | No                            | PASS (demo) |
| Employee withdraw | ✅        | —                             | PASS        |

### 9.3 Employment (after hire)

Created in `activateCareerHire` → multiple stores:

- `myStaffStorage`
- `employmentLifecycleStorage`
- `employmentStorage`
- `hrActivateFromCareerHire`

**Status: PARTIAL** — lifecycle exists but **not single canonical record**.

---

## 10. Layer 5 — Data Ownership Audit (P0)

| Entity               | Owner of record (today)                    | Who writes                    | Delete impact                  | Backend owner (proposed) | Status                     |
| -------------------- | ------------------------------------------ | ----------------------------- | ------------------------------ | ------------------------ | -------------------------- |
| CareerJobPost        | Employer (local)                           | `employer/careerJobs` storage | Apps orphaned? — verify        | Company account          | **PARTIAL**                |
| CareerApplication    | Shared (employer pipeline + employee copy) | `readCareerApps` / sync       | Withdraw removes stage         | Server `Application`     | **PARTIAL**                |
| Offer details        | Embedded in application                    | `sendOffer`                   | Lost if app deleted            | Server sub-resource      | **PARTIAL**                |
| Career workspace     | Employer+Employee                          | `careerWorkspaceService`      | Unknown cascade                | Server workspace         | **PARTIAL**                |
| Employment lifecycle | Employee device                            | `employmentLifecycleStorage`  | Manual only                    | Employee + company link  | **FAIL** — duplicate paths |
| HR candidate record  | Employer HR storage                        | `hrStorage.offer`             | Separate from career app stage | Must merge in V2         | **FAIL**                   |
| Staff record         | Employer                                   | `myStaffStorage`              | Separate                       | Company HRIS             | **PARTIAL**                |

### P0 ownership decisions required

| #   | Question                         | Proposed V2 answer (from doc 02)                                       | PO locked?                 |
| --- | -------------------------------- | ---------------------------------------------------------------------- | -------------------------- |
| 1   | Which event creates employment?  | `career.hire.confirmed_by_employer` after `offer.accepted_by_employee` | **NO**                     |
| 2   | Can employer hire before accept? | **Block**                                                              | **NO** — code still allows |
| 3   | Single employment record?        | One `employment.lifecycle.created` hook                                | **NO**                     |
| 4   | Who owns application after hire? | Company + employee read                                                | **NO**                     |
| 5   | GDPR delete scope                | TBD                                                                    | **NO**                     |

**Ownership layer: FAIL → Backend BLOCKED**

---

## 11. Layer 6 — Offline / Recovery Audit

| Event                         | Expected                | Phase-0                                           | Status                              |
| ----------------------------- | ----------------------- | ------------------------------------------------- | ----------------------------------- |
| Browser close / reopen        | Data persists locally   | localStorage                                      | **PARTIAL** — needs signed evidence |
| Refresh on apply              | No duplicate            | Guards exist                                      | **PASS**                            |
| Refresh on hire               | No duplicate employment | Partial idempotent checks in `activateCareerHire` | **PARTIAL**                         |
| Switch role employee↔employer | Isolated career state   | Domain separation                                 | **PASS**                            |

**P1:** Run manual close/reopen sheet on Career apply → offer → hire path.

---

## 12. Layer 7 — Automation Audit

| Step                   | Manual today         | Can automate           | Priority   | Status      |
| ---------------------- | -------------------- | ---------------------- | ---------- | ----------- |
| Interview schedule     | Manual modal         | Calendar sync          | P2         | PARTIAL     |
| Offer send             | Manual               | Template + AI draft    | P2         | Documented  |
| Pipeline tab moves     | Manual buttons       | Rule-based suggestions | P2         | Opportunity |
| Reject reason          | Manual               | AI assist              | P3         | Opportunity |
| Work vault review      | Manual               | OCR/summary            | P3         | Future      |
| Notify on stage change | Partial (pulse/bell) | Full event bus         | P1 backend | PARTIAL     |

---

## 13. Layer 8 — Future AI Readiness Audit

| Opportunity                 | Value for Career | Data available now        | Status                           |
| --------------------------- | ---------------- | ------------------------- | -------------------------------- |
| Candidate shortlist suggest | High             | Skills, screening answers | **READY for design**             |
| Salary range suggest        | Medium           | Post history local        | PARTIAL                          |
| Offer letter draft          | High             | Post + candidate profile  | **READY for design**             |
| Anomaly: duplicate hire     | High             | Need unified hire state   | **BLOCKED** until ownership PASS |
| Interview question suggest  | Medium           | Job description           | READY                            |

---

## 14. P0 blockers (Career domain)

| #   | Blocker                                                              | Owner               | Status   |
| --- | -------------------------------------------------------------------- | ------------------- | -------- |
| 1   | **Career Hiring Source of Truth** — lock V2 doc Section 5.2          | Product Owner       | **OPEN** |
| 2   | **Unify employment creation** — one canonical hook vs 4 stores       | Architect           | **OPEN** |
| 3   | **Block hire until offer accepted** (or PO approves override policy) | Product Owner + Dev | **OPEN** |

---

## 15. Risk register (Career)

| Risk                              | Severity   | Owner     | Status     | Mitigation                 |
| --------------------------------- | ---------- | --------- | ---------- | -------------------------- |
| Hire before employee accept       | **High**   | PO        | Open       | Lock V2 + code gate        |
| Duplicate employment records      | **High**   | Architect | Open       | Ownership audit + refactor |
| HR path vs Career path divergence | **Medium** | Architect | Open       | Single state machine       |
| Close/reopen data loss            | **Medium** | QA        | Pending    | Manual evidence            |
| Play Store overclaim on hiring    | **Medium** | PO        | Monitoring | Wording audit              |

---

## 16. Accepted technical debt (Career)

| Debt                                | Reason                                    | Target              |
| ----------------------------------- | ----------------------------------------- | ------------------- |
| localStorage only                   | Phase-0 demo                              | Backend phase       |
| V2 hiring gates not enforced in app | PO approved V2; code still dual-path hire | Before backend APIs |
| No employee-inactive guard          | Phase-0                                   | Backend auth        |
| Apply → navigate away UX            | Consistent with early design              | P2 UX               |
| Draft/preview/duplicate warning     | Doc 24 open questions                     | PO priority         |

---

## 17. Golden rule checklist (Career)

| Rule                             | Met?                     |
| -------------------------------- | ------------------------ |
| No dead-end screens              | ✅ Mostly                |
| Every screen has next action     | ⚠️ Apply exit weak       |
| Every entity has lifecycle       | ⚠️ Employment fragmented |
| Every entity has ownership       | ❌                       |
| Every action has permission      | ⚠️ Demo-level            |
| Every failure has recovery       | ⚠️ Partial               |
| Manual steps automation reviewed | ✅                       |
| AI opportunities documented      | ✅                       |

**Cannot PASS — Overall PARTIAL**

---

## 18. Backend gate (Career)

| Gate          | Result   |
| ------------- | -------- |
| Architecture  | PARTIAL  |
| Business      | PARTIAL  |
| Workflow      | PARTIAL  |
| **Ownership** | **FAIL** |
| Lifecycle     | PARTIAL  |
| Documentation | PARTIAL  |

## **Backend for Career Jobs = BLOCKED**

---

## 19. Evidence references

| Type            | Path                                                                       |
| --------------- | -------------------------------------------------------------------------- |
| E2E             | `tests/e2e/career-full-circuit.spec.ts`                                    |
| Hire activation | `src/features/employer/careerJobs/services/careerHireActivationService.ts` |
| Hire action     | `src/features/employer/careerJobs/services/careerOfferHireService.ts`      |
| Stage rules     | `src/features/employer/careerJobs/helpers/careerValidation.ts`             |
| V2 hiring draft | `workmitra-master-docs/second-update/02_CAREER_OFFICIAL_HIRING_FLOW_V2.md` |
| Gap summary     | `workmitra-master-docs/architecture-audits/24_...`                         |

---

## 20. Next steps (ordered)

1. **Product Owner:** Review and sign `02_CAREER_OFFICIAL_HIRING_FLOW_V2.md` Section 5.2 (Q1–Q6).
2. **Architect:** Produce Career **entity ownership diagram** (single page).
3. **QA:** Close/reopen evidence — apply, offer, hire on phone.
4. **Then:** Shift Jobs Enterprise Audit (same template).
5. **Do not start** Career backend APIs until Section 18 gates clear.

---

## 21. Final Lock — Product Owner sign-off

| Check                          | PO sign |
| ------------------------------ | ------- |
| P0 blockers understood         | ☐       |
| Ownership FAIL accepted        | ☐       |
| Backend BLOCKED acknowledged   | ☐       |
| V2 hiring doc review scheduled | ☐       |

**PO signature / date:** _______________

---

**Audit status: PARTIAL v1.0 — 2026-07-04**

---

## 22. Implementation Sync Appendix (Evidence: 2026-07-16)

Full inventory added to `shared/03_CAREER_JOBS_ARCHITECTURE_FINAL_POSTING_SAFE.md` **§1.28**.

### 22.1. Newly documented implemented features

| Feature                          | Status      | Was missing from docs   |
| -------------------------------- | ----------- | ----------------------- |
| Search Recent/Saved/Applied tabs | IMPLEMENTED | Yes                     |
| Interview rounds + RSVP          | IMPLEMENTED | Partial                 |
| Backup pipeline tab              | IMPLEMENTED | Yes                     |
| Work Vault review route          | IMPLEMENTED | Partial                 |
| Completed records pages          | IMPLEMENTED | Partial                 |
| `markAsJoined` after hire        | IMPLEMENTED | Confused with hire gate |

### 22.2. CRITICAL domain rule conflict (unchanged in code)

| Rule                                               | Target                          | Phase-0 code                                                   |
| -------------------------------------------------- | ------------------------------- | -------------------------------------------------------------- |
| Employment after offer → accept → employer confirm | Architecture §1.13–1.14, V2 doc | `activateCareerHire()` on accept **or** employer Mark as Hired |
| Intermediate `offer_accepted` stage                | Target                          | **NOT IMPLEMENTED**                                            |

### 22.3. Route table (live)

Most public Career route constants come from `routePaths.ts`; some nested route segments (including `/employee/career/workspaces` via `EC.careerWorkspaces`) are registered through `AppRouter.tsx` internal route constants. See Career architecture **§1.28.3** for the authoritative table (7 employee + 7 employer paths).

### 22.4. Documentation delta summary

| Classification                 | Count (representative)                                       |
| ------------------------------ | ------------------------------------------------------------ |
| IMPLEMENTED BUT NOT DOCUMENTED | 6+ features (see §22.1)                                      |
| DOCUMENTED BUT OUTDATED        | §1.10 target enums vs §1.28.6 live enums                     |
| DOMAIN RULE CONFLICT           | Employment creation gate                                     |
| DOCUMENTED AND CURRENT         | E2E circuit, pipeline tabs, localStorage keys (now in §1.28) |

**Audit refresh:** Documentation aligned with Phase-0 implementation. Backend **BLOCKED** until V2 gates enforced in code + ownership unified.
