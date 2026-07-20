<!-- App name: WorkMitra / Job Mitra
File name: 20_LOCAL_PERSISTENCE_VERIFICATION_MATRIX.md
Full file path: D:\app\master document\JobMitra_Document_System_v1\20_LOCAL_PERSISTENCE_VERIFICATION_MATRIX.md -->

# 1. WORKMITRA / JOB MITRA — LOCAL PERSISTENCE VERIFICATION MATRIX

## 1.1. Inherits From

This document inherits the Core Master Truth.

If this document conflicts with `01_CORE_MASTER_TRUTH.md`, Core Master Truth wins.

This document also follows:

- `00_DOCUMENT_INDEX_AND_SPLIT_MAP.md`
- `02_SHIFT_JOBS_ARCHITECTURE.md`
- `03_CAREER_JOBS_ARCHITECTURE.md`
- `04_WORK_VAULT_ARCHITECTURE.md`
- `05_EMPLOYER_TRUST_VISIBILITY.md`
- `06_EMPLOYMENT_LIFECYCLE.md`
- `12_CROSS_DOMAIN_SYSTEM_RULES.md`
- `13_UI_DESIGN_SYSTEM_RULES.md`
- `15_BACKEND_LOGIN_MASTER_DOCUMENT.md`
- `16_FEATURE_IMPLEMENTATION_PRIORITY_MAP.md`
- `17_END_TO_END_WORKFLOW_CHECKLIST.md`
- `18_NOTIFICATION_IMPLEMENTATION_CONTRACT.md`
- `19_ROLE_SESSION_ROUTE_GUARD_WORKFLOW.md`
- Mitra Labs Universal Working Agreement v3.1.2

## 1.2. Purpose

This document verifies whether launch-visible Phase-0/local features are real local-working features or only UI.

A feature must not be called launch-ready only because the screen exists.

This document checks:

- save
- load
- list reflection
- detail reflection
- app/browser close and reopen continuity
- linked page reflection
- role separation
- Play Store-safe wording

This document is a QA and implementation safety document.

It does not replace the product architecture documents.

## 1.3. Core Principle

Phase-0 local does not mean fake.

A local/demo feature is acceptable only when the user action works honestly on the device and the UI does not overclaim backend/server behavior.

A feature is not local-working complete unless app close/reopen continuity is verified.

## 1.4. Verification Labels

Use only these labels:

- Yes verified
- No
- Needs explicit verification
- Backend required
- Hidden/future only
- Not applicable

## 1.5. Final Feature Classification Labels

Use only these final labels:

- UI only
- Local-working partial
- Local-working complete
- Backend-required
- Hidden/future only
- Not launch-ready

## 1.6. Evidence Rule

Do not mark Yes verified unless there is real evidence.

Acceptable evidence:

- real device test
- browser/app close and reopen test
- visible saved record after reopen
- saved detail page opens after reopen
- linked page reflects saved data
- code inspection proving persistence path
- screenshot or screen recording where useful

Do not use:

- assumption
- “likely”
- “should”
- screen presence only
- intended future behavior

---

# 2. UNIVERSAL VERIFICATION MATRIX TEMPLATE

Use this matrix for every launch-visible feature.

| Check item                              | Verification                |
| --------------------------------------- | --------------------------- |
| Screen exists                           | Needs explicit verification |
| User can perform action                 | Needs explicit verification |
| Required validation works               | Needs explicit verification |
| Data saves locally                      | Needs explicit verification |
| List page reflects saved record         | Needs explicit verification |
| Detail page opens saved record          | Needs explicit verification |
| Detail page shows saved values          | Needs explicit verification |
| Related dashboard/card updates          | Needs explicit verification |
| App/browser close and reopen keeps data | Needs explicit verification |
| Wrong-role access blocked               | Needs explicit verification |
| Hidden/future UI not exposed            | Needs explicit verification |
| Play Store wording safe                 | Needs explicit verification |
| Final classification                    | Needs explicit verification |

---

# 3. SHIFT JOBS LOCAL PERSISTENCE MATRIX

> **2026-07-16 sync:** Storage keys and E2E-verified flows documented in `shared/02_SHIFT_JOBS_ARCHITECTURE_FINAL_POSTING_SAFE (1).md` §1.30.8. `shift-full-circuit.spec.ts` covers §3.3–3.4 persistence for apply → confirm → workspace → complete.

## 3.1. Shift Job Draft Save / Resume

