# 24 — Advanced Feature Gap Audit and Backend-Ready List

**App:** Job Mitra / WorkMitra Enterprise v2  
**Document status:** Current advanced feature gap summary  
**Standard:** Enterprise-grade audit discipline  
**Implementation status:** No code changes from this document yet

---

## 1. Final Decision

This document is approved as the current Job Mitra advanced feature and document-gap summary.

It is not a code implementation plan yet. The next step is feature priority decision, close/reopen verification planning, and backend/auth readiness planning.

---

## 2. Audit Scope

This audit covers:

1. Missing advanced features
2. Document gaps
3. Backend/auth readiness gaps
4. Local-working partial gaps
5. Close/reopen verification gaps
6. Future ecosystem roadmap dependencies
7. Production-risk wording boundaries

---

## 3. Scope Exclusion

Hidden/future domain visibility cleanup is intentionally skipped in this audit.

It will be handled separately before the next final Play Store upload or production update.

**Mandatory reminder:** Hidden/future dashboard exposure audit must be completed before any Play Store update.

This includes checking HR Management, Manager Console, Workforce Ops Hub, Full Insights, Admin, and any other hidden/future domain exposure according to the master documents.

---

## 4. Priority Labels

Use these labels for all gap decisions:

- **P0:** Must decide before backend/auth
- **P1:** Must verify before next Play Store update
- **P2:** Future ecosystem / later phase
- **Wording:** Play Store-safe wording cleanup
- **Evidence:** Required live verification evidence
- **Debt:** Accepted technical debt for now

---

## 5. Audited Domains

1. Shift Jobs
2. Career Jobs
3. Work Vault
4. Notifications
5. Employment Lifecycle
6. Workforce Ops
7. HR Management
8. Manager Console

Admin was skipped by decision. Admin is currently basic owner-review level and should be audited last. Admin must remain hidden/basic owner-review and must not block current backend/auth planning unless admin routes/cards become visible in production-facing UI.

Admin full audit remains pending and must be completed before Admin becomes launch-visible or production-facing.

---

## 6. Shift Jobs Gaps

**Current status:** Local-working partial.

**Confirmed direction:** Shift Jobs has strong local UI/workflow coverage for employer post creation, application handling, shortlist/waiting/confirmed flows, employee search/apply flow, and local status handling.

**Missing / risk items:**

1. Save Draft
2. Resume Draft
3. Preview Before Publish
4. Duplicate Shift Job Warning
5. Incomplete Draft Reminder
6. Rating unlock end-to-end verification
7. Close/reopen verification

**Classification:** P0 / P1 / Evidence

**Decision:** Draft, preview, and duplicate-warning features should be documented as important advanced gaps. Implementation priority must be decided before backend/auth, but coding should not start until feature priority is locked.

---

## 7. Career Jobs Gaps

**Current status:** Local-working partial.

**Confirmed direction:** Career Jobs has strong local UI/workflow coverage for employer post creation, candidate pipeline, interview scheduling, offer, hire action, employee search/apply, application tracking, offer accept/decline, and local stage handling.

**Missing / risk items:**

1. Save Draft
2. Resume Draft
3. Preview Before Publish
4. Duplicate Career Job Warning
5. Incomplete Draft Reminder
6. Official hiring flow source of truth
7. Close/reopen verification

**Classification:** P0 / P1 / Evidence

**High-priority blocker before backend/auth:** Career official hiring flow source of truth.

**Decision needed later:**

1. Which action creates the final employment record?
2. What happens if employee accepts but employer has not marked joined?
3. What happens if employer marks hired before employee accepts?
4. Which flow triggers Employment Lifecycle?
5. Which flow creates notifications?
6. Which flow becomes backend source of truth?

---

## 8. Work Vault Gaps

**Current status:** Local-working partial with strong local access-control foundation.

**Confirmed direction:** Work Vault has local folder/document handling, local access-code generation, local access session, visible-folder filtering, revoke/expiry behavior, and access history.

**Missing / risk items:**

1. “OTP” wording should become “local access code.”
2. No secure/encrypted/cloud/legal verification claim should be made.
3. Employer access is local demo only until backend/auth.
4. Close/reopen verification is required.

