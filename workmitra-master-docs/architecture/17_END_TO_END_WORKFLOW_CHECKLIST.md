<!-- App name: WorkMitra / Job Mitra
File name: 17_END_TO_END_WORKFLOW_CHECKLIST.md
Full file path: D:\app\master document\JobMitra_Document_System_v1\17_END_TO_END_WORKFLOW_CHECKLIST.md -->

# 1. WORKMITRA / JOB MITRA — END-TO-END WORKFLOW CHECKLIST

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
- Mitra Labs Universal Working Agreement v3.1.2

## 1.2. Purpose

This document defines end-to-end workflow checklists for the launch-visible and implementation-relevant Job Mitra flows.

It helps verify that each feature is not only visible as UI, but works as a complete user journey.

This document is an implementation and QA bridge document.

It does not replace the architecture documents.

## 1.3. Core Principle

A feature is not complete just because a screen exists.

A workflow is complete only when:

1. User can start the flow.
2. User can complete the required action.
3. Data is saved correctly.
4. Correct role sees the correct result.
5. Wrong role is blocked.
6. Status changes correctly.
7. Related pages reflect the result.
8. Back navigation is safe.
9. App close/reopen continuity is verified where local/demo mode is used.
10. User-facing wording stays Play Store safe.

## 1.4. Workflow Status Labels

Use only these labels during implementation review:

- Not started
- UI only
- Local-working partial
- Local-working complete
- Backend-required
- Hidden/future only
- Blocked / unsafe

## 1.5. Verification Answer Labels

Use only these verification answers:

- Yes verified
- No
- Needs explicit verification
- Backend required
- Hidden/future only
- Not applicable

---

# 2. GLOBAL WORKFLOW CHECKLIST RULES

## 2.1. Role Rule

Every workflow must clearly state:

- actor role
- target role
- owning domain
- allowed action
- blocked action

## 2.2. State Rule

Every workflow must define:

- start state
- intermediate states
- final state
- blocked transitions
- visible status label

## 2.3. Storage Rule

For local/demo mode, verify:

- save works
- load works
- linked page reflects saved data
- browser/app close and reopen keeps data
- no fake backend claim is shown

## 2.4. Navigation Rule

Every workflow must verify:

- top back button
- phone/system back button
- back gesture
- bottom navigation return
- wrong-role back-stack prevention
- modal/bottom-sheet close behavior

## 2.5. Privacy Rule

Every workflow must verify:

- private data is not leaked
- Work Vault access is controlled
- hidden domain data is not visible
- Admin/HR/Manager/Workforce/Full Insights do not leak into launch UI

## 2.6. Play Store Safety Rule

Every workflow must verify that it does not claim:

- real OTP
- real payment
- real payroll
- real push/SMS/email
- real backend sync
- legal employment proof
- secure encrypted vault
- live GPS tracking
- official verification

unless implemented and reviewed.

---

# 3. SHIFT JOBS END-TO-END CHECKLIST

## 3.1. Shift Job Draft to Publish Flow

Actor:

- Employer

Checklist:

1. Employer opens Create Shift Job.
2. Employer enters partial details.
3. Employer can save as draft.
4. Draft is visible only to the employer.
5. Draft is not visible in employee Shift Jobs Discovery.
6. Employer can resume draft.
7. Missing required fields are clearly shown.
8. Local auto-save works where supported.
9. Unsaved back warning appears before data loss.
10. Employer can preview employee-facing job view.
11. Preview does not expose employer private notes or hidden data.
12. Duplicate Shift Job Warning appears when similar job exists.
13. Employer can review again or continue.
14. Publish confirmation appears before public visibility.
15. Published shift becomes visible to employees.
16. Draft state changes to published/application-open state.
17. Employer dashboard updates active/draft counts.
18. Phone back/back gesture does not publish accidentally.
19. App close/reopen keeps draft before publish.
20. No real backend sync claim is shown in local mode.

Required result:

```txt
Employer can safely create, save, resume, preview and publish a Shift Job without losing data or exposing draft jobs.
```

## 3.2. Shift Employee Discovery and Apply Flow

Actor:

- Employee

Checklist:

1. Employee opens Shift Jobs Discovery.
2. Published shift appears.
3. Draft shift does not appear.
4. Employee sees title, date/time, work type, location/work area and pay/rate reference where allowed.
5. Employee sees employer trust summary before applying.
6. Employee opens Shift Job Detail.
7. Employee sees full details and requirements.
8. Employee can apply / express interest.
9. Application state saves.
10. Employee sees Applied/Interested status.
11. Employer sees applicant/interested worker in own Shift Job Detail.
12. Other employees cannot see applicant list.
13. Wrong-role actions are blocked.
14. App close/reopen keeps application state where local/demo mode claims it.
15. Employee can return safely using phone back/back gesture.

Required result:

```txt
Employee can discover and apply to a published Shift Job, and Employer can see the correct applicant state.
```

## 3.3. Shift Shortlist, Selection and Standby Flow

Actor:

- Employer

Checklist:

1. Employer opens applicant list.
2. Employer sees only applicants for own Shift Job.
3. Employer can shortlist workers.
4. Employer can select required number of workers.
5. Employer can keep backup/standby workers.
6. Standby status is clearly different from selected.
7. Employee selected state is visible to the selected employee.
8. Standby state is visible only as standby, not confirmed.
9. Replacement preserves original worker history.
10. No-response and no-show are not mixed.
11. Employer cannot over-select without clear worker count logic.
12. Employee cannot see other workers.
13. Shift flow does not create Career lifecycle state.
14. Status updates reflect on Employer and Employee pages.

Required result:

```txt
Employer can shortlist, select and keep standby workers without mixing worker states or exposing other workers.
```

## 3.4. Shift Confirmation and Completion Flow

Actors:

- Employer
- Employee

Checklist:

1. Selected employee sees selection/response screen.
2. Employee can accept or decline where allowed.
3. Accepted state is saved.
4. Pre-shift confirmation appears where required.
5. Employer sees accepted / pending / declined state.
6. Employer can mark completed only after valid workflow state.
7. Employer can mark no-response only when worker did not respond.
8. Employer can mark no-show only after accepted/expected attendance state.
9. Completion state triggers rating where required.
10. Cancelled/disputed/no-show states do not create normal positive trust.
11. Shift completion does not create Career Employment Lifecycle.
12. App close/reopen keeps completion state where local/demo mode claims it.
13. Related dashboards update correctly.

Required result:

```txt
Shift can move from selected to accepted/confirmed/completed with correct rating unlock and no Career mixing.
```

---

# 4. CAREER JOBS END-TO-END CHECKLIST

## 4.1. Career Job Draft to Publish Flow

Actor:

- Employer

Checklist:

1. Employer opens Create Career Job.
2. Employer enters partial details.
3. Employer can save as draft.
4. Draft is owner-only.
5. Draft is not visible to employees.
6. Employer can resume draft.
7. Missing required fields are clearly shown.
8. Local auto-save works where supported.
9. Unsaved back warning protects form data.
10. Employer can preview employee-facing Career Job.
11. Preview hides employer private notes and hidden-domain data.
12. Duplicate Career Job Warning appears when similar active job exists.
13. Publish confirmation appears.
14. Published Career Job appears in employee Career Jobs Discovery.
15. Employer dashboard updates active/draft counts.
16. App close/reopen keeps draft before publish.
17. No backend/cloud claim is shown in local mode.

Required result:

```txt
Employer can safely create, save, resume, preview and publish a Career Job without data loss or accidental public exposure.
```

## 4.2. Career Employee Apply Flow

Actor:

- Employee

Checklist:

1. Employee opens Career Jobs Discovery.
2. Published Career Job appears.
3. Draft Career Job does not appear.
4. Employee sees employer trust before applying.
5. Employee opens Career Job Detail.
6. Employee sees simple requirements and eligibility questions.
7. CV upload is not mandatory.
8. Employee can answer basic eligibility questions.
9. Application strength indicator guides without shaming.
10. Employee submits application.
11. Application state saves.
12. Employee sees Applied status.
13. Employer sees applicant in own applicant pipeline.
14. Other applicants remain hidden.
15. App close/reopen keeps application state where local/demo mode claims it.

Required result:

```txt
Employee can apply to a Career Job using simple non-ATS workflow.
```

## 4.3. Career Applicant Review and Selection Flow

Actor:

- Employer

Checklist:

1. Employer opens Career Job Detail.
2. Employer sees applicant count.
3. Employer opens applicant pipeline.
4. Employer sees only applicants for own Career Job.
5. Employer can review applicant detail.
6. Simple Applicant Fit Score is advisory only.
7. Employer can shortlist applicant.
8. Employer can request discussion where needed.
9. Discussion status is visible to employee.
10. Employer can select applicant only from valid state.
11. Employer cannot auto-reject based only on score.
12. Employer cannot access private Work Vault documents without allowed sharing path.
13. Pipeline status updates on Employer and Employee pages.

Required result:

```txt
Employer can review and progress applicants without ATS-style automated hiring or privacy leakage.
```

## 4.4. Career Offer and Joined Flow

> **TARGET ARCHITECTURE CHECKLIST** — Items below describe the **approved target** hire/joined sequence. For **current Phase-0 implementation** results, see **§10.5.2**. Mandatory employer confirm-hire **before** employment record creation is **NOT IMPLEMENTED** in Phase-0 (`activateCareerHire` may run on accept or Mark as Hired).

Actors:

- Employer
- Employee

Checklist:

1. Employer can issue offer after valid selected state.
2. Employee sees offer clearly.
3. Employee can accept or decline.
4. Offer expiry/response deadline appears where used.
5. Offer accepted does not mean Joined.
6. Employer must confirm Joined after actual start.
7. Employee cannot self-confirm Joined.
8. Joined Pending state is clearly visible.
9. Joined confirmation creates valid Employment Lifecycle entry.
10. Wrong transition selected → working is blocked.
11. Related Application Detail and Lifecycle Detail update.
12. App close/reopen preserves state where local/demo mode claims it.

Required result (target architecture only):

```txt
Career flow protects Accept vs Joined and enters Employment Lifecycle only after valid employer confirmation.
```

Current Phase-0 implementation: employment-related records may be created at employee offer accept or employer Mark as Hired — **NOT IMPLEMENTED** for target confirm-hire-first gate (see §10.5.2).

---

# 5. EMPLOYMENT LIFECYCLE END-TO-END CHECKLIST

## 5.1. Lifecycle Entry Flow

> **TARGET ARCHITECTURE CHECKLIST** — Items below describe the **approved target** lifecycle entry (employer confirms Joined after employee accept). Current Phase-0 may create employment-related records at offer accept or Mark as Hired **without** this gate — see **§10.5.2** (**NOT IMPLEMENTED** for confirm-hire-first).

Actor:

- Employer

Checklist:

1. Career Job exists.
2. Employee was selected/offered.
3. Employee accepted where required.
4. Employer confirms Joined.
5. Employment Lifecycle record/state appears.
6. Lifecycle does not appear for Shift Jobs.
7. Employee sees own lifecycle status.
8. Employer sees only own lifecycle records.
9. Hidden HR Section does not appear.
10. Lifecycle does not claim legal employment proof.

Required result (target architecture only):

```txt
Employment Lifecycle starts only from valid Career Jobs path after employer confirms Joined.
```

Current Phase-0 implementation: employment-related records may appear at employee offer accept or employer Mark as Hired — **NOT IMPLEMENTED** for target confirm-hire-first gate (see §10.5.2).

## 5.2. Working to Notice / Resigned / Completed Flow

Actors:

- Employer
- Employee

Checklist:

1. Employee in working state can view status.
2. Employee can submit resignation where allowed.
3. Employer sees resignation/notice state.
4. Notice state is visible to employee.
5. Completion can occur after valid state.
6. Rating unlocks where required.
7. Force-complete appears only under allowed stuck/grace condition.
8. Completion state updates Work History confidence where allowed.
9. Lifecycle correction requires safe future review path.
10. Payroll/legal proof is not claimed.

Required result:

```txt
Lifecycle moves safely from Working to Notice/Resigned/Completed without becoming payroll or full HR.
```

---

# 6. WORK VAULT END-TO-END CHECKLIST

## 6.1. Employee Work Vault Setup Flow

Actor:

- Employee

Checklist:

1. Employee opens Work Vault.
2. Employee sees own WM ID/profile summary.
3. Employee can add/edit profile metadata.
4. Employee can add document metadata.
5. Employee can organize document/folder metadata.
6. Visibility state is clear.
7. Document readiness score updates where supported.
8. Data saves locally where local/demo mode claims it.
9. App close/reopen continuity is verified.
10. Employer cannot browse private Work Vault.
11. UI does not claim secure encrypted vault unless implemented.

Required result:

```txt
Employee can manage Work Vault metadata with privacy-safe wording.
```

## 6.2. Work Vault Sharing / Access Flow

Actors:

- Employee
- Employer

Checklist:

1. Employer requests or reaches allowed verification path.
2. Employee sees what is being shared.
3. Employee grants access only intentionally.
4. Employer sees only allowed shared summary/content.
5. Access has active/expired/revoked status where supported.
6. Employee can revoke access where supported.
7. Revoked access blocks future employer viewing.
8. Access history updates.
9. Other employers cannot view shared content.
10. Work Vault does not become employer document warehouse.
11. Backend required is marked for real cross-account enforcement.

Required result:

```txt
Work Vault sharing remains employee-controlled, scoped, revocable and privacy-safe.
```

---

# 7. EMPLOYER TRUST VISIBILITY CHECKLIST

## 7.1. Trust at Decision Points

Actor:

- Employee

Checklist:

1. Employer trust appears on Shift Job Card.
2. Employer trust appears on Shift Job Detail.
3. Employer trust appears before Shift accept/confirmation.
4. Employer trust appears on Career Job Card.
5. Employer trust appears on Career Job Detail.
6. Employer trust appears before Work Vault sharing.
7. Low-data/new-employer state is clearly shown.
8. Trust wording is calm and non-accusatory.
9. Hidden Admin risk notes are not visible.
10. No fraud-proof/legal verification claim is shown.

Required result:

```txt
Employee sees employer trust before important commitment actions.
```

## 7.2. Rating / Trust Unlock Flow

Actors:

- Employer
- Employee

Checklist:

1. Rating unlocks only after valid workflow completion.
2. Shift rating is tied to completed shift.
3. Career/lifecycle rating is tied to valid completion where required.
4. Employer cannot manually set own trust.
5. Employee cannot rate without valid completed context.
6. Cancelled/disputed/no-show cases do not create normal trust automatically.
7. Low-data state remains honest.
8. Trust update is local/demo or backend-supported as clearly labelled.

Required result:

```txt
Ratings and trust unlock only from valid workflow context.
```

---

# 8. NOTIFICATION WORKFLOW CHECKLIST

## 8.1. Local Notification Flow

Actors:

- Employer
- Employee

Checklist:

1. Notification has source domain.
2. Notification has target role.
3. Notification has target user/account where backend exists.
4. Notification has source record ID.
5. Notification has safe title/message.
6. Notification has action route.
7. Notification opens correct screen.
8. Read/unread state works.
9. Notification does not expose hidden domains.
10. Notification does not claim push/SMS/email in local mode.

Required result:

```txt
Notifications are role-safe, domain-safe and action-linked.
```

---

# 9. ROLE / SESSION / ROUTE CHECKLIST

## 9.1. Launch Role Selection Flow