| Check item                                  | Verification                |
| ------------------------------------------- | --------------------------- |
| Employer can open Create Shift Job          | Needs explicit verification |
| Employer can enter partial job details      | Needs explicit verification |
| Employer can save draft                     | Needs explicit verification |
| Draft appears in employer draft list        | Needs explicit verification |
| Draft does not appear in employee discovery | Needs explicit verification |
| Employer can reopen/resume draft            | Needs explicit verification |
| Saved values appear after resume            | Needs explicit verification |
| Draft survives app/browser close and reopen | Needs explicit verification |
| Draft remains owner-only                    | Needs explicit verification |
| No backend/cloud claim shown                | Needs explicit verification |
| Final classification                        | Needs explicit verification |

## 3.2. Shift Job Preview / Publish

| Check item                                        | Verification                |
| ------------------------------------------------- | --------------------------- |
| Employer can preview draft before publish         | Needs explicit verification |
| Preview shows employee-facing public-safe content | Needs explicit verification |
| Preview hides employer private notes              | Needs explicit verification |
| Duplicate warning appears when similar job exists | Needs explicit verification |
| Publish confirmation appears                      | Needs explicit verification |
| Job becomes visible after deliberate publish      | Needs explicit verification |
| Published job appears in employee discovery       | Needs explicit verification |
| Draft state changes to published state            | Needs explicit verification |
| Published state survives close/reopen             | Needs explicit verification |
| Phone back does not publish accidentally          | Needs explicit verification |
| Final classification                              | Needs explicit verification |

## 3.3. Shift Apply / Applicant Reflection

| Check item                                              | Verification                |
| ------------------------------------------------------- | --------------------------- |
| Employee can see published Shift Job                    | Needs explicit verification |
| Employee can apply / express interest                   | Needs explicit verification |
| Employee sees Applied/Interested status                 | Needs explicit verification |
| Employer sees applicant in own Shift Job detail         | Needs explicit verification |
| Other employees cannot see applicant list               | Needs explicit verification |
| Application state survives close/reopen                 | Needs explicit verification |
| Related notification/local alert appears if implemented | Needs explicit verification |
| Wrong-role actions blocked                              | Needs explicit verification |
| Final classification                                    | Needs explicit verification |

## 3.4. Shift Selection / Completion / Rating

| Check item                                        | Verification                |
| ------------------------------------------------- | --------------------------- |
| Employer can shortlist/select applicant           | Needs explicit verification |
| Selected employee sees selected status            | Needs explicit verification |
| Standby worker sees standby status, not selected  | Needs explicit verification |
| Employee can accept/decline where allowed         | Needs explicit verification |
| Employer sees response state                      | Needs explicit verification |
| Employer can mark completed only from valid state | Needs explicit verification |
| Rating unlocks only after completion              | Needs explicit verification |
| No-response and no-show remain separate           | Needs explicit verification |
| Shift does not create Career lifecycle record     | Needs explicit verification |
| State survives close/reopen                       | Needs explicit verification |
| Final classification                              | Needs explicit verification |

## 3.5. Shift E2E-Verified Persistence (2026-07-16)

| Check item                                     | Verification                                |
| ---------------------------------------------- | ------------------------------------------- |
| Apply → employer sees applicant                | Yes verified (`shift-full-circuit.spec.ts`) |
| Shortlist → confirm → workspace                | Yes verified (same E2E)                     |
| Complete → rating → vault history              | Yes verified (same E2E)                     |
| Application/workspace keys survive flow        | Yes verified (E2E uses localStorage bridge) |
| Shift does not write `wm_career_employment_v1` | Yes verified (code review)                  |

## 3.6. Shift local-only auxiliary persistence (2026-07-16)

| Key / module                                                                      | Label                                                              | Verification                                   |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------- |
| `wm_shift_availability_pulse_queue_v1` (`shiftAvailabilityPulseQueue.storage.ts`) | DEMO / LOCAL STORAGE ONLY                                          | Code present; E2E not required for pulse queue |
| `wm_employee_personal_calendar_shift_v1` (`personalCalendarShift.storage.ts`)     | DEMO / LOCAL STORAGE ONLY — Shift only; not Employment; not Career | Code present                                   |

---

# 4. CAREER JOBS LOCAL PERSISTENCE MATRIX

> **2026-07-16 sync:** Storage keys in `shared/03_CAREER_JOBS_ARCHITECTURE_FINAL_POSTING_SAFE.md` §1.28.10. `career-full-circuit.spec.ts` covers apply → offer → accept → workspace.

## 4.1. Career Job Draft Save / Resume