**Classification:** Wording / P1 / Evidence

**Safe wording:** local access code, local document access, local demo access session.

**Do not claim:** real OTP, secure encrypted vault, backend verification, legal verification, cloud sync, cross-device account continuity.

---

## 9. Notifications Gaps

**Current status:** Local-working partial.

**Confirmed direction:** Employee and employer notifications have local in-app notification storage, unread/read handling, delete, clear all, auto-cleanup, domain filters, and event-based local creation.

**Missing / risk items:**

1. Notifications are local in-app only.
2. No real push notification claim.
3. No SMS/email notification claim.
4. Backend notification ownership model needed later.
5. Hidden/future notification categories must be checked in the separate launch-boundary audit before upload.

**Classification:** Backend/auth required / Wording / P1

---

## 10. Employment Lifecycle Gaps

**Current status:** Local-working partial / bridge exists.

**Confirmed direction:** Employer hire action creates Career workspace, marks post as filled, adds staff, creates Employment Lifecycle record, creates shared employment record, and sends employee hire notification.

**Missing / risk items:**

1. Employee accept-offer flow and employer hire flow are not yet one clean official backend-ready flow.
2. Employee Employment still reads HR-related data directly.
3. Boundary cleanup is needed during backend/auth.
4. Close/reopen verification is required.

**Classification:** P0 / Backend/auth required / Evidence

**High priority:** Official Career hiring flow source of truth must be locked before backend/auth coding.

---

## 11. Workforce Ops Gaps

**Current status:** Local-working partial / temporary-visible domain.

**Correct wording:** Strong local workflow appears to exist; final classification depends on live close/reopen verification.

**Confirmed direction:** Workforce Ops has local staff, categories, announcements, applications, groups, quick groups, templates, activity logs, employee staff detection, visible announcements, active groups, and timesheet reading.

**Missing / risk items:**

1. Close/reopen verification is required.
2. Some files show encoding corruption characters and need UI/text cleanup.
3. Shared localStorage reads must become role-safe backend APIs later.
4. Launch visibility must be handled in the separate pre-upload launch-boundary audit.

**Classification:** Evidence / Backend/auth required / Wording / P1

---

## 12. HR Management Gaps

**Current status:** Local-working partial / temporary-visible domain.

**Correct wording:** Strong local workflow appears to exist; final classification depends on live close/reopen verification.

**Confirmed direction:** HR Management has local HR list, search, filters, status tabs, stats, reminders, offer, onboarding, active employment view, attendance, tasks, incidents, leave, notes, letters, reports, performance review, contracts, probation, promotion, transfer, and exit processing.

**Missing / risk items:**

1. Local HR workflow is not real backend HR governance.
2. Employee-side HR/employment boundary cleanup is needed.
3. Close/reopen verification is required.
4. Launch visibility must be handled in the separate pre-upload launch-boundary audit.

**Classification:** Backend/auth required / Evidence / P1

---

## 13. Manager Console Gaps

**Current status:** Local-working partial / temporary-visible domain.

**Correct wording:** Strong local workflow appears to exist; final classification depends on live close/reopen verification.

**Confirmed direction:** Manager Console has local operations dashboard, command center, attendance gaps, overdue tasks, pending leave, open incidents, roster assignments, availability, notices, and local stat calculations.

**Missing / risk items:**

1. Depends heavily on HR storage.
2. Needs role-safe backend API boundaries later.
3. Close/reopen verification is required.
4. Launch visibility must be handled in the separate pre-upload launch-boundary audit.

**Classification:** Backend/auth required / Evidence / P1

---

## 14. Shared Mitra ID / Trust Profile

**Current decision:** Do not implement now inside Job Mitra.

Shared Mitra ID / Trust Profile should remain roadmap-only until:

1. Job Mitra is stable
2. HomeFix Mitra is stable
3. Backend/auth architecture is finalized
4. Identity rules are designed
5. Privacy rules are designed
6. Rating ownership is designed
7. Cross-app trust rules are designed

