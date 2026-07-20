<!-- Cross-domain audit — backend foundation
Inherits: 00_MASTER_ENTERPRISE_AUDIT_TEMPLATE_v1.0.md
Supersedes: v1.0 decision table (decisions now LOCKED) -->

# DATA OWNERSHIP — ENTERPRISE AUDIT v1.1 (Cross-Domain)

## 1. Audit header

| Field                        | Value                                                                                        |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| **Domain**                   | Cross-domain — all launch-visible entities                                                   |
| **Audit version**            | v1.1                                                                                         |
| **Audit date**               | 2026-07-04                                                                                   |
| **Decision lock date**       | 2026-07-04                                                                                   |
| **Auditor**                  | Cursor Agent                                                                                 |
| **Approver**                 | **Product Owner — FINALIZED**                                                                |
| **Scope**                    | Shift Jobs, Career Jobs, Employment, Work Vault, Notifications, Profile, Planner (reference) |
| **Excluded**                 | Workforce Ops, HR, Manager Console, Admin                                                    |
| **Overall status**           | **PASS (decisions locked)**                                                                  |
| **Implementation**           | Deferred to Backend Architecture + migration phase                                           |
| **Backend Architecture doc** | **May begin** (implementation still BLOCKED)                                                 |

---

## 2. Executive summary

Product Owner has **finalized OWN-001 through OWN-008**. These rules are the **canonical ownership contract** for Backend Architecture Document and all future APIs.

Phase-0 code may still violate these rules locally — **that is accepted debt** until backend migration. No backend entity design may contradict this document.

---

## 3. LOCKED OWNERSHIP DECISIONS (Product Owner — Final)

### OWN-001 — Employment source of truth (Career only)

| Field                | Locked rule                                                                                                                                                                       |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Canonical record** | One server `Employment` row per hire (`employmentId`)                                                                                                                             |
| **Create trigger**   | `career.hire.confirmed_by_employer` **only after** `career.offer.accepted_by_employee`                                                                                            |
| **Lifecycle hook**   | `employment.lifecycle.created` fires **once**, idempotent, from hire confirm only                                                                                                 |
| **Phase-0 debt**     | `wm_career_employment_v1`, `wm_employment_lifecycle_v1`, `myStaff`, HR activate — **migrate into single Employment**; remove `careerEmploymentSideSyncService` at backend cutover |
| **Shift Jobs**       | **Never** creates Employment records (vault shift history only)                                                                                                                   |

### OWN-002 — Shift application ownership

| Field                  | Locked rule                                                                |
| ---------------------- | -------------------------------------------------------------------------- |
| **Pipeline state**     | **Company** owns (shortlist, waiting, confirm, reject, replace)            |
| **Submission payload** | **Employee** owns (profile snapshot, answers, notes at apply time)         |
| **Immutability**       | Employee cannot edit payload after submit; withdraw only while rules allow |
| **Server model**       | `ShiftApplication` owned by `companyId` + `employeeUserId`                 |

### OWN-003 — Career application ownership

| Field                  | Locked rule                                                     |
| ---------------------- | --------------------------------------------------------------- |
| **Pipeline state**     | **Company** owns (shortlist, interview, offer, reject, hire)    |
| **Submission payload** | **Employee** owns (cover note, screening answers at apply time) |
| **Offer details**      | **Company** owns once sent; employee accepts/declines only      |
| **Server model**       | `CareerApplication` owned by `companyId` + `employeeUserId`     |

### OWN-004 — Work Vault document ownership

| Field                    | Locked rule                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| **Document bytes**       | **Employee** owns always                                                                   |
| **Employer access**      | **Time-boxed grant** via OTP consent (`AccessGrant`); no permanent copy on employer device |
| **Shift/Career history** | **Employee** owns display copy; **system** writes summary on complete/resign events        |
| **Backend**              | Unify vault OTP + doc-access OTP into one `AccessGrant` service (DEC-012)                  |

### OWN-005 — Notification ownership

| Field               | Locked rule                                                     |
| ------------------- | --------------------------------------------------------------- |
| **Source of truth** | Server `NotificationEvent` per **recipient userId**             |
| **Device storage**  | Cache/sync only — not authoritative                             |
| **Pulse**           | Subset of events; same server event stream                      |
| **Domain tags**     | `shift` \| `career` \| `employment` — never mixed in one UI row |

### OWN-006 — Profile ownership

| Field                        | Locked rule                                       |
| ---------------------------- | ------------------------------------------------- |
| **Employee profile**         | **Employee user** owns; only employee can edit    |
| **Employer company profile** | **Company account** owns                          |
| **Cross-edit**               | Employers **cannot** edit employee profile fields |
| **WM ID**                    | Platform-issued; immutable after first save       |

