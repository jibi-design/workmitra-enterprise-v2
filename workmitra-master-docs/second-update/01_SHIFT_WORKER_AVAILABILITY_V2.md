<!-- App name: WorkMitra / Job Mitra
File name: 01_SHIFT_WORKER_AVAILABILITY_V2.md
Full file path: C:\projects\WorkMitra_Enterprise_v2\workmitra-master-docs\second-update\01_SHIFT_WORKER_AVAILABILITY_V2.md -->

# SHIFT WORKER AVAILABILITY — SECOND UPDATE (V2) SPECIFICATION

## 1. Document Status

| Field             | Value                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------- |
| Status            | **Locked for V2 — DO NOT BUILD IN PHASE 1**                                              |
| Domain            | **Shift Jobs only** (never mix with Career Jobs or HR Staff Availability)                |
| Product decision  | Anti–platform-leakage: force hiring loop inside the app                                  |
| Phase 1 companion | Employee 7-day calendar + employer badge + privacy shield (separate implementation pass) |
| Build gate        | Product Owner must approve this document before any V2 coding                            |

## 2. Inherits From

- `architecture/01_CORE_MASTER_TRUTH.md`
- `shared/02_SHIFT_JOBS_ARCHITECTURE_FINAL_POSTING_SAFE (1).md`
- `shared/04_WORK_VAULT_ARCHITECTURE_FINAL_NUMBERED.md`
- `shared/05_EMPLOYER_TRUST_VISIBILITY_FINAL_NUMBERED.md`
- `architecture/13_UI_DESIGN_SYSTEM_RULES_FINAL_POSTING_SAFE.md`
- `second-update/00_SECOND_UPDATE_INDEX_AND_WORKFLOW.md`

## 3. Strategic Context — Why Phase 1 and Phase 2 Are Split

### 3.1. The Problem We Are Solving

If employers can **browse available workers**, **see counts on Home**, and **invite directly without a post**, they may:

- Hire workers **outside the app** (phone/WhatsApp after seeing names).
- Skip posting, confirmation, workspace, and rating loops.
- Weaken trust, ratings, and WorkMitra’s closed hiring funnel.

This is called **Platform Leakage**.

### 3.2. Phase 1 Strategy (MVP — Execute First)

| Actor                         | Phase 1 behavior                                                                                                     |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Employee**                  | 7-day rolling calendar (Today + next 6 days). Tap days → Mitra Green active + haptic. Save to `availabilityStorage`. |
| **Employer Home**             | **No Talent Radar.** **No worker count card.**                                                                       |
| **Employer application view** | On `EmployerCandidateProfileCard`, if candidate’s free days match shift start date → badge: `✅ Free on [Day]`       |
| **Privacy Shield**            | Phone and email **hidden** until worker is **Confirmed** and shift is locked in-app                                  |

Phase 1 gives **precision data collection** and **contextual signal inside an existing application** — without opening a worker marketplace.

### 3.3. Phase 2 Strategy (V2 — This Document)

Phase 2 adds **employer-side intelligence** only after Phase 1 data model and calendar are stable:

1. **Talent Radar** — awareness on Employer Home
2. **Direct Invite List** — browse/filter available workers
3. **Magic Alert** — contextual prompt when creating a shift and selecting a date

All three must keep the employer **inside the app** through post → confirm → workspace → rating.

## 4. Phase 2 Feature Specifications

---

### 4.1. Feature A — Talent Radar (Employer Home Awareness Card)

**Status:** V2 only — not in Phase 1

**Purpose:** Tell the employer that workers in their area have updated availability — **without** exposing full contact details.

**Placement:** `EmployerShiftHomePage` — below Hero, above KPI tiles (or grouped near Create Shift CTA).

**UI copy (example):**

```txt
🔥 15 workers in your area updated availability this week
   Thu (8) · Fri (6) · Sat (4)
   [View Available Workers →]
```

**Behavior:**