Actors:

- Employer
- Employee

Checklist:

1. Landing page shows only Employer and Employee.
2. Hidden roles do not appear.
3. Selected role opens correct dashboard.
4. Employer dashboard does not show employee-only actions.
5. Employee dashboard does not show employer-only actions.
6. Wrong-role route is blocked.
7. Phone back does not return user to unsafe wrong-role page.
8. Future login/session migration path is respected.
9. Role state persists only as approved.
10. Logout/future session reset clears private navigation stack.

Required result:

```txt
Employer and Employee flows remain strictly separated.
```

---

# 10. LOCAL PERSISTENCE MINI-CHECK

Every local/demo workflow must verify:

1. Create/save action works.
2. List page reflects saved record.
3. Detail page opens saved record.
4. Detail page shows saved values.
5. App/browser close and reopen keeps record.
6. Related dashboard count/summary updates.
7. Delete/archive/cancel state works where supported.
8. No backend/cloud claim is shown.
9. Wording stays launch-safe.
10. Hidden domains do not appear.

Required result:

```txt
Local/demo feature behaves as real local-working feature, not hollow UI.
```

---

# 10.5. Implementation Verification Snapshot (2026-07-16)

Evidence from E2E specs and code review. Full inventories in architecture docs **§1.30** (Shift) and **§1.28** (Career).

## 10.5.1. Shift Jobs

| Workflow (§3)                    | E2E / evidence                                     | Verification label              |
| -------------------------------- | -------------------------------------------------- | ------------------------------- |
| §3.2 Apply flow                  | `tests/e2e/shift-full-circuit.spec.ts`             | **Yes verified**                |
| §3.3 Shortlist / confirm         | Same E2E                                           | **Yes verified**                |
| §3.4 Completion / rating / vault | Same E2E                                           | **Yes verified**                |
| §3.1 Draft/publish all steps     | Partial — drafts exist; continuous auto-save       | **Needs explicit verification** |
| Shift does not create Employment | Code review — no `activateCareerHire` in shiftJobs | **Yes verified**                |

## 10.5.2. Career Jobs

| Workflow (§4)                           | E2E / evidence                          | Verification label                                                                             |
| --------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------- |
| §4.2 Apply                              | `tests/e2e/career-full-circuit.spec.ts` | **Yes verified**                                                                               |
| §4.3 Pipeline shortlist/interview       | Same E2E                                | **Yes verified**                                                                               |
| §4.4 Offer accept                       | Same E2E — employment at accept         | **Yes verified** (demo behaviour)                                                              |
| §4.4 Employer confirm before employment | Architecture target                     | **NOT IMPLEMENTED** in Phase-0 — code may call `activateCareerHire` on accept or Mark as Hired |
| Recent/Saved/Applied search tabs        | Code — `EmployeeCareerSearchPage`       | **Yes verified** (manual smoke)                                                                |

---

# 11. FINAL WORKFLOW LOCK NOTE

> **IMPORTANT — TARGET RULE, NOT CURRENT PHASE-0 BEHAVIOUR** — Bullets below are approved architecture targets. Phase-0 Career hire timing (including employment record creation before mandatory employer confirm-hire) is documented in **§10.5.2** and Career architecture **§1.28.11** (CRITICAL).

This document is approved as the end-to-end workflow checklist.

Final locked decisions:

- A screen alone is not enough.
- Every launch-visible flow must complete a real user journey.
- Employer and Employee flows must remain separate.
- Shift Jobs and Career Jobs must remain separate.
- Work Vault must remain employee-controlled.
- Employer Trust must appear before commitment actions.
- Employment Lifecycle must start only from valid Career Jobs path.
- Notifications must be role-safe and action-linked.
- Local/demo workflows must pass save/load/reopen verification.
- Backend-required workflows must not be claimed as production-active before backend exists.
- Hidden/future domains must not leak into launch UI.

— END OF END-TO-END WORKFLOW CHECKLIST —