| Check item                                  | Verification                |
| ------------------------------------------- | --------------------------- |
| Employer can open Create Career Job         | Needs explicit verification |
| Employer can enter partial details          | Needs explicit verification |
| Employer can save draft                     | Needs explicit verification |
| Draft appears in employer draft list        | Needs explicit verification |
| Draft does not appear in employee discovery | Needs explicit verification |
| Employer can resume draft                   | Needs explicit verification |
| Saved values appear after resume            | Needs explicit verification |
| Draft survives close/reopen                 | Needs explicit verification |
| No backend/cloud claim shown                | Needs explicit verification |
| Final classification                        | Needs explicit verification |

## 4.2. Career Job Preview / Publish

| Check item                                         | Verification                |
| -------------------------------------------------- | --------------------------- |
| Employer can preview employee-facing job           | Needs explicit verification |
| Preview hides private employer notes               | Needs explicit verification |
| Duplicate warning appears when similar job exists  | Needs explicit verification |
| Publish confirmation appears                       | Needs explicit verification |
| Published Career Job appears in employee discovery | Needs explicit verification |
| Published status survives close/reopen             | Needs explicit verification |
| Employer dashboard active/draft count updates      | Needs explicit verification |
| Final classification                               | Needs explicit verification |

## 4.3. Career Application Flow

| Check item                                       | Verification                |
| ------------------------------------------------ | --------------------------- |
| Employee can open published Career Job           | Needs explicit verification |
| Employee can answer simple eligibility questions | Needs explicit verification |
| Employee can apply without professional CV       | Needs explicit verification |
| Application saves locally                        | Needs explicit verification |
| Employee sees Applied status                     | Needs explicit verification |
| Employer sees applicant in pipeline              | Needs explicit verification |
| Applicant detail opens saved application         | Needs explicit verification |
| Application survives close/reopen                | Needs explicit verification |
| Other applicants are hidden                      | Needs explicit verification |
| Final classification                             | Needs explicit verification |

## 4.4. Career Offer / Accept / Joined Pending

| Check item                                                | Verification                |
| --------------------------------------------------------- | --------------------------- |
| Employer can move valid applicant to selected/offer state | Needs explicit verification |
| Employee sees offer/update                                | Needs explicit verification |
| Employee can accept/decline where implemented             | Needs explicit verification |
| Offer accepted does not become Joined automatically       | Needs explicit verification |
| Joined Pending state appears before Joined                | Needs explicit verification |
| Employer confirms Joined only after valid accepted state  | Needs explicit verification |
| Employee cannot self-confirm Joined                       | Needs explicit verification |
| State survives close/reopen                               | Needs explicit verification |
| Final classification                                      | Needs explicit verification |

## 4.5. Career E2E-Verified Persistence (2026-07-16)

| Check item                                | Verification                                              |
| ----------------------------------------- | --------------------------------------------------------- |
| Apply → employer pipeline                 | Yes verified (`career-full-circuit.spec.ts`)              |
| Offer → employee accept → hired           | Yes verified (demo: employment at accept)                 |
| Workspace created after hire              | Yes verified (same E2E)                                   |
| Mark as joined (`selected` → `working`)   | Yes verified (same E2E step 8)                            |
| Employer confirm before employment exists | **NOT IMPLEMENTED** in Phase-0 (target architecture only) |

---

# 5. EMPLOYMENT LIFECYCLE LOCAL PERSISTENCE MATRIX

## 5.1. Lifecycle Entry

| Check item                                       | Verification                |
| ------------------------------------------------ | --------------------------- |
| Lifecycle starts only from valid Career Job path | Needs explicit verification |
| Lifecycle does not start from Shift Job          | Needs explicit verification |
| Employee sees own lifecycle status               | Needs explicit verification |
| Employer sees only own lifecycle records         | Needs explicit verification |
| Accept vs Joined distinction is visible          | Needs explicit verification |
| Hidden HR Section does not appear                | Needs explicit verification |
| Lifecycle state survives close/reopen            | Needs explicit verification |
| No legal employment proof claim shown            | Needs explicit verification |
| Final classification                             | Needs explicit verification |

## 5.2. Working / Notice / Resigned / Completed

| Check item                                                 | Verification                |
| ---------------------------------------------------------- | --------------------------- |
| Working state appears only after valid Joined confirmation | Needs explicit verification |
| Employee can submit resignation where allowed              | Needs explicit verification |
| Employer sees resignation/notice state                     | Needs explicit verification |
| Notice state appears clearly                               | Needs explicit verification |
| Completion can occur after valid state                     | Needs explicit verification |
| Force-complete appears only under allowed condition        | Needs explicit verification |
| Rating unlocks only after valid completion                 | Needs explicit verification |
| State survives close/reopen                                | Needs explicit verification |
| Payroll/legal claim is absent                              | Needs explicit verification |
| Final classification                                       | Needs explicit verification |

