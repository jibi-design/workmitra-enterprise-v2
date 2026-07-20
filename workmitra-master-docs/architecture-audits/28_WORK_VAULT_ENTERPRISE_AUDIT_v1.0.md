<!-- Inherits: 00_MASTER_ENTERPRISE_AUDIT_TEMPLATE_v1.0.md -->

# WORK VAULT — ENTERPRISE AUDIT v1.0

## 1. Audit header

| Field              | Value                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------- |
| **Domain**         | Work Vault (Employee-owned; Employer gated access)                                                        |
| **Audit version**  | v1.0                                                                                                      |
| **Audit date**     | 2026-07-04                                                                                                |
| **Auditor**        | Cursor Agent                                                                                              |
| **Evidence**       | `src/features/employee/workVault/**`, employer vault pages, `docAccessOtpService.ts`, `vaultConstants.ts` |
| **Overall status** | **PARTIAL**                                                                                               |
| **Domain grade**   | **B-**                                                                                                    |
| **Backend ready**  | **BLOCKED**                                                                                               |

---

## 2. Executive summary

Work Vault lets employees store documents; employers access via **OTP consent** (Phase-0 local demo). Shift and Career history are **separate keys** — good domain separation.

**PARTIAL because:** **two parallel OTP/session systems** (standalone vault vs in-flow doc-access); localStorage-only; no server audit trail; workforce aggregator still in code path (hidden at launch).

---

## 3. Architecture Health (Vault slice)

| Area              | Current | Target |
| ----------------- | ------- | ------ |
| UI / UX           | 85%     | 92%    |
| Business rules    | 80%     | 95%    |
| Documentation     | 75%     | 95%    |
| Backend readiness | 12%     | 100%   |
| Security          | 45%     | 95%    |
| Automation        | 50%     | 80%    |
| Testing           | 65%     | 90%    |
| Performance       | 78%     | 90%    |

**Vault domain health: 74%**

---

## 4. Routes

**Employee:** `/employee/vault`, `/folder/:id`, `/otp`, `/access-log`, `/edit-profile`

**Employer:** `/employer/vault`, `/employer/vault/view/:employeeId`

**In-flow (not standalone vault):**

- Shift: `.../document-access`
- Career: `.../work-vault-review`

---

## 5. Storage keys

| Key                                                 | Purpose                       |
| --------------------------------------------------- | ----------------------------- |
| `wm_employee_vault_folders_v1`                      | Folders                       |
| `wm_employee_vault_documents_v1`                    | Documents                     |
| `wm_employee_vault_otp_v1`                          | Vault OTP                     |
| `wm_employee_vault_sessions_v1`                     | Vault sessions                |
| `wm_employee_vault_access_log_v1`                   | Access log                    |
| `wm_vault_shift_history_v1`                         | Shift work history            |
| `wm_vault_career_history_v1`                        | Career work history           |
| `wm_doc_access_otp_v1` / `wm_doc_access_session_v1` | **Separate** doc-access stack |

---

## 6. OTP flows (P1 consolidation needed)

| System         | Used when                     | Service                  |
| -------------- | ----------------------------- | ------------------------ |
| Vault OTP      | Employer vault lookup         | `vaultOtpService.ts`     |
| Doc-access OTP | Shift/Career candidate review | `docAccessOtpService.ts` |

Both: 6-digit OTP, ~5 min validity, ~30 min session — **semantics overlap, implementation duplicated**.

**Status: PARTIAL**

---

## 7. Permission & ownership

| Rule                                   | Phase-0             | Status  |
| -------------------------------------- | ------------------- | ------- |
| Employee owns folders/docs             | Yes                 | PASS    |
| Employer needs OTP                     | Yes (demo)          | PASS    |
| Employer reads employee device storage | Single-browser demo | PARTIAL |
| GDPR delete scope                      | Undefined           | FAIL    |

---

## 8. E2E evidence

- `shift-full-circuit.spec.ts` — `wm_vault_shift_history_v1` finalized
- `career-full-circuit.spec.ts` — `wm_vault_career_history_v1` + experience section

---

## 9. P0 / P1 gaps

| Gap                                              | Priority |
| ------------------------------------------------ | -------- |
| Unify OTP/session architecture for backend       | P0       |
| Play Store wording — no fake secure vault claims | P1       |
| Remove workforce from aggregator at launch       | P1       |
| Close/reopen vault data evidence                 | P1       |

---

## 10. Backend gate

**Vault backend = BLOCKED** until ownership + security model PASS.

---

## 11. Final Lock

| PO sign | ☐ |

**Audit status: PARTIAL v1.0 — 2026-07-04**