**Reason:** If added now with only localStorage/demo logic, users and employers may think it is a real verified cross-app identity, which would be misleading.

**Classification:** P2 / Future ecosystem feature

---

## 15. Pay Mitra Scope

**Current decision:** Pay Mitra should be planned as a payroll, invoice, wage, salary-slip, and payment-record manager.

Safe Pay Mitra scope:

1. Salary slips
2. Wage records
3. Shift payout records
4. Service payment records
5. Invoice records
6. Advance/deduction records
7. Payment proof records
8. Monthly earning summaries

Pay Mitra must not be described as:

1. Wallet
2. Banking app
3. UPI/payment transfer
4. Money transfer app
5. Real payment processor

**Reason:** Real payment transfer creates banking, KYC, fraud, legal, compliance, and Play Store risk.

**Classification:** P2 / Compliance-sensitive future ecosystem feature

---

## 16. EmployerTrustBadge Accepted Debt

**Current decision:** Do not remove the fallback now.

EmployerTrustBadge still has accepted fallback debt because employee Career/Shift post data does not consistently carry `employerWmId`.

Correct future fix:

1. Add `employerWmId` to employer Career post source data.
2. Add `employerWmId` to employer Shift post source data.
3. Ensure employee synced/search post data includes `employerWmId`.
4. Update types, parsers, and normalizers.
5. Pass `employerWmId` into EmployerTrustBadge.
6. Only then remove `employerSettingsStorage` fallback.

**Reason:** Removing fallback now may break trust badge visibility on employee-side job cards/details.

**Classification:** Debt

---

## 17. LocalStorage Truth Boundary

All current advanced workflows are Phase-0 localStorage workflows.

Do not claim:

1. Cloud sync
2. Real backend verification
3. Secure encrypted vault
4. Real push notification
5. SMS/email notification
6. Real OTP
7. Real payment
8. Cross-device account continuity

Use safe wording:

1. Local demo
2. Local access code
3. Local in-app notification
4. Local work record
5. Backend-ready planning needed

**Classification:** Wording / P1

---

## 18. Backend/Auth Data Ownership Model

Before backend/auth implementation, these must be locked:

1. User identity model
2. Employee/employer role permissions
3. Career Jobs data ownership
4. Shift Jobs data ownership
5. Workforce Ops data ownership
6. Work Vault access permission model
7. Notification ownership
8. Rating ownership
9. Employer trust data model
10. Audit/activity log model
11. LocalStorage to database migration strategy

**Reason:** Backend/auth should not start before data ownership and role-safe boundaries are clear.

**Classification:** P0

---

## 19. Close/Reopen Verification Checklist

Close/reopen verification is required evidence, not optional polish.

Apply this checklist to all local-working flows:

1. Create data.
2. Close browser/app.
3. Reopen.
4. Confirm record still exists.
5. Confirm list reflects record.
6. Confirm detail page opens.
7. Confirm saved values remain correct.
8. Confirm linked pages still show the data.

Apply to:

1. Shift job apply flow
2. Career job apply flow
3. Work Vault documents/folders
4. Notifications
5. Employment Lifecycle
6. Workforce Ops groups/messages/attendance
7. HR Management records
8. Manager Console records where relevant

**Classification:** Evidence / P1

---

## 20. Rating Unlock Verification

Rating unlock after shift/work completion needs end-to-end verification.

Check:

1. When rating becomes available
2. Who can rate
3. Whether duplicate rating is blocked
4. Whether rating updates worker/employer trust correctly
5. Whether rating appears in the correct profile/work history

**Classification:** Evidence / P1

---

## 21. Document Gap Classification Rule

For every missing feature, classify as one of the following:

1. Needed before backend/auth
2. Backend/auth required
3. Future ecosystem feature
4. Play Store wording cleanup only
5. Needs live verification
6. Not needed now
7. Accepted technical debt

This prevents all gaps from looking equally urgent.

---

## 22. Next Action Order

1. Lock this document as the current advanced feature gap summary.
2. Complete close/reopen verification checklist.
3. Decide priority for Shift/Career draft, preview, and duplicate warning features.
4. Lock official Career hiring flow.
5. Then start backend/auth planning.