- Card uses aggregated counts from `availabilityStorage` pool (non-expired broadcasts).
- Optional city/category filter when employer profile has location.
- Tap **View Available Workers** → navigate to Workers tab with availability filter (see Feature B).
- **Zero state:** card hidden when count = 0 (same rule as other hubs).

**Must NOT:**

- Show phone numbers or emails.
- Allow messaging outside in-app workspace.
- Mix Career domain workers.

---

### 4.2. Feature B — Direct Invite / Available Workers List

**Status:** V2 only — not in Phase 1

**Purpose:** Let employer see **who** is free **which days** — still inside Job Mitra.

**Entry points:**

1. Talent Radar card → View Available Workers
2. Bottom nav **Workers** tab (`/employer/shift/favorites`) with segment: **Available This Week** | **My Favorites**

**List row (example):**

| Field          | Shown                                                |
| -------------- | ---------------------------------------------------- |
| Name           | Public Work Vault summary name (Shift mode — no OTP) |
| City           | Yes                                                  |
| Available days | Chips: Wed, Fri                                      |
| Rating         | If available (stars + hire-again)                    |
| Actions        | **View Profile** · **Invite to Shift**               |

**View Profile:**

- Shift public profile summary only (per Work Vault doc — no private documents, no OTP for Shift).
- Phone/email remain masked until confirm.

**Invite to Shift:**

- Opens existing invite flow (`EmployerInviteToShiftModal` pattern).
- Employer selects **open post** or **creates new post** — invite cannot complete outside a post context (anti-leakage).

**Filters:**

- By day (match selected calendar day)
- Favorites first toggle
- City proximity (Phase-0: string match on city)

**Zero dead-end rule:**

- Empty list → “No workers marked free for this day. Post a shift to attract applicants.” + **Post Shift** CTA.

---

### 4.3. Feature C — Magic Alert (Create Shift Date Match)

**Status:** V2 only — not in Phase 1

**Purpose:** Surface availability **at the moment it matters** — when employer picks a shift date.

**Placement:** `EmployerShiftCreatePage` → `ShiftCreateScheduleSection` → on **Start Date** change.

**Trigger:** Employer selects Start Date (e.g. Thursday 3 July).

**UI (example):**

```txt
💡 8 workers are marked Available on Thursday
   3 from your Favorites
   [Invite Available Workers]   [Dismiss]
```

**Match logic:**

```txt
workers = broadcasts where selectedDates includes startDate (ISO)
split = favorites ∩ workers  vs  other workers
```

**Invite flow:**

- Multi-select workers in modal.
- Invites **queue until post is published** (recommended) — avoids orphan invites without postId.
- After publish → in-app notification to workers (Shift domain, bell only — not pulse unless action-required).

**Dismiss:**

- Persist dismiss per draft session only — do not spam on every field blur.

**Must NOT:**

- Auto-confirm workers without employer explicit confirm on post dashboard.
- Show contact details in alert.

---

## 5. Data Model — V2 Additions (Future)

Phase 1 uses:

```typescript
selectedDates: string[]  // ISO date "YYYY-MM-DD", rolling 7-day window
workerWmId, workerName, city?, category?, broadcastAt, expiresAt
```

Phase 2 may add (optional):

- `timeSlots?: ("morning"|"afternoon"|"evening")[]`
- `inviteQueue[]` on draft/post publish pipeline
- Employer dismiss flags per create-session

Storage keys remain in Shift domain — `availabilityStorage.ts` only.

## 6. Notifications — V2 Rules

| Event                     | Channel                                    | Phase                                               |
| ------------------------- | ------------------------------------------ | --------------------------------------------------- |
| Employee updates calendar | Employer bell (aggregated digest optional) | **Disable in Phase 1**; **enable controlled in V2** |
| Magic alert invite sent   | Employee bell                              | V2                                                  |
| Worker confirmed          | Contact reveal in workspace                | Phase 1 privacy doc + V2 hardening                  |