### OWN-007 — GDPR / user delete (employee or employer account)

| Field                      | Locked rule                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------- |
| **Account delete request** | User-initiated; irreversible after 30-day grace                                       |
| **Cascade delete**         | Profile, vault documents, device caches, pending notifications                        |
| **Anonymize retain**       | Completed employment summaries, audit logs — **7 years** (configurable), PII stripped |
| **Active employment**      | Block delete until employment `completed` or legally transferred                      |
| **Applications in flight** | Auto-withdraw + anonymize applicant PII on employer-visible copies                    |

### OWN-008 — Company (employer) delete

| Field                  | Locked rule                                                                       |
| ---------------------- | --------------------------------------------------------------------------------- |
| **Trigger**            | Employer admin delete company account                                             |
| **Active posts**       | Archive (not hard delete); hidden from search                                     |
| **Applications**       | Freeze pipeline; notify employees via bell                                        |
| **Active employments** | **Block** company delete until all resolved (complete or transfer)                |
| **Grace period**       | 30 days soft-delete; restore allowed once                                         |
| **After grace**        | Hard delete company data; employee-owned vault and employment history per OWN-007 |

---

## 4. Entity matrix (post-decision)

| Entity                                | Canonical owner                                 | Status     |
| ------------------------------------- | ----------------------------------------------- | ---------- |
| User identity                         | Platform account                                | **LOCKED** |
| Employee profile                      | Employee user                                   | **LOCKED** |
| Employer profile                      | Company account                                 | **LOCKED** |
| Shift post / application / workspace  | Company (+ employee co-own application payload) | **LOCKED** |
| Career post / application / workspace | Company (+ employee co-own application payload) | **LOCKED** |
| Career offer                          | Company (on application)                        | **LOCKED** |
| Employment                            | Platform Employment row (Career hire only)      | **LOCKED** |
| Vault documents                       | Employee (+ time-boxed grant)                   | **LOCKED** |
| Notifications                         | Recipient user (server event)                   | **LOCKED** |
| Planner plan                          | Company                                         | **LOCKED** |

---

## 5. Retention (locked with OWN-007/008)

| Data class            | Retention                  |
| --------------------- | -------------------------- |
| Rejected applications | 12 months then anonymize   |
| Completed employment  | 7 years anonymized summary |
| Vault documents       | Until user deletes         |
| Notifications         | 90 days on server          |
| OTP / access grants   | 30 minutes session max     |

---

## 6. Backend entity tree (approved for Architecture doc)

```txt
PlatformUser
  ├── EmployeeProfile          (employee-owned)
  ├── EmployerCompany          (company-owned)
  │
  ├── ShiftPost
  │     └── ShiftApplication   (company pipeline + employee payload)
  │           └── ShiftWorkspace (company-owned session)
  │
  ├── CareerPost
  │     └── CareerApplication  (company pipeline + employee payload)
  │           └── CareerWorkspace (company + employee access)
  │
  ├── Employment               (ONE row — Career hire only)
  │     └── WorkDiary / Lifecycle events
  │
  ├── VaultFolder
  │     └── VaultDocument      (employee-owned)
  │           └── AccessGrant  (employer time-boxed)
  │
  └── NotificationEvent        (per recipient userId)
        └── PulseAction        (subset)
```

---

## 7. Golden rule checklist

| Rule                       | Met?                                             |
| -------------------------- | ------------------------------------------------ |
| Every entity has one owner | ✅ (locked)                                      |
| Delete scope defined       | ✅ OWN-007, OWN-008                              |
| Transfer rules defined     | ✅ (employment block on delete)                  |
| No duplicate SoT           | ✅ (Employment unified — implementation pending) |

**Overall: PASS (decisions locked)**

---

## 8. Product Owner final lock

| Role              | Status                                  | Date       |
| ----------------- | --------------------------------------- | ---------- |
| **Product Owner** | **☑ APPROVED — OWN-001..008 finalized** | 2026-07-04 |
| Architect         | ☑ Recorded                              | 2026-07-04 |
| Decision Maker    | ☐ Review                                |            |

**v1.0 FAIL superseded by v1.1 PASS (decisions).**

---

**Next step:** Write `HOSTING_BACKEND_DATABASE_/16_JOB_MITRA_BACKEND_ARCHITECTURE_v1.0.md` chapters — **no login/API implementation yet.** (Audit pointer: `architecture-audits/32_BACKEND_ARCHITECTURE_v1.0.md`)