---

# 6. WORK VAULT LOCAL PERSISTENCE MATRIX

## 6.1. Work Vault Profile / Metadata

| Check item                                                | Verification                |
| --------------------------------------------------------- | --------------------------- |
| Employee opens Work Vault                                 | Needs explicit verification |
| Employee can edit profile metadata                        | Needs explicit verification |
| Employee can add document metadata                        | Needs explicit verification |
| Employee can organize folders/visibility labels           | Needs explicit verification |
| Data saves locally                                        | Needs explicit verification |
| Work Vault list reflects saved metadata                   | Needs explicit verification |
| Detail opens saved metadata                               | Needs explicit verification |
| Saved values survive close/reopen                         | Needs explicit verification |
| Employer cannot browse private Work Vault                 | Needs explicit verification |
| Secure/encrypted vault claim is absent unless implemented | Needs explicit verification |
| Final classification                                      | Needs explicit verification |

## 6.2. Work Vault Sharing / Access Demo

| Check item                                                            | Verification                |
| --------------------------------------------------------------------- | --------------------------- |
| Employee can see what is being shared                                 | Needs explicit verification |
| Employee can grant access where implemented                           | Needs explicit verification |
| Employer sees only selected shared summary/content                    | Needs explicit verification |
| Access active/expired/revoked label appears where supported           | Needs explicit verification |
| Employee can revoke access where supported                            | Needs explicit verification |
| Revoked access blocks future employer viewing                         | Needs explicit verification |
| Access history updates                                                | Needs explicit verification |
| State survives close/reopen                                           | Needs explicit verification |
| Backend required is clearly marked for real cross-account enforcement | Needs explicit verification |
| Final classification                                                  | Needs explicit verification |

---

# 7. EMPLOYER TRUST LOCAL PERSISTENCE MATRIX

## 7.1. Employer Trust Visibility

| Check item                                       | Verification                |
| ------------------------------------------------ | --------------------------- |
| Trust appears on Shift Job Card                  | Needs explicit verification |
| Trust appears on Shift Job Detail                | Needs explicit verification |
| Trust appears before Shift accept/confirmation   | Needs explicit verification |
| Trust appears on Career Job Card                 | Needs explicit verification |
| Trust appears on Career Job Detail               | Needs explicit verification |
| Trust appears before Work Vault sharing          | Needs explicit verification |
| Low-data/new-employer state appears where needed | Needs explicit verification |
| Wording is calm and non-accusatory               | Needs explicit verification |
| Hidden Admin risk notes are absent               | Needs explicit verification |
| Fraud/legal verification claim is absent         | Needs explicit verification |
| Final classification                             | Needs explicit verification |

## 7.2. Rating / Trust Update

| Check item                                                            | Verification                |
| --------------------------------------------------------------------- | --------------------------- |
| Rating unlocks only after valid completed workflow                    | Needs explicit verification |
| Shift rating is tied to completed Shift Job                           | Needs explicit verification |
| Career/lifecycle rating is tied to valid completion where implemented | Needs explicit verification |
| Rating saves locally where local mode claims it                       | Needs explicit verification |
| Trust/rating display updates after rating                             | Needs explicit verification |
| Rating state survives close/reopen                                    | Needs explicit verification |
| Employer cannot manually inflate own trust                            | Needs explicit verification |
| Final classification                                                  | Needs explicit verification |

---

# 8. NOTIFICATION LOCAL PERSISTENCE MATRIX

## 8.1. Local Notification List

| Check item                                            | Verification                |
| ----------------------------------------------------- | --------------------------- |
| Notification list opens                               | Needs explicit verification |
| Local notification can be created from supported flow | Needs explicit verification |
| Notification has title/message/source route           | Needs explicit verification |
| Notification opens correct route                      | Needs explicit verification |
| Read/unread state works                               | Needs explicit verification |
| Read/unread state survives close/reopen               | Needs explicit verification |
| Hidden-domain notification does not appear            | Needs explicit verification |
| Push/SMS/email claim is absent                        | Needs explicit verification |
| Final classification                                  | Needs explicit verification |

---

# 9. ROLE / SESSION / ROUTE LOCAL PERSISTENCE MATRIX

## 9.1. Role Selection Persistence

| Check item                                            | Verification                |
| ----------------------------------------------------- | --------------------------- |
| Landing shows only Employer and Employee              | Needs explicit verification |
| Employer selection opens Employer Home                | Needs explicit verification |
| Employee selection opens Employee Home                | Needs explicit verification |
| Active role persists as approved                      | Needs explicit verification |
| Role switch is explicit                               | Needs explicit verification |
| Role switch clears wrong-role route stack             | Needs explicit verification |
| Wrong-role route is blocked                           | Needs explicit verification |
| Hidden roles do not appear                            | Needs explicit verification |
| Back button does not return to unsafe wrong-role page | Needs explicit verification |
| Final classification                                  | Needs explicit verification |