No code yet. Next step is feature priority decision, not implementation.

---

## 23. Open Blockers Before Backend/Auth

These items are pending decision / pending verification blockers.

They are not confirmed missing implementation features yet, and they are not code tasks yet. They must be resolved or clearly prioritized before backend/auth coding starts.

### 23.1 Shift/Career Draft, Preview, Duplicate Warning Priority

**Status:** Pending decision

**Decision needed:**

1. Should Shift/Career Save Draft be implemented before backend/auth?
2. Should Shift/Career Resume Draft be implemented before backend/auth?
3. Should Shift/Career Preview Before Publish be implemented before backend/auth?
4. Should Shift/Career Duplicate Job Warning be implemented before backend/auth?
5. Or should these remain Phase 2 advanced features after backend/auth?

**Classification:** P0 decision / not implementation-approved yet

---

### 23.2 Official Career Hiring Flow Source of Truth

**Status:** High-priority pending decision before backend/auth

**Decision needed:**

1. Should employee accept-offer create the final employment record?
2. Should employer hire / mark-joined create the final employment record?
3. Should a two-step flow become official: employee accepts offer, then employer confirms joining?
4. Which action triggers Employment Lifecycle?
5. Which action creates notifications?
6. Which action becomes the backend source of truth?

**Classification:** P0 / backend-auth blocker

---

### 23.3 Close/Reopen Verification Evidence

**Status:** Required evidence

Close/reopen verification is not optional polish. It is required evidence before any local-working flow is called complete.

**Decision needed:**

1. Verify each local-working flow on real browser/app close and reopen.
2. Record pass/fail result.
3. Confirm list reflection, detail-page access, saved values, and linked-page continuity.
4. Keep failed flows classified as Local-working partial until fixed or clearly documented.

**Classification:** Evidence / P1

---

### 23.4 Rating Unlock Verification

**Status:** Required evidence

**Decision needed:**

1. Confirm when rating unlocks.
2. Confirm who can rate.
3. Confirm duplicate rating block.
4. Confirm whether rating updates worker/employer trust correctly.
5. Confirm whether rating appears in the correct profile/work history.

**Classification:** Evidence / P1

---

### 23.5 Backend/Auth Ownership Model

**Status:** Separate document required

**Decision needed:**

1. User identity model
2. Employee/employer role permissions
3. Career Jobs data ownership
4. Shift Jobs data ownership
5. Workforce Ops data ownership
6. Work Vault permission model
7. Notification ownership
8. Rating ownership
9. Employer trust data model
10. Audit/activity log model
11. LocalStorage to database migration strategy

**Classification:** P0 / separate backend-auth architecture document required

---

### 23.6 Launch-Boundary Hide/Disable Audit

**Status:** Separate pre-upload audit required

Launch-Boundary Hide/Disable Audit is separate from this advanced feature audit.

This does not mean HR Management, Manager Console, or Workforce Ops should be hidden now during the advanced feature audit. They can remain visible while missing advanced features and verification gaps are reviewed.

Final hide / disable / re-approve decision happens before the next Play Store upload or production update.

**Decision needed before Play Store update:**

1. Confirm HR Management visibility.
2. Confirm Manager Console visibility.
3. Confirm Workforce Ops Hub visibility.
4. Confirm Full Insights visibility.
5. Confirm Admin visibility.
6. Confirm any other hidden/future dashboard exposure.
7. Hide, disable, or formally re-approve each visible future domain according to master documents.

**Classification:** P1 / separate launch-boundary audit

---

## 24. Final Verdict

The app has strong local advanced workflow coverage, but it is not backend/auth-ready yet.

Before backend/login coding, the following must be locked:

1. Data ownership
2. Role boundaries
3. Official Career hiring flow
4. LocalStorage truth wording
5. Close/reopen verification evidence
6. Rating unlock verification
7. Future ecosystem boundaries
8. Employer trust data model
9. Backend/auth migration strategy

**Go / No-Go:**

- Proceed with feature priority decision.
- Do not start backend/auth yet.
- Do not start code changes from this audit until each item is converted into priority order.