Phase 1 must **not** push “Worker available now” notifications to employers (mini leakage).

## 7. Privacy Shield — Carries From Phase 1 Into V2

| Stage                      | Phone / Email                          |
| -------------------------- | -------------------------------------- |
| Browse available list (V2) | **Hidden**                             |
| View profile pre-confirm   | **Hidden**                             |
| Application review + badge | **Hidden**                             |
| After Confirm Worker       | **Visible in Workspace** (in-app only) |

V2 must not weaken masking for “convenience.”

## 8. Explicitly Out of Scope for This V2 Document

- Career Jobs availability marketplace
- HR Staff Availability (`staffAvailability.storage`) — separate domain
- Admin visibility into worker calendars
- WhatsApp/SMS export of worker list
- Auto-confirm from invite

## 9. Zero Dead-End Flow Map (V2)

```txt
Talent Radar → Available List → Profile → Invite to Post → Post Dashboard → Confirm → Workspace
Magic Alert  → Invite Modal  → (queue)   → Publish Post  → Confirm → Workspace
```

Every arrow must have a working route registered in `AppRouter.tsx`.

## 10. Files Likely Touched (Future Implementation — Not Now)

| File                                                                          | V2 change                                                    |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `EmployerShiftHomePage.tsx`                                                   | Mount Talent Radar card                                      |
| `EmployerFavoritesPage.tsx`                                                   | Available This Week section                                  |
| `EmployerShiftCreatePage.tsx` / `ShiftCreateScheduleSection.tsx`              | Magic alert hook                                             |
| `availabilityStorage.ts`                                                      | Query helpers: `getByDate`, `getCountsByDay`, `matchForDate` |
| New: `EmployerAvailableWorkersPage.tsx` (optional if not using Favorites tab) |
| `EmployerInviteToShiftModal.tsx`                                              | Bulk invite from magic alert                                 |
| E2E: extend `tests/e2e/` for V2 flows                                         |

## 11. Acceptance Criteria (Future QA)

- [ ] Phase 1 calendar saves rolling 7-day selection correctly
- [ ] Employer Home shows **no** Talent Radar in Phase 1 build
- [ ] V2: Talent Radar appears only when active broadcasts > 0
- [ ] V2: List shows names and day chips, never phone/email pre-confirm
- [ ] V2: Magic alert fires on date select with correct count
- [ ] V2: Invite requires post context — no off-platform dead end
- [ ] Shift ≠ Career separation preserved in all queries

## 12. Per-Page Second Update Backlog (Living List)

| Page / Component                 | Second Update Item                                 | Priority |
| -------------------------------- | -------------------------------------------------- | -------- |
| `EmployerShiftHomePage.tsx`      | Talent Radar card + day breakdown                  | P1       |
| `EmployerShiftHomePage.tsx`      | Remove Phase 1 placeholder if any count UI returns | P0       |
| `EmployerFavoritesPage.tsx`      | “Available This Week” segment + filters            | P1       |
| `EmployerShiftCreatePage.tsx`    | Magic Alert on Start Date                          | P1       |
| `ShiftCreateScheduleSection.tsx` | Date-match hook + dismiss state                    | P1       |
| `EmployerInviteToShiftModal.tsx` | Bulk invite from magic alert                       | P2       |
| `availabilityStorage.ts`         | `getWorkersForDate(isoDate)` helper                | P1       |
| `tests/e2e/home-gaps.spec.ts`    | New V2 suite when approved                         | P2       |

---

## 13. Product Owner Approval

| Role                | Status                                        | Date       |
| ------------------- | --------------------------------------------- | ---------- |
| Product Owner       | ☐ Pending — document ready for review         |            |
| Principal Architect | ☑ Drafted from locked Phase 1 / Phase 2 split | 2026-07-01 |

**Do not implement Section 4 (Features A, B, C) until this row shows Approved.**
