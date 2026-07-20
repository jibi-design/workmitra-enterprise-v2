<!-- App name: Job Mitra / WorkMitra Enterprise v2
File name: 00_MASTER_ENTERPRISE_AUDIT_TEMPLATE_v1.0.md
Purpose: Reusable enterprise audit standard for every domain -->

# MASTER ENTERPRISE AUDIT TEMPLATE — v1.0

## 1. Document Status

| Field       | Value                                                                                                       |
| ----------- | ----------------------------------------------------------------------------------------------------------- |
| Version     | **v1.0**                                                                                                    |
| Status      | **Locked template — use for all domain audits**                                                             |
| Applies to  | Shift Jobs, Career Jobs, Planner, Work Vault, Employment, Notifications, Auth/Backend, Workforce Ops, Admin |
| Quality bar | Match or exceed Planner master document audit depth                                                         |
| Coding gate | **No domain coding PASS → no backend for that domain**                                                      |

## 2. Golden Rules

### 2.1. Document PASS rule

A domain audit **cannot PASS** unless all are true:

- [ ] No dead-end screens
- [ ] Every screen has a defined next action
- [ ] Every core entity has a documented lifecycle
- [ ] Every core entity has documented ownership
- [ ] Every action has a permission rule
- [ ] Every failure path has recovery behavior
- [ ] Every manual step is evaluated for automation
- [ ] Future AI opportunities are documented

**If any item fails → Overall status = PARTIAL** (list accepted debt explicitly).

### 2.2. Backend gate rule

**Nothing enters backend implementation for a domain unless:**

| Gate                | Required                              |
| ------------------- | ------------------------------------- |
| Architecture        | PASS or PARTIAL with PO-approved debt |
| Business rules      | PASS                                  |
| Workflow continuity | PASS or PARTIAL with evidence plan    |
| Ownership           | **PASS** (no exceptions)              |
| Lifecycle           | PASS                                  |
| Documentation       | PASS or PARTIAL with lock date        |

**Otherwise: Backend for that domain = BLOCKED**

## 3. How to use this template

1. Copy sections 4–14 into a new file: `NN_<DOMAIN>_ENTERPRISE_AUDIT_v1.0.md`
2. Fill every table with evidence (file path, route, test name, or manual step)
3. Assign PASS / PARTIAL / FAIL per audit layer
4. List P0 blockers and P1 evidence gaps
5. Product Owner signs Final Lock section when ready

## 4. Audit header (copy per domain)

```txt
Domain:
Audit version:
Audit date:
Auditor:
Evidence sources: (routes, storage keys, E2E specs, master docs)
Overall status: PASS | PARTIAL | FAIL
Backend ready: YES | NO | BLOCKED
```

## 5. Layer 1 — Workflow Continuity Audit (P0)

For **each primary screen**, answer:

| Question                               | Required answer |
| -------------------------------------- | --------------- |
| Why did the user come here?            |                 |
| What completes this step?              |                 |
| What is the next screen after success? |                 |
| What happens on Back?                  |                 |
| What happens on Cancel?                |                 |
| Is draft save available?               |                 |
| Is resume later available?             |                 |
| Dead-end risk?                         | YES / NO        |

**Output table:**

| Screen / Route | Entry reason | Success exit | Back | Cancel | Draft | Resume | Dead-end? | Status |
| -------------- | ------------ | ------------ | ---- | ------ | ----- | ------ | --------- | ------ |

## 6. Layer 2 — Exception Flow Audit

| Scenario                   | Expected behavior | Implemented? | Evidence | Status |
| -------------------------- | ----------------- | ------------ | -------- | ------ |
| No network                 |                   |              |          |        |
| Backend timeout (future)   |                   |              |          |        |
| Duplicate submit           |                   |              |          |        |
| Employer deletes post      |                   |              |          |        |
| Employee account inactive  |                   |              |          |        |
| Company suspended          |                   |              |          |        |
| Storage quota / write fail |                   |              |          |        |
| Invalid state transition   |                   |              |          |        |

## 7. Layer 3 — Permission Matrix Audit

Roles to consider: Employee, Employer, Admin, HR, Manager, Future Supervisor.

| Page / Action | Employee | Employer | Admin | HR  | Manager | Notes | Status |
| ------------- | -------- | -------- | ----- | --- | ------- | ----- | ------ |
| View          |          |          |       |     |         |       |        |
| Create        |          |          |       |     |         |       |        |
| Edit          |          |          |       |     |         |       |        |
| Delete        |          |          |       |     |         |       |        |
| Approve       |          |          |       |     |         |       |        |
| Reject        |          |          |       |     |         |       |        |

## 8. Layer 4 — Lifecycle Audit

For each core entity, document:

```txt
Draft → Published → … → Archived
```

Include: reverse flows, reopen, cancel, withdraw, reject.

| Entity | States | Transitions allowed | Reverse? | Evidence | Status |
| ------ | ------ | ------------------- | -------- | -------- | ------ |

## 9. Layer 5 — Data Ownership Audit (P0 — backend foundation)

For each entity:

| Entity | Owner of record | Readers | Deleter | Transfer rules | GDPR note | Retention | Status |
| ------ | --------------- | ------- | ------- | -------------- | --------- | --------- | ------ |

**Backend blocked until this layer is PASS for domain-critical entities.**

## 10. Layer 6 — Offline / Recovery Audit

| Event           | Expected recovery | Implemented? | Evidence | Status |
| --------------- | ----------------- | ------------ | -------- | ------ |
| Internet lost   |                   |              |          |        |
| Page refresh    |                   |              |          |        |
| Browser close   |                   |              |          |        |
| Mobile app kill |                   |              |          |        |
| Role switch     |                   |              |          |        |

## 11. Layer 7 — Automation Audit

| Step today | Manual? | Can automate? | Priority | Target phase | Status |
| ---------- | ------- | ------------- | -------- | ------------ | ------ |

## 12. Layer 8 — Future AI Readiness Audit

| Opportunity | Suggest | Predict | Auto-fill | Recommend | Anomaly detect | Data needed | Status |
| ----------- | ------- | ------- | --------- | --------- | -------------- | ----------- | ------ |

## 13. Executive summary block (required)

### Architecture Health (domain slice)

| Area | Score % | Notes |
| ---- | ------- | ----- |

### P0 blockers (domain)

| # | Blocker | Owner | Status |

### Risk register (domain)

| Risk | Severity | Owner | Mitigation |

### Accepted technical debt (domain)

| Debt | Reason | Target release |

### Release readiness (domain)

| Release type | READY / PARTIAL / NOT READY |

## 14. Final Lock — Product Owner sign-off

| Check                     | PO sign |
| ------------------------- | ------- |
| No unresolved P0 blockers |         |
| Ownership layer PASS      |         |
| Backend gate satisfied    |         |
| Accepted debt listed      |         |

**PO signature / date:** _______________

---

## 15. Audit sequence (project-wide)

```txt
Master Enterprise Audit Template v1.0  ← this file
        ↓
Career Jobs Enterprise Audit v1.0
        ↓
Shift Jobs Enterprise Audit
        ↓
Employment Lifecycle Audit
        ↓
Data Ownership Audit (cross-domain)
        ↓
Backend Architecture
        ↓
Login / API
```

---

**Last updated:** 2026-07-04