## 9.2. Unsaved Form / Back Behavior

| Check item                                 | Verification                |
| ------------------------------------------ | --------------------------- |
| Create Shift Job unsaved warning works     | Needs explicit verification |
| Edit Shift Job unsaved warning works       | Needs explicit verification |
| Create Career Job unsaved warning works    | Needs explicit verification |
| Edit Career Job unsaved warning works      | Needs explicit verification |
| Work Vault edit unsaved warning works      | Needs explicit verification |
| Phone back follows safe priority order     | Needs explicit verification |
| Back gesture follows same safety rule      | Needs explicit verification |
| Modal/bottom sheet closes before page exit | Needs explicit verification |
| Final classification                       | Needs explicit verification |

---

# 10. DASHBOARD / LINKED PAGE REFLECTION MATRIX

## 10.1. Employer Dashboard Reflection

| Check item                                         | Verification                |
| -------------------------------------------------- | --------------------------- |
| Shift draft count reflects saved drafts            | Needs explicit verification |
| Published Shift Job appears as active              | Needs explicit verification |
| Shift applicant count updates                      | Needs explicit verification |
| Career draft count reflects saved drafts           | Needs explicit verification |
| Published Career Job appears as active             | Needs explicit verification |
| Career applicant count updates                     | Needs explicit verification |
| Pending joined confirmation appears where relevant | Needs explicit verification |
| Dashboard survives close/reopen with correct data  | Needs explicit verification |
| Hidden HR/Manager/Workforce cards do not appear    | Needs explicit verification |
| Final classification                               | Needs explicit verification |

## 10.2. Employee Dashboard Reflection

| Check item                                            | Verification                |
| ----------------------------------------------------- | --------------------------- |
| Applied Shift status appears                          | Needs explicit verification |
| Selected/standby Shift status appears correctly       | Needs explicit verification |
| Applied Career status appears                         | Needs explicit verification |
| Offer/lifecycle status appears where relevant         | Needs explicit verification |
| Work Vault readiness reflects saved metadata          | Needs explicit verification |
| Employer Trust reminders appear only where relevant   | Needs explicit verification |
| Dashboard survives close/reopen with correct data     | Needs explicit verification |
| Hidden Admin/HR/Manager/Workforce cards do not appear | Needs explicit verification |
| Final classification                                  | Needs explicit verification |

---

# 11. FINAL LOCAL PERSISTENCE CLASSIFICATION RULE

## 11.1. UI Only

Use `UI only` when:

- screen exists
- user action is missing
- data does not save
- saved record cannot reopen
- linked pages do not reflect data

## 11.2. Local-Working Partial

Use `Local-working partial` when:

- real user action exists
- data saves locally
- list/detail reflects in same session
- but close/reopen continuity is not verified or fails

## 11.3. Local-Working Complete

Use `Local-working complete` only when:

- real user action exists
- data saves locally
- list reflects saved record
- detail opens saved record
- detail shows saved values
- dashboard/linked page reflects correctly
- close/reopen continuity is verified
- wording is Play Store safe
- wrong-role/hidden-domain leakage is blocked

## 11.4. Backend-Required

Use `Backend-required` when:

- cross-account truth is required
- server ownership is required
- real notification delivery is required
- real Work Vault access enforcement is required
- real account deletion/session control is required
- local-only would mislead users

## 11.5. Not Launch-Ready

Use `Not launch-ready` when:

- feature is misleading
- feature is hollow UI
- feature overclaims backend/security/legal/payroll
- feature leaks hidden domains
- feature mixes roles/domains
- feature loses user data

---

# 12. FINAL LOCAL PERSISTENCE LOCK NOTE

This document is approved as the local persistence verification matrix.

Final locked decisions:

- Phase-0 local does not mean fake UI.
- A screen alone is not a completed feature.
- Save/load/reopen continuity must be verified before local-working complete.
- Linked list/detail/dashboard reflection must be checked.
- Employer and Employee data must remain separate.
- Shift Jobs and Career Jobs data must remain separate.
- Work Vault must remain employee-controlled.
- Hidden/future domains must not appear in launch UI.
- Backend-required behavior must not be claimed as local production truth.
- Play Store wording must match actual implemented behavior.
- This matrix must be used before declaring any launch-visible local/demo feature complete.

— END OF LOCAL PERSISTENCE VERIFICATION MATRIX —
