<!-- Cross-domain audit — backend foundation
Inherits: 00_MASTER_ENTERPRISE_AUDIT_TEMPLATE_v1.0.md -->

> **SUPERSEDED by v1.1 (2026-07-04)** — Product Owner finalized OWN-001..008. See `30_DATA_OWNERSHIP_ENTERPRISE_AUDIT_v1.1.md`.

# DATA OWNERSHIP — ENTERPRISE AUDIT v1.0 (Cross-Domain)

## 1. Audit header

| Field              | Value                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------- |
| **Domain**         | Cross-domain — all launch-visible entities                                                   |
| **Audit version**  | v1.0                                                                                         |
| **Audit date**     | 2026-07-04                                                                                   |
| **Auditor**        | Cursor Agent                                                                                 |
| **Scope**          | Shift Jobs, Career Jobs, Employment, Work Vault, Notifications, Profile, Planner (reference) |
| **Excluded**       | Workforce Ops, HR, Manager Console, Admin                                                    |
| **Overall status** | **FAIL**                                                                                     |
| **Backend ready**  | **BLOCKED**                                                                                  |

---

## 2. Executive summary

This audit answers: **"Who owns each record when backend starts?"**

**Result: FAIL** — multiple entities have duplicate writers, ambiguous hire triggers, or cross-role localStorage bridges. **Backend cannot start** until P0 rows below are locked by Product Owner + Architect.

---

## 3. Entity ownership matrix

| Entity                   | Canonical owner (proposed) | Phase-0 writers                  | Storage key(s)                                                     | Delete impact         | Status   |
| ------------------------ | -------------------------- | -------------------------------- | ------------------------------------------------------------------ | --------------------- | -------- |
| **User identity**        | Platform account           | Role pick only                   | `roleStorage`, `wm-auth-storage` (unused)                          | Clears role           | **FAIL** |
| **Employee profile**     | Employee                   | Employee                         | `wm_employee_profile_v1`                                           | Apply blocks          | PARTIAL  |
| **Employer profile**     | Company account            | Employer                         | employer settings storage                                          | Posts orphan?         | PARTIAL  |
| **Shift post**           | Company                    | Employer                         | `wm_employer_shift_posts_v1`                                       | Apps remain           | PARTIAL  |
| **Shift application**    | Company + Employee         | Employee create; Employer status | `wm_employee_shift_applications_v1`                                | Pipeline breaks       | PARTIAL  |
| **Shift workspace**      | Company                    | Employer create                  | `wm_employee_shift_workspaces_v1`                                  | Chat lost             | PARTIAL  |
| **Career post**          | Company                    | Employer                         | career posts storage                                               | Apps remain           | PARTIAL  |
| **Career application**   | Company + Employee         | Both sides sync                  | career apps storage                                                | Pipeline breaks       | PARTIAL  |
| **Career offer**         | Embedded in application    | Employer send                    | application record                                                 | —                     | PARTIAL  |
| **Career workspace**     | Company + Employee         | Employer on hire                 | career workspace                                                   | Chat lost             | PARTIAL  |
| **Employment (Career)**  | **DISPUTED**               | Hire writes 4 stores             | `wm_career_employment_v1`, `wm_employment_lifecycle_v1`, staff, HR | Fragmented            | **FAIL** |
| **Vault folders/docs**   | Employee                   | Employee                         | `wm_employee_vault_*`                                              | Employer loses access | PARTIAL  |
| **Vault shift history**  | Employee (copy)            | Employer on complete             | `wm_vault_shift_history_v1`                                        | History gap           | PARTIAL  |
| **Vault career history** | Employee (copy)            | System on resign/complete        | `wm_vault_career_history_v1`                                       | History gap           | PARTIAL  |
| **Notification**         | Recipient user             | Event bridge                     | `wm_*_notifications_v1`                                            | UX only               | PARTIAL  |
| **Pulse trail**          | Recipient user             | Pulse store                      | `wm_pulse_*`                                                       | Navigation UX         | PARTIAL  |
| **Planner plan**         | Company                    | Employer                         | demand planner storage                                             | Shifts orphan         | PARTIAL  |

---

## 4. P0 ownership decisions (must lock)

| ID      | Decision               | Proposed rule                                                                          | PO locked? |
| ------- | ---------------------- | -------------------------------------------------------------------------------------- | ---------- |
| OWN-001 | Employment SoT         | Single `Employment` table; hire event = `career.hire.confirmed` after `offer.accepted` | ☐          |
| OWN-002 | Shift application SoT  | Company owns pipeline; employee owns submission payload                                | ☐          |
| OWN-003 | Career application SoT | Same pattern as shift                                                                  | ☐          |
| OWN-004 | Vault document SoT     | Employee owns bytes; company gets time-boxed grant via OTP                             | ☐          |
| OWN-005 | Notification SoT       | Server event log per user; device cache only                                           | ☐          |
| OWN-006 | Profile SoT            | User owns profile; company cannot edit employee profile                                | ☐          |
| OWN-007 | GDPR delete            | User delete cascades list TBD                                                          | ☐          |
| OWN-008 | Company delete         | Employer delete cascades posts/apps TBD                                                | ☐          |

---

## 5. Cross-domain bridge risks (Phase-0)

| Bridge                                     | Risk                                     | Mitigation         |
| ------------------------------------------ | ---------------------------------------- | ------------------ |
| `employerShift.employeeBridge.ts`          | Employer writes employee keys            | Replace with API   |
| `syncToEmployeeCareerSearch`               | Employer posts mirrored to employee read | Server read model  |
| `careerEmploymentSideSyncService`          | Dual employment sync                     | Remove after SoT   |
| `notifyCrossRole`                          | Local cross-role injection               | Server push        |
| Employer reads employee vault localStorage | Demo-only security                       | Server consent API |

---

## 6. GDPR / retention (placeholder)

| Data class              | Retention (proposed)   | Status      |
| ----------------------- | ---------------------- | ----------- |
| Applications (rejected) | 12 months              | NOT LOCKED  |
| Completed employment    | 7 years (configurable) | NOT LOCKED  |
| Vault documents         | Until user deletes     | NOT LOCKED  |
| Notifications           | 90 days                | NOT LOCKED  |
| OTP sessions            | 30 min                 | PASS (demo) |

---

## 7. Backend entity mapping (draft — not approved)

```txt
User
  ├── EmployeeProfile
  ├── EmployerCompany
  ├── ShiftPost → ShiftApplication → ShiftWorkspace
  ├── CareerPost → CareerApplication → CareerWorkspace
  ├── Employment (single SoT)
  ├── VaultFolder → VaultDocument → AccessGrant
  └── NotificationEvent → PulseAction (subset)
```

**Status: DRAFT — requires Architect + DBA sign-off (P0 blocker #4)**

---

## 8. Golden rule checklist

| Rule                       | Met? |
| -------------------------- | ---- |
| Every entity has one owner | ❌   |
| Delete scope defined       | ❌   |
| Transfer rules defined     | ❌   |
| No duplicate SoT           | ❌   |

**Overall: FAIL**

---

## 9. Required before backend

1. PO approves OWN-001 through OWN-008
2. Architect publishes ER diagram v1
3. Merge employment storage plan (see Employment audit §10)
4. Unify vault OTP architecture (see Vault audit §6)
5. Notification event bus contract update (doc 18)

---

## 10. Final Lock

| Decision Maker | ☐ |
| Product Owner | ☐ |
| Architect | ☐ |

**Audit status: FAIL v1.0 — 2026-07-04**  
_(FAIL is expected at this stage — resolves via decisions, not code)_
