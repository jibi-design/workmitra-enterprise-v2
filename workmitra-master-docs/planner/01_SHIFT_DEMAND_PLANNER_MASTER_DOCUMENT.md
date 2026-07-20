<!-- App name: WorkMitra / Job Mitra
File name: 01_SHIFT_DEMAND_PLANNER_MASTER_DOCUMENT.md
Full file path: C:\projects\WorkMitra_Enterprise_v2\workmitra-master-docs\planner\01_SHIFT_DEMAND_PLANNER_MASTER_DOCUMENT.md
Document version: v1.9 -->

# SHIFT DEMAND PLANNER — MASTER DOCUMENT

## 1. Document Status

| Field                 | Value                                                                                                                                                                                                                                                                                                                                     |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status                | **Locked for implementation**                                                                                                                                                                                                                                                                                                             |
| Domain                | **Workforce Intelligence Domain** (Demand Planner) — see `02_PLANNER_DOMAIN_SCOPE_LOCK_v1.0.md`                                                                                                                                                                                                                                           |
| Priority              | **Pillar-level** — same strategic weight as Career Jobs for agency-style employers                                                                                                                                                                                                                                                        |
| Build gate            | Product Owner approved Planner as separate premium section (2026-07-01)                                                                                                                                                                                                                                                                   |
| Launch visibility     | **Launch-visible** employer feature (not hidden / not Workforce Ops)                                                                                                                                                                                                                                                                      |
| Document version      | **v1.9** — Bespoke visual tier **implemented** (P1): quartz glass, wizard morph, odometer meter, mega shimmer, universal symbol-free pay display, Step 2 pay validation gate (2026-07-01)                                                                                                                                                 |
| **Coding start rule** | **Product Owner approved v1.7 (2026-07-01).** Employer and Employee Planner surfaces ship at **equal spec depth**. Ultra-premium employee features (Section 8.10) are **P1 launch differentiators** unless PO defers an item to P2 in writing. **Design + animation tier (Section 18) PO-approved as implemented baseline (2026-07-01).** |

## 2. Inherits From

- `architecture/01_CORE_MASTER_TRUTH.md`
- `architecture/12_CROSS_DOMAIN_SYSTEM_RULES_FINAL_POSTING_SAFE.md`
- `architecture/13_UI_DESIGN_SYSTEM_RULES_FINAL_POSTING_SAFE.md`
- `architecture/17_END_TO_END_WORKFLOW_CHECKLIST.md`
- `shared/02_SHIFT_JOBS_ARCHITECTURE_FINAL_POSTING_SAFE (1).md`
- `shared/05_EMPLOYER_TRUST_VISIBILITY_FINAL_NUMBERED.md`
- `shared/18_NOTIFICATION_IMPLEMENTATION_CONTRACT.md`
- `second-update/01_SHIFT_WORKER_AVAILABILITY_V2.md` (Favorites / Direct Invite integration rules)

If this document conflicts with `01_CORE_MASTER_TRUTH.md`, Core Master Truth wins.

## 3. Strategic Context — Why Planner Exists Now

### 3.1. Primary User Reality

Planner is built for employers who:

- Run **agency-style** or **high-volume temporary hiring**
- Need to **post many shift days ahead** (week / month)
- Want to **manage hired workers inside Job Mitra** after posting
- Today may use **Excel, WhatsApp, or small offline tools** for scheduling

For these users, **Planner + Post + Workspace** is the highest-value loop in the app — not Workforce Ops.

### 3.2. What Planner Is NOT

| System                                                             | Relationship to Planner                                                                                                                       |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Workforce Ops Hub** (`09_WORKFORCE_OPS_HUB_HIDDEN_ARCHITECTURE`) | **Not the same.** Workforce = internal ERP-style ops for enterprises with existing HR systems. **Deprioritized** for launch Planner audience. |
| **HR Roster** (`/employer/hr/roster`)                              | **Not the same.** HR Roster = permanent staff scheduling inside hidden HR domain (purple).                                                    |
| **Career Jobs**                                                    | **Never mix.** No permanent hiring lifecycle in Planner.                                                                                      |
| **Full Payroll ERP**                                               | **Not in scope.** Planner has **budget + payment-schedule UI** only — payment-ready, not connected in Phase 1.                                |
| **Create Shift (single post)**                                     | **Sibling, not parent.** Single-day urgent hire stays on green Create Shift. Planner owns multi-day demand.                                   |

### 3.3. Product Truth Statement

```txt
Shift Demand Planner = multi-day demand planning + auto shift post generation
                     + plan-level fill monitoring
                     + budget visibility
                     + in-app worker management per plan day
                     + employee Mega Project Card (anti-feed-spam)
                     + employee My Work plan bundle (anti-tracking-spam)
                     + employer My Posts plan grouping (anti-employer-spam)
                     + plan-level crew broadcast workspace (Mega Workspace Merge)
```

**Golden positioning line (internal):**

```txt
Agencies do not come for Workforce Ops.
They come to post work and manage the workers they hired — Planner is that command center.
```

## 4. Domain Separation Rules (Hard Locks)

### 4.1. Color & Visual Identity

Planner is a **separate visual subdomain** within Employer Shift:

| Token                        | Value                                       | Usage                                    |
| ---------------------------- | ------------------------------------------- | ---------------------------------------- |
| `--wm-planner-accent`        | `#0891b2`                                   | Primary buttons, active nav, KPI accents |
| `--wm-planner-accent-strong` | `#0e7490`                                   | Hover / pressed                          |
| `--wm-planner-soft`          | `rgba(8, 145, 178, 0.08)`                   | Card backgrounds                         |
| `--wm-planner-border`        | `rgba(8, 145, 178, 0.22)`                   | Borders                                  |
| `--wm-planner-hero`          | `linear-gradient(135deg, #ecfeff, #f0fdfa)` | Page heroes                              |

**Must NOT use as Planner primary:**

- Shift Green (`--wm-er-accent-shift`) — reserved for recruitment / Create Shift
- Career Blue (`--wm-er-accent-career`) — reserved for Career Jobs
- HR Purple — reserved for Vault / HR hidden domain

CSS file (target): `src/app/theme/shift-planner.css`

### 4.2. State Separation

| Rule                     | Requirement                                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Storage                  | `demandPlannerStorage` (`wm_employer_demand_plans_v1`) stays separate from `employerShiftStorage` posts                  |
| Linking                  | Every planner-generated post MUST carry `planId` + `source: "planner"` metadata on the shift post                        |
| Feed anti-spam           | Planner child posts MUST NOT appear as individual cards in employee search feed — **one Mega Project Card per `planId`** |
| My Work anti-spam        | Employee applications from same `planApplyBatchId` collapse into **one Plan Bundle row** in My Work                      |
| Employer posts anti-spam | Child planner posts grouped under plan in My Posts — not 30 separate green cards                                         |
| Zustand                  | No shared slice with Career Jobs or Workforce Ops                                                                        |
| Employee view            | Plan bundle apply is Shift domain only — never Career application pipeline                                               |
| Workspace merge          | All confirmed workers across all plan days merge into **one Plan Broadcast Group** per `planId` — dedupe by `workerWmId` |
| Pulse                    | Planner dashboard = **silent data UX**. Action pulses only on explicit CTAs via `PulseNode` / `PulseTarget`              |

### 4.3. Platform Leakage (Inherited)

- Blind paths show **counts only** — no worker names on radar-style surfaces
- **Favorites tab** = trusted path for direct invite (already built)
- Plan day drawer may link to workspace / favorites invite — **never** expose phone/email before confirm

### 4.4. Planner Direct Invite Exception (Hidden Post Rule)

Planner child posts use `isHiddenFromSearch: true`. Existing code blocks direct invite on hidden posts. **Exception required:**

| Surface                                              | Rule                                                                                                                               |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `shiftDirectInvite.service`                          | Allow invite when `post.source === "planner"` AND invite originates from **plan day drawer** or **planner-context favorites flow** |
| `EmployerInviteToShiftModal` (generic favorites tab) | May still exclude hidden posts OR show plan-grouped picker — **plan day drawer is the primary path**                               |
| Employee discovery                                   | Hidden posts never appear as individual cards; Mega Card + public index only                                                       |

**Rationale:** Anti-spam hides posts from public feed; trusted employer invite path must still work per plan day.

## 5. Information Architecture

### 5.1. Route Tree (Target)

```txt
/employer/planner/
  home                    → Command dashboard (KPI + active plans)
  new                     → Plan builder wizard (3 steps P1 — see Section 18.2)
  new?planId=:id&step=:n  → Resume draft wizard
  plans                   → All plans list (draft + active + completed + cancelled)
  plans/:planId           → Plan detail (P1 stub → P2 full calendar)
  plans/:planId/finance   → Budget ledger (P3) OR placeholder (P1/P2)
  plans/:planId/day/:date → Day drawer (P2)
  templates               → Saved plan templates (P4)
```

**Current route (legacy — migrate):**

```txt
/employer/shift/demand-planner   → redirects to /employer/planner/new after P0
```

### 5.2. Navigation

**Target:** Dedicated **Planner** item in Employer bottom nav (Teal when active).

| Nav item    | Domain                | Color    | Path                         |
| ----------- | --------------------- | -------- | ---------------------------- |
| Home        | `employerShift`       | Green    | `/employer/shift`            |
| **Planner** | **`employerPlanner`** | **Teal** | `/employer/planner/home`     |
| My Posts    | `employerShift`       | Green    | `/employer/shift/posts`      |
| Workspaces  | `employerShift`       | Green    | `/employer/shift/workspaces` |
| Workers     | `employerShift`       | Green    | `/employer/shift/favorites`  |

**`useDynamicNav` requirement (P0):**

```ts
if (path.startsWith("/employer/planner")) return "employerPlanner";
```

Add `employerPlanner` to `NAVIGATION_CONFIG` in `navigation.config.ts` with Teal color `#0891b2`.

**5-tab note:** Five bottom tabs is acceptable for agency employers. Labels stay short. Planner tab uses calendar icon. No sixth tab in launch pass.

Shift Home keeps a **premium Teal teaser strip** → `Open Planner` (not inline wizard).

**Back navigation:** Planner header back → `/employer/planner/home`. Shell back from Planner subdomain → allowed to `/employer/shift` via explicit "Shift Home" link in planner header menu — never a dead end.

### 5.3. Shell

`PlannerShell` or scoped layout wrapper under `EmployerShell` with Teal header chrome — same pattern as Career subdomain separation.

### 5.4. Employee Route Tree (Target — parity with employer Planner)

```txt
/employee/shift/
  home                         → Shift Control Center + "Project Plans near you" Teal strip (P1)
  search                       → Mega Project Cards section + single-shift cards (P1)
  projects                     → All active project plans list (P2) — optional dedicated browse
  projects/:planId             → Project Detail (pre-apply command view) (P1)
  projects/:planId/apply       → Pick & Choose full-page mode (P1 alt to modal)
  applications                 → My Work with Plan Bundle rows (P1)
  applications/plan/:planId    → Plan Application Summary / breakdown (P1)
  applications/plan/:batchId   → Same screen keyed by planApplyBatchId (P1)
  post/:postId                 → Single-day detail (hidden planner posts via deep link / invite only)
  workspaces                   → Per-day workspaces (existing — plan crew uses same tab)
  workspaces/:workspaceId      → Per-day workspace + BCC crew broadcast inbox (P1)
  earnings                     → Plan-tagged earnings rows (P4)
```

**Employee discovery rule:** Mega Cards and Project Detail use `plannerPublicIndex` only. Hidden child posts never appear as standalone search cards.

**Deep links:** Notification / direct invite may open `post/:postId` for a hidden planner day — must show **Project context banner** (`Part of: [Plan Name]`) + link to `projects/:planId`.

### 5.5. Employee Visual Identity (Teal on Shift subdomain)

Employee Planner surfaces reuse **Teal** tokens (`--wm-planner-*`) on plan-specific UI only. Shift Green remains default for single-shift cards.

| Surface                          | Color                            |
| -------------------------------- | -------------------------------- |
| Mega Project Card                | Teal border, badge, CTA          |
| Project Detail page              | Teal hero + calendar             |
| My Work Plan Bundle              | Teal left accent + badge         |
| Plan crew broadcast in workspace | Teal system banner (information) |
| Single-shift cards               | Green (unchanged)                |

**Never** use Career Blue or HR Purple on employee plan surfaces.

## 6. Data Model

### 6.1. DemandPlan + Storage API

Current type lives in `demandPlannerStorage.ts`.

```ts
type DemandPlanStatus = "draft" | "active" | "completed" | "cancelled";

type DemandPlan = {
  id: string;
  name: string;
  companyName: string;
  locationName: string;
  category: string;
  experience: ExperienceLabel;
  startDate: string;
  endDate: string;
  workingDays: WorkingDay[];
  slots: DaySlot[];
  status: DemandPlanStatus;
  createdAt: number;
  updatedAt: number;
  submittedAt?: number;
  description?: string;
  draftStep?: 1 | 2 | 3; // resume wizard (P1 three-step flow)
  budgetCap?: number;
  backupBufferPct?: number;
  tags?: string[];
  templateId?: string;
  cancelledAt?: number;
  cancelReason?: string;
};

type DaySlot = {
  date: string;
  workers: number;
  payPerDay: number;
  category?: string;
  postId?: string;
  overtimeFlag?: boolean;
};
```

**Storage API (required — P1):**

```ts
demandPlannerStorage.create(...)           // draft
demandPlannerStorage.updatePlan(id, patch) // step1 fields, draftStep, slots
demandPlannerStorage.updateSlots(id, slots)
demandPlannerStorage.submit(id, postIds)
demandPlannerStorage.cancel(id, reason?)   // status → cancelled; see 6.8
demandPlannerStorage.delete(id)            // drafts only; active → use cancel
demandPlannerStorage.getById(id)
demandPlannerStorage.getAll()
```

**Draft auto-save:** On every wizard step advance, call `updatePlan` with `draftStep` + current form state. Resume via `/employer/planner/new?planId=X&step=N`.

### 6.2. ShiftPost Extension (required on submit — P1)

Extend `ShiftPost` in `employerShift.types.ts`:

```ts
type ShiftPost = {
  // ...existing fields...
  planId?: string;
  planSlotDate?: string; // YYYY-MM-DD
  source?: "planner" | "single";
  isHiddenFromSearch?: boolean;
};
```

**On publish, every child post:**

```ts
{
  planId: string;
  planSlotDate: string;
  source: "planner";
  isHiddenFromSearch: true;
}
```

**Anti-spam rule:** 30 backend posts for hiring logic; employee feed shows **one** Mega Project Card.

### 6.3. Plan Broadcast Group — Mega Workspace Merge (P1)

```ts
type PlanBroadcastGroup = {
  id: string; // pbg_<planId>
  planId: string;
  planName: string;
  companyName: string;
  memberWorkspaceIds: string[]; // EmployeeWorkspace.id values
  memberWorkerWmIds: string[]; // dedupe key — one seat per worker
  createdAt: number;
  updatedAt: number;
};
```

Storage key: `wm_planner_broadcast_groups_v1`

**Confirm hook points (mandatory wiring):**

| Function                            | After success, call                                                              |
| ----------------------------------- | -------------------------------------------------------------------------------- |
| `confirmCandidate(postId, appId)`   | If `post.planId` → `enrollWorkspaceInPlanGroup(planId, workspaceId, workerWmId)` |
| `confirmDirectInviteCandidate(...)` | Same enrollment rule                                                             |

**Dedupe rule:** Same `workerWmId` confirmed on Mon + Wed + Fri → **one** entry in `memberWorkerWmIds`; all three per-day workspace IDs remain in `memberWorkspaceIds` for day-specific updates; broadcast delivers to all listed workspace IDs.

**Employer API:**

```ts
ensurePlanBroadcastGroup(planId: string): PlanBroadcastGroup;
enrollWorkspaceInPlanGroup(planId: string, workspaceId: string, workerWmId: string): void;
broadcastToPlanCrew(planId: string, title: string, body: string): void;
```

**Per-post vs plan broadcast:**

- Day-specific message → `broadcastToEmployeeWorkspace(postId, ...)`
- Crew-wide message → `broadcastToPlanCrew(planId, ...)`

### 6.4. Planner Public Index — Employee Discoverability (P1)

Hidden child posts are excluded from `isShiftOpenForDiscovery()`. Employees **cannot** build Mega Cards from the normal filtered post list alone.

**Solution:** On plan publish, write one employee-visible record:

```ts
type PlannerPublicIndexEntry = {
  planId: string;
  planName: string;
  companyName: string;
  locationName: string;
  category: string;
  experience: ExperienceLabel;
  dayCount: number;
  openDayCount: number; // slots with remaining vacancies
  payMin: number;
  payMax: number;
  slotDates: string[]; // YYYY-MM-DD
  postIdsByDate: Record<string, string>;
  publishedAt: number;
  status: "active" | "cancelled";
};
```

Storage key: `wm_planner_public_index_v1`  
Changed event: `wm:planner-public-index-changed`

**Employee query (P1):**

```ts
// Mega Card feed source — NOT the generic filtered post loop
plannerPublicIndex.getActiveEntries().filter((entry) => entry.openDayCount > 0);
```

On plan cancel → set entry `status: "cancelled"` → Mega Card removed from employee feed.

### 6.5. Application Metadata Extension (P1)

Extend `EmployeeShiftApplication`:

```ts
{
  planId?: string;
  planApplyBatchId?: string;
  selectedDates?: string[];
}
```

**Employer review:** When viewing applicants on a plan day post, show badge `Part of batch apply · 3 days` if `planApplyBatchId` present. Employer can still shortlist/confirm **per day** — batch is informational only.

### 6.6. Finance Ledger (local — P3)

```ts
type PlannerLedgerLine = {
  planId: string;
  date: string;
  postId: string;
  plannedWorkers: number;
  confirmedWorkers: number;
  payPerDay: number;
  plannedAmount: number;
  committedAmount: number;
  paymentStatus: "not_due" | "scheduled" | "processing" | "paid" | "failed";
};
```

UI-only payment stages until gateway connected.

### 6.7. Limits

- Max **90 days** per plan
- Max **50 plans** in local storage list

### 6.9. Employee Plan Engagement (local — P1/P2)

Tracks employee-side plan interactions — separate from Career, separate from employer plan storage.

```ts
type EmployeePlanEngagement = {
  planId: string;
  savedAt?: number; // starred / saved project
  lastViewedAt?: number;
  dismissedAt?: number; // hide from home strip P2
  schemaVersion: 1;
};
```

Storage key: `wm_employee_plan_engagement_v1`  
Changed event: `wm:employee-plan-engagement-changed`

**Used for:** Recently viewed projects, saved projects (P2), smart match boost (P2), home strip ordering.

### 6.10. Employee Ultra-Premium Data (local — P1)

#### 6.10.1. Live Earnings selection state (ephemeral UI)

Pick & Choose maintains live selection totals in component state — no separate storage key. Formula:

```ts
estimatedEarnings = sum(selectedDates.map((d) => postIdsByDate[d].payPerDay));
```

#### 6.10.2. Planner day conflict snapshot (computed on calendar open)

```ts
type PlannerDayConflict = {
  dateKey: string; // YYYY-MM-DD
  postId: string;
  conflictType: "confirmed_shift" | "active_application" | "active_workspace";
  conflictLabel: string; // e.g. "Driver shift"
  blockingPostId?: string;
};
```

Computed via shift applications + workspaces + confirmed single-shift posts for same `dateKey`. **Never** reads Career employment storage.

#### 6.10.3. Commitment Streak badge

```ts
type PlannerCommitmentStreakRecord = {
  workerWmId: string;
  planId: string;
  planApplyBatchId: string;
  consecutiveDaysCount: number; // longest run of consecutive calendar dates in batch
  badgeEarnedAt?: number;
  schemaVersion: 1;
};

type EmployeeProfileBadge = {
  id: "planner_commitment_streak";
  label: "Commitment Streak";
  earnedAt: number;
  planId: string;
  consecutiveDays: number;
};
```

Storage keys:

- `wm_planner_commitment_streaks_v1`
- Profile badge written to existing employee profile badges array (Shift domain field only)

**Earn rule:** In a single Pick & Choose submit, employee selects **≥ 5 consecutive calendar days** within the same `planId` → badge earned + employer candidate cards show `🏆 Commitment Streak` tag.

**Employer visibility:** Applicant card on plan day post dashboard shows badge when `profileSnapshot` includes streak for same `planId` or global streak active.

#### 6.10.4. Personal Calendar shift blocks (Diary auto-sync)

Planner confirmations sync to employee **Personal Work Diary calendar** on Home — **read-only auto blocks**, not manual diary entry.

```ts
type PersonalCalendarShiftBlock = {
  id: string;
  dateKey: string; // YYYY-MM-DD
  domain: "shift"; // never "career"
  source: "planner" | "single";
  planId?: string;
  planName?: string;
  postId: string;
  workspaceId?: string;
  applicationId?: string;
  jobName: string;
  companyName: string;
  payPerDay?: number;
  status: "confirmed" | "completed" | "cancelled" | "replaced";
  syncedAt: number;
  schemaVersion: 1;
};
```

Storage key: `wm_employee_personal_calendar_shift_v1`  
Changed event: `wm:employee-personal-calendar-shift-changed`

**Sync hook (mandatory):** On `confirmCandidate` / `confirmDirectInviteCandidate` when `post.source === "planner"` → `plannerDiarySyncService.upsertConfirmedDay(...)`.

**Home UI:** Personal Work Diary month grid shows:

- **Teal badge** — confirmed planner project day (`📋 [Plan Name]`)
- **Green badge** — confirmed single shift day (existing pattern)

Employee does **not** manually add these — auto-sync on employer confirm. Tap badge → shift workspace or plan application summary.

**Cancel / replace:** Plan cancel or worker replaced → block status → `cancelled` / `replaced`; badge softens or removes per day.

**Career separation:** `workDiary.storage` employment entries remain Career-only. Shift planner uses `PersonalCalendarShiftBlock` union layer consumed by Home diary calendar renderer.

### 6.11. Employee Availability Calendar + Smart Earnings Predictor (P1)

**Purpose:** Canonical TypeScript contracts for Pick & Choose calendar state (Section 7.7, 8.10) and Live Earnings Dopamine Meter (8.10.1). **Shift Jobs domain only** — never mix with Career employment.

```ts
/** ISO date key: YYYY-MM-DD */
type DateKey = string;

type EmployeeAvailabilityDayStatus =
  | "open" // vacancies remain; worker may select for apply
  | "full" // post vacancies filled — not selectable
  | "applied" // worker already applied this plan day
  | "shortlisted" // under employer review
  | "waiting" // backup list
  | "confirmed" // employer confirmed — not selectable for re-apply
  | "conflict" // blocked by another shift on same dateKey (8.10.2)
  | "cancelled" // plan day / post cancelled
  | "past" // date before today — not selectable
  | "unavailable"; // generic disabled (e.g. profile gate, offline)

type EmployeeAvailabilityDay = {
  dateKey: DateKey;
  postId?: string;
  payPerDay: number;
  status: EmployeeAvailabilityDayStatus;
  selectable: boolean;
  vacanciesTotal?: number;
  vacanciesRemaining?: number;
  conflict?: PlannerDayConflict; // Section 6.10.2
  applicationId?: string;
  applicationStatus?:
    | "applied"
    | "shortlisted"
    | "waiting"
    | "confirmed"
    | "rejected"
    | "withdrawn"
    | "replaced"
    | "exited"
    | "unavailable";
  badges?: Array<"full" | "applied" | "confirmed" | "conflict" | "selected">;
};

type EmployeeAvailabilitySummary = {
  totalDayCount: number;
  openDayCount: number;
  selectableDayCount: number;
  conflictDayCount: number;
  appliedDayCount: number;
  confirmedDayCount: number;
  fullDayCount: number;
};

/**
 * EmployeeAvailability — computed snapshot for one planId.
 * Built when opening Project Detail or Pick & Choose. Not persisted as a blob.
 * Sources: plannerPublicIndex + shift posts + applications + workspaces.
 */
type EmployeeAvailability = {
  workerWmId: string;
  planId: string;
  planName: string;
  companyName: string;
  locationName: string;
  generatedAt: number;
  schemaVersion: 1;
  dateRange: { start: DateKey; end: DateKey };
  days: EmployeeAvailabilityDay[];
  summary: EmployeeAvailabilitySummary;
  selectedDateKeys: DateKey[];
};

type BuildEmployeeAvailabilityInput = {
  workerWmId: string;
  planId: string;
  indexEntry: {
    planName: string;
    companyName: string;
    locationName: string;
    slotDates: DateKey[];
    postIdsByDate: Record<DateKey, string>;
    payMin: number;
    payMax: number;
    status: "active" | "cancelled";
  };
  initialSelectedDateKeys?: DateKey[];
  now?: number;
};

type SmartEarningsConfidence = "selected_open" | "selected_applied" | "confirmed" | "excluded";

type SmartEarningsDayLine = {
  dateKey: DateKey;
  postId?: string;
  payPerDay: number;
  includedInSelection: boolean;
  confidence: SmartEarningsConfidence;
  meterAmount: number;
  confirmProbability?: number; // P2 smart weighting
};

type SmartEarningsMeter = {
  selectedDayCount: number;
  estimatedTotal: number;
  currency?: string; // P2: employer-set ISO code on plan; P1 display is symbol-free
  fillRatio: number; // selectedDayCount / selectableDayCount
  label: string; // "3 Days Selected · Estimated earnings: 3,600"
  sublabel?: string;
  displayAmount: number;
};

type SmartEarningsCommitmentStreak = {
  threshold: number; // default 5
  consecutiveDaysSelected: number;
  longestConsecutiveInSelection: number;
  eligible: boolean;
  teaserLabel?: string;
};

/**
 * SmartEarningsPredictorPayload — rebuilt on every calendar day toggle.
 * Ephemeral UI state in P1 (no localStorage key).
 */
type SmartEarningsPredictorPayload = {
  planId: string;
  planName: string;
  generatedAt: number;
  schemaVersion: 1;
  meter: SmartEarningsMeter;
  earnings: {
    estimatedTotal: number;
    optimisticTotal: number;
    conservativeTotal: number;
    predictedTotal?: number;
  };
  commitmentStreak: SmartEarningsCommitmentStreak;
  dayLines: SmartEarningsDayLine[];
  disclaimer: string;
};

type BuildSmartEarningsPredictorInput = {
  availability: EmployeeAvailability;
  selectedDateKeys: DateKey[];
  commitmentStreakThreshold?: number;
  now?: number;
};
```

**Service contracts (implementation target):**

```ts
type EmployeeAvailabilityService = {
  build(input: BuildEmployeeAvailabilityInput): EmployeeAvailability;
  toggleSelection(availability: EmployeeAvailability, dateKey: DateKey): EmployeeAvailability;
};

type SmartEarningsPredictorService = {
  build(input: BuildSmartEarningsPredictorInput): SmartEarningsPredictorPayload;
};
```

**Storage:** None for snapshot/payload in P1 — computed on render. Conflict data reuses Section 6.10.2 rules.

### 6.8. Plan Lifecycle — Cancel & Delete

| Action       | Allowed when              | Result                                     |
| ------------ | ------------------------- | ------------------------------------------ |
| **Delete**   | `status === "draft"` only | Plan removed; no posts exist               |
| **Cancel**   | `status === "active"`     | See **P1 active plan cancel policy** below |
| **Complete** | All slots past end date   | Plan → `completed` (P2 auto or manual)     |

#### P1 active plan cancel policy (mandatory — safety, not optional)

When employer cancels an **active** plan, the system MUST apply **all** of the following atomically:

| Step | Required behavior                                                                                                                                                                |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | `DemandPlan.status` → `cancelled`; set `cancelledAt` + optional `cancelReason`                                                                                                   |
| 2    | `PlannerPublicIndexEntry.status` → `cancelled` for this `planId`                                                                                                                 |
| 3    | Employee Mega Card removed **immediately** from discoverability feed                                                                                                             |
| 4    | All **unfilled** hidden child posts (`source === "planner"`) → `status: "cancelled"` (or equivalent closed state) **immediately** — no active discoverable child post may remain |
| 5    | **Confirmed** per-day workspaces remain for audit/history — not deleted                                                                                                          |
| 6    | Pending applications (`applied`, `shortlisted`, `waiting`) on cancelled child posts → `cancelled` or `unavailable` status visible to employee and employer                       |
| 7    | Employer **My Posts** shows the plan as a **cancelled plan group** (not N active child rows)                                                                                     |
| 8    | After cancel completes: **zero** child posts from this plan remain active in employee discovery paths                                                                            |

**Confirmed workers:** Workspaces and confirmed application records stay for audit. Employer may still view history via plan detail / post dashboard / workspace — but the plan and unfilled days are closed.

**P2 enhancement (optional — not required for P1 safety):** Bulk-cancel **UI/helper** with confirm modal, per-day summary, and batch audit log entry. P1 cancel API must already close unfilled child posts; P2 does not gate basic cancel safety.

**Edit after publish (P2 — limited):** Pay bump and vacancy increase on **unfilled** future days only. Cannot reduce confirmed worker pay. Cannot delete past days with confirmed workers.

## 7. Screen Specifications

### 7.1. Planner Command Home (`/employer/planner/home`)

**Hero:** `Demand Planner` — Plan your week or month — publish shifts in one action

**KPI strip:** Active plans · Planned days · Workers needed · Est. budget · Fill %

**Sections:**

1. Active Plans — progress bar, fill %, budget, `Open Plan`
2. Drafts — resume wizard at `draftStep`
3. Quick actions — `+ New Plan`, `View All Plans`
4. Alerts (silent) — unfilled days in next 7 days

**CTA:** `View All Plans` → `/employer/planner/plans`

**Zero state:** `[+ New Plan]`

---

### 7.2. Plans List (`/employer/planner/plans`)

**Purpose:** Full library — not only Command Home subset.

**Tabs:** Active · Drafts · Completed · Cancelled

**Each row:** plan name, dates, fill %, status badge, tap → `plans/:planId`

---

### 7.3. Plan Builder Wizard (`/employer/planner/new`)

**P1 — 3 steps (implemented):** Role & Team → Schedule & Pay → Review & Publish

| Step                 | Content                                                                    |
| -------------------- | -------------------------------------------------------------------------- |
| 1 — Role & Team      | Title, category, default workers, backup buffer, experience                |
| 2 — Schedule & Pay   | Calendar, blind demand card, location, timing, demand matrix (pay per day) |
| 3 — Review & Publish | Summary + submit                                                           |

**P2 optional expansion:** Separate Budget step (`DemandPlannerStep4Budget` placeholder exists) — not in P1 flow.

**Legacy 5-step spec (archived):** Identity → Calendar → Demand Matrix → Budget → Review — collapsed into 3-step Gig Projects wizard (Section 18.2).

**On publish:**

1. `updatePlan` / final create with all fields
2. Create child posts with `planId` + `isHiddenFromSearch: true`
3. `demandPlannerStorage.submit(planId, postIds)`
4. `plannerPublicIndex.publish(plan)` — employee discoverability
5. `ensurePlanBroadcastGroup(planId)`
6. Navigate → `/employer/planner/plans/:planId`

**Launch gate:** Do not publish until Employee Mega Card + Public Index (Section 7.8) are implemented.

**Draft:** Auto-save via `updatePlan` on each step.

---

### 7.4. Plan Detail (`/employer/planner/plans/:planId`)

**P1 minimum (no dead end after publish):**

| Block                                         | P1                     | P2                  |
| --------------------------------------------- | ---------------------- | ------------------- |
| Header (name, dates, status, fill %)          | ✅                     | ✅                  |
| Slot summary list (date, fill, pay, View Day) | ✅ read-only list      | Calendar grid       |
| `Broadcast to Project Crew` CTA               | ✅                     | ✅                  |
| Crew member count                             | ✅                     | ✅ + member list    |
| Day drawer                                    | Link to post dashboard | Full in-plan drawer |
| Cancel plan                                   | ✅                     | ✅                  |

**P2 adds:** Month/week calendar, live fill cells, in-plan day drawer, bulk-cancel unfilled posts.

**Day actions (P1 via post dashboard):**

- View applicants → Review Center / post dashboard
- Invite Favorites → plan-context direct invite (Section 4.4)

---

### 7.5. Finance Tab (`/employer/planner/plans/:planId/finance`)

**P1/P2 placeholder (no dead end):**

```txt
Finance & Budget
Track planned vs committed costs for this project.
Full ledger arrives in the next Planner update.
[Back to Plan]
```

**P3:** Full ledger per Section 6.6.

---

### 7.6. Advanced Tab (P4)

Analytics · Templates · Auto-rules · Multi-site

---

### 7.7. Employee Mega Project Card (`/employee/shift/search` — P1)

**Data source:** `wm_planner_public_index_v1` — NOT generic `filteredPosts` loop.

**Feed layout:**

```txt
[ Mega Project Cards section — Teal ]
[ Regular single-shift cards — Green ]
```

**Card:** `Lulu Mall Grand Opening — 30 Days` · pay range · open days count · `[View Project →]`

**Pick & Choose Apply screen:**

1. Calendar grid from `slotDates` + `postIdsByDate`
2. **Open day** — selectable, tap toggles selection
3. **Full day** (vacancies filled) — greyed, `Full` badge, not selectable
4. **Conflict day** — selectable OFF; amber warning chip on cell (Section 8.10.2)
5. **Already applied day** — teal check, not selectable
6. **Live Earnings Calculator (Dopamine Meter)** — sticky footer meter; updates on every tap (Section 8.10.1)
7. Primary CTA: `Submit Application`
8. Secondary (optional): `Apply to all open days` (excludes conflict + full days)

**Live Earnings Meter (Ultra-Premium — P1):**

```txt
┌─────────────────────────────────────────────┐
│  📈  3 Days Selected                        │
│      Estimated earnings: 3,600              │
│  [████████████░░░░░░░░]  animated fill      │
└─────────────────────────────────────────────┘
```

| Rule           | Behavior                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------- |
| Update trigger | Every calendar day toggle (select / deselect)                                                |
| Formula        | Sum of `payPerDay` for selected open days                                                    |
| Animation      | Short count-up on earnings number (respect `prefers-reduced-motion`)                         |
| Zero selection | Meter shows `Select days to see estimated earnings`                                          |
| Copy           | `Estimated Earnings` — not guaranteed pay; subtitle optional: `If all selected days confirm` |

**Intelligent Conflict Guard (Ultra-Premium — P1):**

When employee taps a day that conflicts with an existing **confirmed shift** on same date:

```txt
⚠️ Conflict: You have a Driver shift on this day.
```

| Rule                 | Behavior                                                                             |
| -------------------- | ------------------------------------------------------------------------------------ |
| Detection            | Same `dateKey` as confirmed shift workspace or confirmed application on another post |
| Cell UI              | Amber border + warning icon; day **not selectable**                                  |
| Tap on conflict cell | Tooltip / inline chip with conflict label — no toggle                                |
| Submit guard         | Conflict days excluded even if somehow selected                                      |
| P2                   | Time-overlap within same day if `shiftTiming` present (Section 17.1)                 |

**Commitment Streak preview (P1):** When selection reaches ≥ 5 consecutive days, meter shows teaser: `🏆 Commitment Streak eligible!` before submit. After submit, badge written per Section 6.10.3.

**Submit:** `multiApplyGroup(selectedPostIds, { planId, planApplyBatchId, selectedDates })` + `evaluateCommitmentStreak(planId, selectedDates)`

---

### 7.8. Employee My Work Plan Bundle (`/employee/shift/applications` — P1)

**Problem:** 3-day pick-and-choose creates 3 applications — must not show 3 full cards.

**Solution:** Group by `planApplyBatchId` (or `planId` + same-day batch):

```txt
📋 Lulu Mall Grand Opening
   Applied: Mon · Wed · Fri (3 days)
   Status: 2 under review · 1 confirmed
   [View breakdown →]
```

Tap breakdown → expands to per-day application rows OR navigates to plan apply summary screen.

**Confirmed days:** May still show per-day workspace entries under Workspaces tab — that is correct.

---

### 7.9. Employer My Posts Plan Grouping (`/employer/shift/posts` — P1)

**Problem:** 30 child posts clutter My Posts.

**Solution:**

- Default filter: **Hide planner child posts** (`source === "planner"`)
- Show **Plan summary rows** instead: `March Site Crew · 24 days · 68% filled` → opens `/employer/planner/plans/:planId`
- Toggle: `Show individual plan days` for power users
- Single (non-planner) posts unchanged

---

### 7.10. Employee Shift Home — Project Plans Strip (`/employee/shift/home` — P1)

**Purpose:** Employee-side command entry — parity with employer Shift Home teaser.

**Teal strip (below shift KPIs):**

```txt
📋 Project Plans near you
[N] multi-day projects open · up to X / day
[Browse Projects →]  → /employee/shift/search#project-plans
```

**Data:** `plannerPublicIndex.getActiveEntries()` filtered by profile city/skills (P2); P1 shows all active entries with `openDayCount > 0`.

**Zero state:** Strip hidden when no active plans.

**Pulse:** Silent — no tab pulse. Optional CTA pulse on `Browse Projects` only if new plan since last visit (P2).

---

### 7.11. Employee Project Detail (`/employee/shift/projects/:planId` — P1)

**Purpose:** Full pre-apply command view — **employer Plan Detail counterpart for workers.**

| Block            | Content                                                                  |
| ---------------- | ------------------------------------------------------------------------ |
| Hero             | Plan name, company, location, category, experience badge                 |
| Pay range        | `payMin–payMax / day` from public index (symbol-free — Section 18.8)     |
| Duration         | `dayCount` days · date range from `slotDates`                            |
| Open days        | `openDayCount` shifts still hiring                                       |
| Description      | From plan if exposed in index meta (P2); P1 minimum: category + location |
| Calendar preview | Read-only month strip — open / full / your-applied days color-coded      |
| Trust            | Company name only — no employer phone/email                              |
| Primary CTA      | `[Pick Your Days →]` → Pick & Choose modal or `/projects/:planId/apply`  |
| Secondary        | `[Save project]` (P2), `[Share]` (P4)                                    |

**States:**

| State               | UX                                                                      |
| ------------------- | ----------------------------------------------------------------------- |
| All days full       | CTA disabled · `All days currently full` · `[Notify me if opens]` (P4)  |
| Plan cancelled      | `This project is no longer available` → `[Find other shifts]`           |
| Partial prior apply | Banner: `You applied to 2 of 5 open days` · calendar shows applied days |
| Profile incomplete  | CTA opens profile gate modal                                            |

**Back:** → Find Shifts (`/employee/shift/search`) or Shift Home.

---

### 7.12. Employee Plan Application Summary (`/employee/shift/applications/plan/:planId` — P1)

**Purpose:** Dedicated breakdown screen when worker taps **View breakdown** on My Work bundle — not a dead-end expand-only.

```txt
📋 Lulu Mall Grand Opening
Applied 3 days · 1 confirmed · 1 under review · 1 not selected

[Day rows — same status timeline as single application]
Mon 12 Jan — Confirmed — [Open workspace]
Wed 14 Jan — Under review — [View shift]
Fri 16 Jan — Not selected — [Find similar]

[Pick more days]  (if open days remain)
[Withdraw day]    (per withdrawable row)
```

**Rules:**

- Each day row links to existing per-day application detail / workspace
- `Pick more days` → Project Detail → Pick & Choose (pre-select already-applied days disabled)
- Bundle KPI at top updates live on withdraw / status change
- Plan cancelled → all pending rows show `Project cancelled by employer`

---

### 7.13. Employee Plan Crew Workspace UX (`/employee/shift/workspaces/:id` — P1)

**Purpose:** Worker experience inside Mega Workspace Merge — **BCC privacy enforced on employee UI.**

| Rule                          | Employee sees                                                                            |
| ----------------------------- | ---------------------------------------------------------------------------------------- |
| Crew broadcast                | Message in **their** per-day workspace only — labeled `Project broadcast from [Company]` |
| Other workers                 | **Never** visible — no member list, no group chat, no "X joined" from other workers      |
| Day-specific employer message | Normal workspace update for that day                                                     |
| Reply                         | Existing direct-to-employer channel only — never broadcasts to other workers             |
| Multiple confirmed days       | Separate workspace per day; same plan name badge on each                                 |

**Workspace header badge:** `📋 Project: [Plan Name] · [Date]`

**Pulse:** Attendance confirm pulse per confirmed day — unchanged shift pattern.

---

### 7.14. Employee Direct Invite to Plan Day (P1)

**Trigger:** Employer invites from plan day drawer to hidden `source: "planner"` post.

**Employee flow:**

1. Notification: `Direct invite — [Plan Name] · [Date]`
2. Opens post detail with **Project context banner** (Section 5.4)
3. VIP badge: `⚡ Direct Invite`
4. Accept → confirm path → per-day workspace + `enrollWorkspaceInPlanGroup`
5. My Work shows day in Plan Bundle (or single row if one day)

**Must NOT:** Expose other plan days or other workers in invite acceptance screen.

---

### 7.15. Employee Plan Lifecycle States (P1)

When employer cancels or completes plan — employee surfaces must update atomically:

| Event                   | Employee UX                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------- |
| Plan cancelled          | Mega Card removed; Project Detail → unavailable; bundle shows `Project cancelled`; pending apps `unavailable` |
| Day filled after apply  | Pick & Choose refresh; row stays `under review` until employer acts                                           |
| Partial confirm         | Bundle subtitle: `1 of 3 days confirmed`; unconfirmed days keep own status                                    |
| Employer crew broadcast | Bell + workspace entry per BCC rules (7.13)                                                                   |
| Withdraw one day        | Bundle count updates; day re-opens in calendar if vacant (17.5)                                               |

---

### 7.16. Employee Project Discovery Intelligence (P2–P4)

| Feature                     | Phase | Behavior                                                             |
| --------------------------- | ----- | -------------------------------------------------------------------- |
| Smart match for projects    | P2    | Rank Mega Cards by city, skills, past shift categories               |
| Saved / starred projects    | P2    | `EmployeePlanEngagement.savedAt` — section on Search                 |
| Recently viewed projects    | P2    | Home strip + Search section                                          |
| New project near you bell   | P2    | Silent bell when plan published in worker city                       |
| Project earnings projection | P3    | `Potential X total if all selected days confirmed` on Project Detail |
| Earnings plan tag           | P4    | `Plan: [Name]` on earnings ledger                                    |
| Notify when day reopens     | P4    | After replacement / cancel unfilled slot                             |
| Live Earnings Calculator    | P1    | Section 8.10.1 — dopamine meter on Pick & Choose                     |
| Intelligent Conflict Guard  | P1    | Section 8.10.2 — same-day shift conflict                             |
| Commitment Streak badge     | P1    | Section 8.10.3 — 5+ consecutive days in one apply                    |
| Diary auto-sync on confirm  | P1    | Section 8.10.4 — Home Personal Work Diary calendar                   |

---

### 7.17. Employee Home — Personal Work Diary Calendar Sync (P1)

**Purpose:** Unified Diary Auto-Sync — confirmed planner days appear automatically on employee Home diary calendar.

**Trigger:** Employer confirms worker for a planner day post → `plannerDiarySyncService.upsertConfirmedDay`.

**Home calendar cell:**

| Source                 | Badge                                                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Planner confirmed day  | Teal dot + `📋` mini label                                                                                                                       |
| Single shift confirmed | Green dot (existing)                                                                                                                             |
| Both same day          | Show both micro-badges; Conflict Guard should have blocked apply — if confirm somehow overlaps, diary shows both with warning stripe (edge case) |

**Tap behavior:** Teal badge → plan application summary or per-day workspace.

**Unlock rule:** Shift workers without Career employment **still** see planner/synced shift blocks on Home diary calendar. Diary is not locked to Career-only when shift blocks exist (extends CurrentEmploymentCard locked state logic in implementation).

**Must NOT:** Write to Career `employmentId` diary entries for planner days — use `PersonalCalendarShiftBlock` only.

## 8. Employee Planner Experience — Full Specification (Parity Standard)

**Gap closed (v1.5):** Employer Planner had Command Home, wizard, plan detail, finance, crew broadcast, and lifecycle rules. Employee side previously had only Mega Card + My Work bundle bullets. **This section locks employee parity at the same implementation standard.**

### 8.1. Employer ↔ Employee Parity Map

| Employer capability         | Employee counterpart                            | Section   | Phase |
| --------------------------- | ----------------------------------------------- | --------- | ----- |
| Planner Command Home        | Shift Home project strip + Search Mega section  | 7.10, 7.7 | P1    |
| Plans list                  | Search Mega Cards + `/projects` list            | 7.7, 5.4  | P1/P2 |
| Plan builder / publish      | N/A (employee does not publish)                 | —         | —     |
| Plan detail                 | Project Detail pre-apply                        | 7.11      | P1    |
| Day drawer / post dashboard | Per-day application row + post detail deep link | 7.12, 5.4 | P1    |
| Pick days to hire           | Pick & Choose calendar                          | 7.7       | P1    |
| My Posts plan group         | My Work plan bundle                             | 7.8, 7.12 | P1    |
| Crew broadcast              | BCC workspace inbox                             | 7.13      | P1    |
| Direct invite               | Plan-day VIP invite                             | 7.14      | P1    |
| Finance / budget            | Earnings projection + plan tag                  | 7.16      | P3/P4 |
| Cancel plan                 | Unavailable states + bundle update              | 7.15, 6.8 | P1    |
| Analytics / templates       | Saved projects, smart match                     | 7.16      | P2/P4 |

### 8.2. P1 Launch Blockers (Employee — mandatory with employer P1)

All must ship in the **same release** as employer P1:

1. Mega Project Card + public index feed (7.7)
2. Pick & Choose with profile gate, partial re-apply, earnings footer (7.7)
3. Project Detail page — not modal-only (7.11)
4. Plan Application Summary screen (7.12)
5. My Work plan bundle + breakdown navigation (7.8, 7.12)
6. Shift Home project strip (7.10)
7. Hidden posts excluded from search; deep link banner for invites (5.4)
8. Plan crew workspace BCC UX — no worker-to-worker visibility (7.13)
9. Plan cancel / unavailable employee states (7.15, 6.8)
10. `multiApplyGroup` batch metadata (6.5)
11. **Ultra-Premium:** Live Earnings meter, Conflict Guard, Commitment Streak, Diary sync (8.10)

**Launch gate:** Employer must **not** publish a plan until employee P1 items 1–11 are implemented.

### 8.3. P2 Employee Enhancements

- Dedicated `/employee/shift/projects` browse list with filters
- Smart match ranking for Mega Cards
- Saved + recently viewed projects (`EmployeePlanEngagement`)
- New project near you notification
- Full-page Pick & Choose route (`/projects/:planId/apply`)
- Offline cached public index on Search

### 8.4. P3 / P4 Employee Enhancements

- Earnings projection on Project Detail
- Plan tag on earnings ledger
- Notify when day reopens
- Share project link (P4)

### 8.5. Notifications (Employee — Planner events)

| Event                         | Channel                                | Copy pattern                            |
| ----------------------------- | -------------------------------------- | --------------------------------------- |
| Application submitted (batch) | Silent bell                            | `Applied to [N] days — [Plan Name]`     |
| Shortlisted (day)             | Silent bell + optional pulse on bundle | `[Plan Name] · [Date] — shortlisted`    |
| Confirmed (day)               | Silent bell + pulse on attendance      | `Confirmed for [Date] — [Plan Name]`    |
| Direct invite                 | Action bell                            | `Direct invite — [Plan Name]`           |
| Plan crew broadcast           | Silent bell per workspace              | `Project update — [Plan Name]`          |
| Plan cancelled                | Silent bell                            | `[Plan Name] was cancelled by employer` |
| Day reopened                  | Silent bell (P2)                       | `[Date] reopened — [Plan Name]`         |

**Never** mix Career notification domain.

### 8.6. Offline / Error / Empty (Employee Planner)

Extends Section 17.7:

| Surface                  | Empty                           | Error           | Offline                     |
| ------------------------ | ------------------------------- | --------------- | --------------------------- |
| Mega Card section        | `No project plans near you yet` | Retry           | Cached index + badge        |
| Project Detail           | Plan cancelled / not found      | Retry           | Cached if previously viewed |
| Pick & Choose            | All days full                   | Retry           | Block submit                |
| Plan Application Summary | Redirect if no apps             | Retry           | Read-only cached statuses   |
| Home project strip       | Hidden                          | Hidden on error | Show cached count           |

### 8.7. Accessibility (Employee Planner)

- Calendar cells 44×44px (inherits 17.8)
- Selected day: `aria-pressed` + visible check
- Bundle expand: `aria-expanded` on breakdown
- Project Detail CTA: descriptive label `Pick your available days for [Plan Name]`
- Screen reader: plan name read before pay range

### 8.8. Must NOT (Employee)

- Mix with Career applications or Career nav
- Show employer budget, fill %, or internal planner KPIs
- Show 30 search cards or 30 My Work cards for one plan
- Show other workers on same project
- Group chat between workers on same plan
- Expose hidden child posts in main search feed

### 8.9. Employee Code Map (Target)

| Component / page                     | Path                                         | Phase |
| ------------------------------------ | -------------------------------------------- | ----- |
| `PlannerMegaProjectSection`          | Search Mega Cards                            | P1    |
| `PlannerPickChooseModal`             | Pick & Choose                                | P1    |
| `EmployeeProjectDetailPage`          | `/projects/:planId`                          | P1    |
| `EmployeePlanApplicationSummaryPage` | `/applications/plan/:planId`                 | P1    |
| `PlannerMyWorkPlanBundle`            | My Work bundle row                           | P1    |
| `EmployeeShiftHomeProjectStrip`      | Shift Home strip                             | P1    |
| `employeeAvailability.service`       | `EmployeeAvailability` builder (6.11)        | P1    |
| `smartEarningsPredictor.service`     | `SmartEarningsPredictorPayload` meter (6.11) | P1    |
| `employeePlanEngagement.storage`     | Saved / recent                               | P2    |
| `EmployeeProjectsListPage`           | `/projects`                                  | P2    |

### 8.10. Ultra-Premium Employee Gig Features (P1 Launch Differentiators)

Four premium features that make Mega Project apply feel **agency-grade** — not a basic multi-select form.

#### 8.10.1. Live Earnings Calculator (Dopamine Meter) 📈

**Where:** Pick & Choose modal + `/projects/:planId/apply` full page.

**Behavior:** Sticky footer meter updates **on every day tap**:

```txt
3 Days Selected · Estimated earnings: 3,600
```

| UX detail     | Spec                                                                                          |
| ------------- | --------------------------------------------------------------------------------------------- |
| Visual        | Teal progress bar fills proportionally to `selectedDays / openDays`                           |
| Animation     | Earnings number count-up 200–400ms per change                                                 |
| Motivation    | More days selected → visibly higher earnings → drives larger batch applies                    |
| Accessibility | Screen reader announces `3 days selected, estimated earnings 3600` (no currency symbol in P1) |

**Phase:** P1 mandatory.

---

#### 8.10.2. Intelligent Conflict Guard ⚠️

**Where:** Each calendar cell in Pick & Choose.

**Behavior:** If employee already has a **confirmed** shift on that calendar date:

```txt
⚠️ Conflict: You have a Driver shift on this day.
```

| Rule    | Detail                                                                          |
| ------- | ------------------------------------------------------------------------------- |
| Block   | Day cannot be selected                                                          |
| Label   | Uses `jobName` from conflicting post                                            |
| Scope   | Shift domain only — applications, workspaces, confirmed posts on same `dateKey` |
| Purpose | 100% prevention of double-booking same day                                      |

**Phase:** P1 mandatory. P2 adds time-overlap within day (Section 17.1).

---

#### 8.10.3. Commitment Streak Badge 🏆

**Earn:** Single Pick & Choose submit with **≥ 5 consecutive calendar days** selected on same `planId`.

**Employee:** Badge `🏆 Commitment Streak` on profile (Shift badges area — not Career).

**Employer:** Candidate card on plan day post dashboard shows:

```txt
🏆 Commitment Streak · Applied to 7 consecutive days
```

**Agency value:** Signals reliability — agencies prefer workers who commit to multi-day blocks.

| Rule        | Detail                                                            |
| ----------- | ----------------------------------------------------------------- |
| Consecutive | Calendar-adjacent dates only (Mon–Fri gap breaks streak)          |
| Per batch   | Evaluated on submit from `selectedDates` array                    |
| Re-apply    | Second batch can extend streak record; badge persists once earned |
| Storage     | Section 6.10.3                                                    |

**Phase:** P1 mandatory.

---

#### 8.10.4. Unified Diary Auto-Sync 📅

**Trigger:** Employer **confirms** employee for planner day (not on apply alone).

**Result:** That date auto-appears on employee **Home → Personal Work Diary** calendar:

- Teal / planner badge: `📋 [Plan Name]`
- No manual diary entry required

**Hook:**

```ts
// On confirm success when post.source === "planner":
plannerDiarySyncService.upsertConfirmedDay({ planId, postId, dateKey, ... })
```

**Lifecycle:**

| Event              | Diary block                        |
| ------------------ | ---------------------------------- |
| Confirmed          | Teal badge appears                 |
| Plan cancelled     | Block → `cancelled`; badge softens |
| Replaced / no-show | Block → `replaced` or removed      |
| Completed shift    | Block → `completed`                |

**Career separation:** Does not write to Career `workDiary.storage` employment rows. Uses `PersonalCalendarShiftBlock` (6.10.4).

**Phase:** P1 mandatory.

---

#### 8.10.5. Ultra-Premium parity checklist (P1)

- [ ] Live Earnings meter animates on every selection change
- [ ] Conflict cells show warning + are unselectable
- [ ] 5+ consecutive day submit earns Commitment Streak badge
- [ ] Employer applicant card shows streak badge
- [ ] Confirm hook syncs teal badge to Home diary calendar
- [ ] Shift-only workers see synced calendar blocks (diary not Career-locked only)

### 8.11. Employee Availability Calendar + Smart Earnings Predictor (P1)

**Purpose:** Employee-side premium parity — canonical UX wiring for Section 6.11 types.

#### 8.11.1. Employee Availability Calendar

**Where:** Project Detail (7.11), Pick & Choose modal/page (7.7), Plan Application Summary (7.12).

| Step                        | Behavior                                                                            |
| --------------------------- | ----------------------------------------------------------------------------------- |
| Open plan                   | `EmployeeAvailabilityService.build()` from public index + shift posts + worker apps |
| Render cell                 | Map `EmployeeAvailabilityDay.status` → color, badge, `selectable`                   |
| Tap day                     | `toggleSelection()` only if `selectable === true`                                   |
| Conflict                    | `status === "conflict"` → show `PlannerDayConflict.conflictLabel` chip              |
| Re-open after partial apply | Applied/confirmed days non-selectable; open days remain selectable                  |

**Calendar cell visual map:**

| `status`           | Cell                     | Tap              |
| ------------------ | ------------------------ | ---------------- |
| `open`             | White / selectable       | Toggle selection |
| `selected` (badge) | Teal fill + check        | Deselect         |
| `full`             | Grey + `Full`            | Disabled         |
| `applied`          | Teal check               | Disabled         |
| `confirmed`        | Green check              | Disabled         |
| `conflict`         | Amber + `⚠️ Conflict: …` | Disabled         |
| `cancelled`        | Muted strikethrough      | Disabled         |
| `past`             | Muted                    | Disabled         |

#### 8.11.2. Smart Earnings Predictor (Dopamine Meter)

**Where:** Sticky footer on Pick & Choose — updates on **every** `toggleSelection`.

| Field                          | UI binding                                   |
| ------------------------------ | -------------------------------------------- |
| `meter.label`                  | Primary footer text                          |
| `meter.displayAmount`          | Animated count-up target                     |
| `meter.fillRatio`              | Progress bar width                           |
| `earnings.estimatedTotal`      | P1 source of truth for meter amount          |
| `commitmentStreak.teaserLabel` | Shown when `eligible === true` before submit |
| `disclaimer`                   | Small print below meter                      |

**Rebuild trigger:**

```ts
onDayToggle(dateKey) {
  const nextAvailability = availabilityService.toggleSelection(availability, dateKey);
  const predictor = earningsPredictor.build({
    availability: nextAvailability,
    selectedDateKeys: nextAvailability.selectedDateKeys,
  });
  setAvailability(nextAvailability);
  setPredictor(predictor);
}
```

**P1 formulas:**

```ts
estimatedTotal = sum(dayLines where includedInSelection && confidence === "selected_open", meterAmount)
optimisticTotal = sum(all selected open day payPerDay)
conservativeTotal = sum(confirmed day pay in this plan for worker)
fillRatio = selectedDayCount / max(1, selectableDayCount)
```

**Phase:** P1 mandatory — pairs with 8.10.1 Live Earnings Calculator.

#### 8.11.3. P1 checklist (Availability + Predictor)

- [ ] `EmployeeAvailability` built from index + posts + apps (no Career reads)
- [ ] Conflict days set `status: "conflict"` and `selectable: false`
- [ ] Meter rebuilds on every selection toggle
- [ ] `meter.label` matches `N Days Selected · Estimated earnings: X` pattern (symbol-free)
- [ ] Commitment streak teaser when 5+ consecutive selected days

## 9. Integration Points

| Feature                  | Integration                                                                        |
| ------------------------ | ---------------------------------------------------------------------------------- |
| Direct Invite            | Plan day drawer; `source === "planner"` bypasses hidden-post block (Section 4.4)   |
| Local Workers Radar      | Shift Home only                                                                    |
| Per-day Workspaces       | Still created on confirm per post                                                  |
| Mega Workspace Merge     | `confirmCandidate` / `confirmDirectInviteCandidate` → `enrollWorkspaceInPlanGroup` |
| Review Center            | Per-post; batch badge on applicant card                                            |
| Favorites                | Plan day drawer primary; planner-context post picker                               |
| Employee Mega Card       | `plannerPublicIndex` feed                                                          |
| Employer My Posts        | Plan grouping filter                                                               |
| Employee My Work         | `planApplyBatchId` grouping + Plan Application Summary (7.12)                      |
| Employee Project Detail  | `plannerPublicIndex` → `/projects/:planId` (7.11)                                  |
| Employee Shift Home      | Project plans strip (7.10)                                                         |
| Employee workspace BCC   | No worker-to-worker UI on plan crew (7.13)                                         |
| Live Earnings Calculator | Pick & Choose sticky meter (8.10.1)                                                |
| Conflict Guard           | Calendar cell conflict detection (8.10.2)                                          |
| Commitment Streak        | Profile badge + employer applicant card (8.10.3)                                   |
| Diary auto-sync          | `plannerDiarySyncService` on confirm (8.10.4, 7.17)                                |
| Employee Availability    | `EmployeeAvailabilityService.build` on Pick & Choose open (6.11, 8.11)             |
| Smart Earnings Predictor | `SmartEarningsPredictorService.build` on day toggle (6.11, 8.11)                   |
| Employer Review Center   | `🏆 Commitment Streak` tag on applicant card when earned                           |

## 10. Notifications & Pulse

| Event                              | Channel                           | Pulse? |
| ---------------------------------- | --------------------------------- | ------ |
| Plan published                     | Silent bell (employer)            | No     |
| New project near you (optional P2) | Silent bell (employee)            | No     |
| Day low fill                       | In-plan alert card                | No     |
| Worker accepts direct invite       | Silent bell (employer)            | No     |
| Review applicant                   | Review pulse on CTA               | Yes    |
| Plan crew broadcast                | Silent bell (all crew workspaces) | No     |

## 11. Implementation Phases

### P0 — Foundation

- [ ] `--wm-planner-*` tokens + `shift-planner.css`
- [ ] Routes `/employer/planner/*` + legacy redirect
- [ ] `employerPlanner` in `navigation.config.ts` + `useDynamicNav`
- [ ] Planner shell (Teal header) + placeholder home
- [ ] Shift Home Teal teaser

**Acceptance:** Planner tab shows Teal; `/employer/planner/home` renders; back navigation works.

---

### P1 — Core Loop (Employer + Employee + Workspace — single release)

**Employer:**

- [ ] `EmployerPlannerHomePage` + `EmployerPlannerPlansListPage`
- [ ] Wizard migrate + `updatePlan` draft auto-save + resume query params
- [ ] `EmployerPlannerDetailPage` **P1 minimum** (Section 7.4)
- [ ] Finance **placeholder** page (Section 7.5)
- [ ] Publish: `planId` posts + public index + broadcast group shell
- [ ] Plan cancel flow
- [ ] My Posts plan grouping (Section 7.9)
- [ ] Planner direct invite exception (Section 4.4)
- [ ] `Broadcast to Project Crew` on plan detail

**Employee (P1 — full parity, not thin MVP):**

- [ ] `plannerPublicIndex` storage + publish on plan submit
- [ ] Mega Project Card wired in `ShiftSearchPage` (7.7)
- [ ] Hide planner posts from `ShiftSearchResultsList`
- [ ] `PlannerPickChooseModal` + full-page apply route (7.7, 5.4)
- [ ] `EmployeeProjectDetailPage` `/projects/:planId` (7.11)
- [ ] `EmployeePlanApplicationSummaryPage` `/applications/plan/:planId` (7.12)
- [ ] `PlannerMyWorkPlanBundle` + breakdown navigation (7.8, 7.12)
- [ ] Shift Home project strip (7.10)
- [ ] Project context banner on hidden post deep links / direct invite (5.4, 7.14)
- [ ] Plan crew workspace BCC UX — no worker-to-worker UI (7.13)
- [ ] Plan cancel / unavailable employee states (7.15, 6.8)
- [ ] `multiApplyGroup` with batch metadata (6.5)
- [ ] Profile incomplete → redirect modal
- [ ] Employee plan notifications per Section 8.5
- [ ] **Ultra-Premium P1:** Live Earnings Calculator meter (8.10.1)
- [ ] **Ultra-Premium P1:** Intelligent Conflict Guard on calendar (8.10.2)
- [ ] **Ultra-Premium P1:** Commitment Streak badge earn + employer card tag (8.10.3)
- [ ] **Ultra-Premium P1:** Diary auto-sync on confirm → Home calendar (8.10.4, 7.17)
- [ ] **P1:** `EmployeeAvailability` calendar builder (6.11, 8.11)
- [ ] **P1:** `SmartEarningsPredictorPayload` meter on day toggle (6.11, 8.11)

**Workspace:**

- [ ] `PlanBroadcastGroup` storage
- [ ] Enroll on `confirmCandidate` + `confirmDirectInviteCandidate`
- [ ] `broadcastToPlanCrew()` with BCC delivery (7.13)
- [ ] `plannerDiarySyncService.upsertConfirmedDay` on planner confirm (8.10.4)
- [ ] Employee workspace plan badge + no worker-to-worker UI (7.13)

**Acceptance:** Full E2E per Appendix D — no dead ends. **Employer publish blocked until employee P1 checklist complete.**

---

### P2 — Plan Detail Calendar + Live Fill + Edit Rules

**Employer:**

- [ ] Full calendar grid on plan detail
- [ ] In-plan day drawer
- [ ] Live fill % in cells
- [ ] Crew member list
- [ ] Limited edit unfilled future slots
- [ ] Bulk-cancel unfilled child posts UI/helper on plan cancel (P1 API already closes unfilled posts — P2 adds enhanced confirm UX only)

**Employee:**

- [ ] `/employee/shift/projects` dedicated browse list
- [ ] Smart match ranking for Mega Cards (7.16)
- [ ] Saved + recently viewed projects — `EmployeePlanEngagement` (6.9)
- [ ] New project near you bell (8.5)
- [ ] Offline cached public index on Search (8.6)
- [ ] Day reopened notification after replacement (7.16)

---

### P3 — Finance Tab

- [ ] `plannerFinanceStorage` + full ledger UI + CSV export

---

### P4 — Advanced

- [ ] Templates · Analytics · Duplicate plan · Earnings plan tag

## 12. Current Code Map (As of 2026-07-01)

| Area                    | Path                               | Status                                                |
| ----------------------- | ---------------------------------- | ----------------------------------------------------- |
| Wizard                  | `EmployerDemandPlannerPage.tsx`    | 3-step; `isHiddenFromSearch: false` today — **wrong** |
| Planner hook            | `useEmployerDemandPlannerState.ts` | No planId on posts                                    |
| Plan storage            | `demandPlannerStorage.ts`          | No `updatePlan` / `cancel`                            |
| Mega card               | `ShiftMultiDayPlanCard.tsx`        | Apply-all only; not wired                             |
| Multi-day UI            | `ShiftSearchMultiDayPlans.tsx`     | **Not wired** to search page                          |
| Grouping                | `groupPostsByPlan()`               | Heuristic — replace                                   |
| Direct invite           | `shiftDirectInvite.service.ts`     | **Blocks** hidden posts                               |
| Nav                     | `useDynamicNav.ts`                 | No `employerPlanner` domain                           |
| Public index            | `plannerPublicIndex.storage.ts`    | P1 built                                              |
| Plan broadcast          | `planBroadcast.service.ts`         | P1 BCC built                                          |
| Employee Mega section   | `PlannerMegaProjectSection.tsx`    | P1 partial — modal only, no Project Detail page       |
| Employee Project Detail | —                                  | **Not built** (7.11)                                  |
| Employee Plan Summary   | —                                  | **Not built** (7.12)                                  |
| Employee Home strip     | —                                  | **Not built** (7.10)                                  |

## 13. Explicitly Out of Scope

- Workforce Ops · HR Roster · Career cross-post · Real payment gateway · Permanent lifecycle · Admin plan budgets · Full-card pulse on planner dashboard

## 14. Zero Dead-End Rules (Complete)

| Entry                        | Next step                                                                               | Phase |
| ---------------------------- | --------------------------------------------------------------------------------------- | ----- |
| Shift Home teaser            | Planner Home                                                                            | P0    |
| Planner Home                 | New Plan / Plans list / Active plan                                                     | P1    |
| Planner back                 | Planner Home or Shift Home link                                                         | P0    |
| New Plan wizard              | Steps 1–3 (Schedule & Pay includes matrix + pay gate — Section 18.9)                    | P1    |
| Draft card                   | Resume `?planId&step=`                                                                  | P1    |
| Wizard publish               | Plan Detail P1 minimum                                                                  | P1    |
| Plan Detail → View Day       | Post dashboard (applicants, invite)                                                     | P1    |
| Plan Detail → Broadcast      | Crew broadcast modal → sent                                                             | P1    |
| Plan Detail → Finance        | Placeholder → Back to Plan                                                              | P1    |
| Plan Detail → Cancel         | Confirm → cancelled; Mega Card removed; unfilled posts closed; pending apps unavailable | P1    |
| Plans list empty             | New Plan CTA                                                                            | P1    |
| Employee Mega Card           | Pick & Choose calendar                                                                  | P1    |
| Employee Project Detail      | Pick days CTA → apply                                                                   | P1    |
| Plan bundle → View breakdown | Plan Application Summary                                                                | P1    |
| Shift Home project strip     | Find Shifts Mega section                                                                | P1    |
| Direct invite notification   | Post detail + project banner                                                            | P1    |
| Crew broadcast received      | Per-day workspace inbox only                                                            | P1    |
| Profile incomplete on apply  | Profile modal → Profile page                                                            | P1    |
| Submit application           | Toast success → My Work bundle row                                                      | P1    |
| My Work bundle               | Expand per-day breakdown                                                                | P1    |
| Employer My Posts            | Plan row → Plan Detail                                                                  | P1    |
| Favorites invite (plan day)  | Direct invite modals (employee safety)                                                  | P1    |
| Confirm worker               | Workspace + plan crew enroll                                                            | P1    |
| Finance P3 not ready         | Placeholder honest copy                                                                 | P1    |
| Publish failed               | Retry publish (idempotent) or cancel draft                                              | P1    |
| All days full on apply       | Refresh calendar + updated selection                                                    | P1    |
| Withdraw plan day            | Bundle updates or Find Shifts CTA                                                       | P1    |
| Replace no-show              | Post dashboard → reopen vacancy                                                         | P1    |
| Invalid plan URL             | Plan not found → Planner Home                                                           | P1    |
| Offline on publish           | Block with offline message                                                              | P1    |

## 15. QA Checklist (Launch-Ready)

- [ ] Teal only in Planner subdomain
- [ ] `employerPlanner` nav domain active on `/employer/planner/*`
- [ ] Publish creates posts with `planId` + `isHiddenFromSearch: true`
- [ ] Public index written on publish; removed on cancel
- [ ] Employee Project Detail page (`/projects/:planId`) — not modal-only
- [ ] Plan Application Summary screen with per-day breakdown
- [ ] Shift Home project plans strip (7.10)
- [ ] Plan crew workspace BCC — worker never sees other crew members
- [ ] Employee plan cancel / unavailable states (7.15)
- [ ] Employee search: 1 Mega Card per plan; 0 child cards in main list
- [ ] Pick & Choose: subset apply + full-day greyed + already-applied disabled
- [ ] Profile incomplete → profile redirect (not silent fail)
- [ ] My Work: 1 bundle row per batch (not N cards)
- [ ] Employer My Posts: plan grouped (not 30 rows default)
- [ ] Direct invite works on planner hidden post from day drawer
- [ ] Confirm → plan crew enroll; dedupe by `workerWmId`
- [ ] `broadcastToPlanCrew` reaches all crew workspaces
- [ ] Draft save + resume works
- [ ] Cancel plan removes Mega Card; unfilled child posts closed; pending apps cancelled/unavailable; confirmed workspaces retained
- [ ] Finance placeholder (pre-P3) — no 404
- [ ] No dead ends in Appendix D journeys
- [ ] Section 17.10 failure cases F1–F32 pass
- [ ] Live Earnings meter on Pick & Choose (8.10.1)
- [ ] Conflict Guard blocks same-day double booking (8.10.2)
- [ ] Commitment Streak badge + employer card tag (8.10.3)
- [ ] Diary auto-sync teal badges on Home calendar (8.10.4)
- [ ] `tsc --noEmit` + lint pass

## 16. Approval & Maintenance

| Role          | Action                                                                          |
| ------------- | ------------------------------------------------------------------------------- |
| Product Owner | **Approved v1.7** (2026-07-01) — Availability + Earnings Predictor types locked |
| Architect     | This document is implementation contract                                        |
| Developer     | P0 → P1 → P2 → P3 → P4 only                                                     |
| QA            | Appendix D + Section 15 + Section 17.10 per phase                               |

**Version bump rule (mandatory on every edit):**

1. Increment `Document version:` on **line 4** of this file header (e.g. v1.3 → v1.4).
2. Update `Document version` in Section 1 table to the same value.
3. Add a row to Appendix C changelog.
4. Sync `00_PLANNER_INDEX.md` header line 4 + status table to the same version.

## 17. Architecture Hardening (v1.7)

The following sections close audit gaps for production-grade Planner behavior. All rules apply **only** to the Shift Jobs Demand Planner subdomain. **Never** mix with Career Jobs, Workforce Ops, or HR Roster.

---

### 17.1. Booking Conflict & Overfill Protection

**Purpose:** Prevent double-booking, over-confirmation, and race conditions when many workers apply to plan days simultaneously.

**Scope:** Per-day child `ShiftPost` vacancies — Planner does not invent a separate booking engine; it enforces rules on existing shift post confirm logic.

| Rule                             | Behavior                                                                                                                                   |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Vacancy cap                      | `confirmedIds.length` MUST NOT exceed `post.vacancies` for any plan day post                                                               |
| Apply cap                        | Active applications (`applied`, `shortlisted`, `waiting`, `confirmed`) count toward visibility; full days greyed in Pick & Choose calendar |
| Concurrent confirm               | Last-writer-wins is **forbidden**. Confirm action must re-read post snapshot and reject if `confirmedIds.length >= vacancies`              |
| Same worker, multiple plan days  | Allowed — each day is independent apply/confirm                                                                                            |
| Same worker, same day, two plans | Allowed only if shift times do not overlap (P1: date-level check; P2: time overlap check if `shiftTiming` present)                         |
| Overfill UI                      | Employer confirm button disabled at cap with copy: `All slots filled for this day`                                                         |
| Plan fill %                      | `confirmed / slot.workers` per day; never > 100% in KPI display                                                                            |

**Conflict detection (employee apply — P1 Intelligent Conflict Guard):**

```ts
// On calendar render + before multiApplyGroup(selectedPostIds):
for each dateKey in slotDates:
  const conflict = getShiftDayConflict(dateKey, excludePlanId?)
  if conflict → cell shows warning chip; day not selectable

// getShiftDayConflict checks:
// - confirmed application on another post same dateKey
// - active workspace same dateKey
// - confirmedIds on other post same planSlotDate / startAt date
```

**UI copy pattern:** `⚠️ Conflict: You have a [jobName] shift on this day.`

**Dead-end prevention:**

| Situation                                   | Next step                                                                                     |
| ------------------------------------------- | --------------------------------------------------------------------------------------------- |
| All selected days became full before submit | Toast: `Some days filled up. Review your selection.` → calendar refreshes with updated states |
| Employer confirm at cap                     | Inline message + link `View next unfilled day` on plan detail                                 |

---

### 17.2. Backend Source-of-Truth Migration Model

**Purpose:** Local-first Planner must migrate cleanly when backend/login ships — without rewriting product rules.

**Phase model:**

| Phase             | Source of truth                      | Planner behavior                            |
| ----------------- | ------------------------------------ | ------------------------------------------- |
| **Now (local)**   | `localStorage` keys in this document | Full P1 loop demo-safe                      |
| **Backend-ready** | API owns plans, posts, applications  | Local storage becomes cache + offline queue |
| **Connected**     | Server authoritative                 | Client optimistic UI with server reconcile  |

**Entity ownership map (future API):**

| Entity                    | Local key today                     | Future API resource                          |
| ------------------------- | ----------------------------------- | -------------------------------------------- |
| `DemandPlan`              | `wm_employer_demand_plans_v1`       | `POST /employer/shift/plans`                 |
| Child `ShiftPost`         | `wm_employer_shift_posts_v1`        | `POST /employer/shift/posts` (with `planId`) |
| `PlannerPublicIndexEntry` | `wm_planner_public_index_v1`        | `GET /employee/shift/plans/discover`         |
| `PlanBroadcastGroup`      | `wm_planner_broadcast_groups_v1`    | `POST /employer/shift/plans/:id/broadcast`   |
| Applications              | `wm_employee_shift_applications_v1` | `POST /employee/shift/applications`          |

**Migration rules:**

1. Every local record carries `schemaVersion: 1` and `clientUpdatedAt` for reconcile.
2. `planId` and `source: "planner"` on posts are **required** before backend — they become server foreign keys.
3. No Career Jobs fields or endpoints in Planner API namespace — namespace stays `/shift/plans/*`.
4. On login connect: upload local drafts first, then active plans, then resolve ID mapping table `localPlanId → serverPlanId`.
5. Public index is **derived** on server from plan + post vacancy state — not manually duplicated long-term.

**Dead-end prevention:**

| Situation                       | Next step                                                                   |
| ------------------------------- | --------------------------------------------------------------------------- |
| Local plan exists, user logs in | Merge wizard: `Sync your local plans` → review → upload or discard per plan |
| Server rejects publish          | Show server message + `Edit plan` — never silent failure                    |

---

### 17.3. Idempotency, Multi-tab Safety & Publish Lock

**Purpose:** Prevent duplicate posts, double publish, and corrupted drafts when employer uses multiple tabs or retries.

| Mechanism                   | Rule                                                                                                                          |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Publish lock**            | While publish in flight, wizard shows non-dismissible `Publishing plan…` and disables submit                                  |
| **Publish idempotency key** | `publishRequestId = planId + ":" + submittedAtAttempt` stored on plan; retry with same key must not create second post set    |
| **Post creation guard**     | If `plan.slots[].postId` already set for a date, skip re-create on retry                                                      |
| **Multi-tab draft**         | `updatePlan` uses `updatedAt` optimistic check; stale tab shows `This plan was updated elsewhere. Reload draft.` → `[Reload]` |
| **Multi-tab publish**       | Second tab detect `status === "active"` → redirect to plan detail, not re-publish                                             |
| **Employee bulk apply**     | `planApplyBatchId` generated once per submit; duplicate submit with same batchId ignored                                      |

**Storage flags on `DemandPlan`:**

```ts
publishStatus?: "idle" | "publishing" | "published" | "failed";
publishRequestId?: string;
publishError?: string;
```

**Dead-end prevention:**

| Situation              | Next step                                                                                                                          |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Publish failed mid-way | Plan stays `draft` or `publishStatus: failed` with partial `postId`s; UI offers `[Retry publish]` (idempotent) or `[Cancel draft]` |
| Stale wizard tab       | Reload draft button restores latest `draftStep`                                                                                    |

---

### 17.4. Planner Audit Log

**Purpose:** Agency managers need a trustworthy history of plan changes, publishes, cancels, and crew broadcasts — without Admin domain mixing.

**Scope:** Employer-visible, plan-scoped audit trail. Not payroll. Not Career.

```ts
type PlannerAuditEntry = {
  id: string;
  planId: string;
  at: number;
  actor: "employer" | "system";
  action:
    | "draft_saved"
    | "published"
    | "publish_failed"
    | "cancelled"
    | "day_post_created"
    | "crew_broadcast"
    | "plan_completed"
    | "edit_unfilled_slot";
  summary: string; // human-readable
  meta?: Record<string, string | number>;
};
```

Storage key: `wm_planner_audit_log_v1` (cap 200 entries per plan, FIFO trim)

**UI:** Plan Detail → `Activity` tab (P2) or collapsible panel on P1 minimum.

**Must log:** publish, cancel, crew broadcast, failed publish retry, slot edit (P2).

**Dead-end prevention:** Empty audit → `No activity yet. Publish your plan to start tracking.`

---

### 17.5. Employee Withdraw / Cancellation Flow

**Purpose:** Workers who applied to plan days must withdraw cleanly without orphaning batch UI or blocking re-apply incorrectly.

**Per-day withdraw (Shift domain — existing pattern):**

| Application status                    | Employee action        | Result                                                                                  |
| ------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------- |
| `applied` / `shortlisted` / `waiting` | Withdraw               | Status → `withdrawn`; day becomes selectable again in Pick & Choose if vacancies remain |
| `confirmed`                           | No self-withdraw in P1 | Copy: `Contact employer via workspace for schedule changes` → opens per-day workspace   |
| `withdrawn`                           | Re-apply               | Allowed if day still open and not blocked by discovery rules                            |

**Plan bundle (My Work):**

- Withdrawing one day updates bundle subtitle: `Applied: Mon · Fri (2 days)` dynamically
- Withdrawing all days in batch → bundle row removed; Mega Card shows days available again

**Notifications:** Silent bell to employer on withdraw — information only, no tab pulse.

**Dead-end prevention:**

| Situation          | Next step                                             |
| ------------------ | ----------------------------------------------------- |
| Withdraw tap       | Confirm modal → success toast → My Work refreshes     |
| All days withdrawn | Empty bundle → `Find more project days` → Find Shifts |

**Career separation:** Withdraw uses shift application storage only — never Career application APIs.

---

### 17.6. Employer Replacement Worker Flow

**Purpose:** No-show or drop-out on a plan day must use existing shift replacement logic — plan-aware, not a new Workforce system.

**Flow (inherits shift post replacement):**

1. Employer opens plan day → post dashboard
2. Marks confirmed worker as `replaced` / `no_show` (existing shift actions)
3. Vacancy reopens on that day post (`confirmedIds` updated)
4. Plan day fill % recalculates
5. Pick & Choose calendar shows day as open again for other employees
6. Optional: promote from `waitingIds` (existing auto-promote if enabled on post)
7. Replacement worker confirmed → new per-day workspace + `enrollWorkspaceInPlanGroup` (dedupe by `workerWmId`)

**Plan crew impact:**

- Replaced worker remains in crew for **past** broadcasts already delivered
- Optional P2: mark workspace `replaced` but keep in crew history; new confirm adds new workspace ID

**Dead-end prevention:**

| Situation       | Next step                                                    |
| --------------- | ------------------------------------------------------------ |
| No waiting list | CTA `Invite favorites` + `View applicants` on post dashboard |
| Day refilled    | Plan detail cell updates to new fill count                   |

---

### 17.7. Offline / Error / Empty / Loading States

**Purpose:** Mobile agency users on weak networks must never stare at a blank screen or lose publish confidence.

| Surface        | Loading                      | Empty                                                     | Error                                | Offline                                                   |
| -------------- | ---------------------------- | --------------------------------------------------------- | ------------------------------------ | --------------------------------------------------------- |
| Planner Home   | Skeleton KPI + plan cards    | Section 7.1 zero state                                    | `Could not load plans. [Retry]`      | Banner: `Offline — showing saved plans` + read-only mode  |
| Wizard publish | Full-screen publish progress | N/A                                                       | `Publish failed. [Retry]` idempotent | Block publish; `You are offline. Publish when connected.` |
| Plan Detail    | Header skeleton              | Invalid planId → `Plan not found. [Back to Planner Home]` | Retry banner                         | Read-only plan summary from cache                         |
| Mega Card feed | Skeleton cards               | No projects: `No project plans near you yet.`             | `Could not load projects. [Retry]`   | Last cached index + offline badge                         |
| Pick & Choose  | Calendar skeleton            | All days full: `All days are currently full.`             | Retry modal                          | Disable submit; show cached selection only                |
| Crew broadcast | Sending…                     | No members: `No confirmed workers yet.`                   | `Broadcast failed. [Retry]`          | Queue locally P2; P1 block with message                   |

**Rules:**

- All error states include a **primary recovery CTA** (Retry, Back, or Home).
- Never infinite spinner — timeout at 12s → error state.
- Empty ≠ error — distinct copy and iconography.

---

### 17.8. Accessibility & PWA Mobile Rules

**Purpose:** Planner is mobile-first for agency managers and workers on mid-range Android devices (PWA / Capacitor).

| Rule          | Requirement                                                                           |
| ------------- | ------------------------------------------------------------------------------------- |
| Touch targets | Minimum 44×44px for calendar day cells and primary CTAs                               |
| Color         | Teal accent never sole indicator — always pair with text label or icon                |
| Contrast      | Teal on white meets WCAG AA for body text; pay amounts use `--wm-er-text`             |
| Focus         | Wizard steps announce `Step 3 of 5` to screen readers                                 |
| Calendar      | Selected days: `aria-pressed="true"` + text `Selected`                                |
| Motion        | Respect `prefers-reduced-motion` — disable pulse/halo for planner dashboard           |
| PWA safe area | Planner header respects `env(safe-area-inset-top)`                                    |
| Bottom nav    | 5-tab employer nav — Planner label never truncates to unreadable glyph on 320px width |
| Haptics       | Light haptic on calendar day toggle (employee) — same as existing tab haptic pattern  |
| Orientation   | Calendar usable in portrait; landscape optional P2                                    |

**Dead-end prevention:** Accessibility skip link on wizard → `Skip to review step` is **not** allowed (skips validation). Use `Back` and validated `Next` only.

---

### 17.9. Advanced Planner Feature Backlog

**Purpose:** Capture premium ideas without blocking P1. **Do not implement** until listed phase unless PO promotes item.

| #   | Feature                                    | Phase | Notes                                              |
| --- | ------------------------------------------ | ----- | -------------------------------------------------- |
| A1  | Holiday skip + copy-week pattern           | P2    | Wizard step 2                                      |
| A2  | Auto-suggest pay bump on low fill          | P4    | Suggestion only                                    |
| A3  | Plan templates library                     | P4    | Section 7.6                                        |
| A4  | Multi-site per plan                        | P4    | Enterprise                                         |
| A5  | Employee bell: new project near you        | P2    | Section 10                                         |
| A6  | Offline broadcast queue                    | P2    | Section 17.7                                       |
| A7  | Time-overlap conflict (same worker)        | P2    | Section 17.1                                       |
| A8  | Bulk-cancel unfilled child posts UI/helper | P2    | Section 6.8 — P1 API already closes unfilled posts |
| A9  | Plan analytics dashboard                   | P4    | Fill trend, cost per worker                        |
| A10 | CSV finance export                         | P3    | Section 6.6                                        |
| A11 | Crew member list with filters              | P2    | Plan detail                                        |
| A13 | Commitment Streak badge                    | P1    | Section 8.10.3                                     |
| A14 | Live Earnings dopamine meter               | P1    | Section 8.10.1                                     |
| A16 | Employee Availability Calendar types       | P1    | Section 6.11, 8.11                                 |
| A17 | Smart Earnings Predictor payload           | P1    | Section 6.11, 8.11                                 |

**Explicitly not in backlog (out of scope):** Career cross-post, Workforce Ops roster, payroll execution, permanent hire conversion.

---

### 17.10. P1 Must-Pass Failure Cases

**Purpose:** QA gate — if any case fails, **P1 is not shippable**. Extends Section 15 and Appendix D.

| #   | Failure case                                      | Expected behavior                                                                                               | Dead-end?                   |
| --- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------- |
| F1  | Publish with 0 workers on all days                | Block with validation: `Set workers needed for at least one day`                                                | No — stay on wizard         |
| F1b | Advance to Review with pay = 0 on all active days | Block on Step 2: `Set pay per day for all N planned days before continuing`; Next disabled when matrix visible  | No — stay on Step 2         |
| F2  | Publish retry after network drop                  | Idempotent — no duplicate posts                                                                                 | No — retry or plan detail   |
| F3  | Two tabs publish same draft                       | Second tab → plan detail, not double publish                                                                    | No                          |
| F4  | 30-day plan publish                               | Exactly 1 Mega Card; 0 child cards in search                                                                    | No                          |
| F5  | Pick & Choose 0 days selected                     | Submit disabled + `Select at least one day`                                                                     | No                          |
| F6  | Pick day that filled during selection             | Excluded on submit + refresh message                                                                            | No                          |
| F7  | Profile incomplete apply                          | Profile modal → Profile page                                                                                    | No                          |
| F8  | Confirm beyond vacancy cap                        | Rejected server-side / storage guard                                                                            | No — inline error           |
| F9  | Direct invite on hidden planner post              | Succeeds from plan day drawer                                                                                   | No                          |
| F10 | Confirm worker                                    | Per-day workspace + crew enroll once per worker                                                                 | No                          |
| F11 | Crew broadcast to 0 members                       | Block: `Confirm workers first` + link to plan days                                                              | No                          |
| F12 | Cancel plan                                       | Mega Card removed; unfilled child posts cancelled; pending apps unavailable; employer sees cancelled plan group | No                          |
| F13 | Withdraw one day in bundle                        | Bundle count updates; day re-open if vacant                                                                     | No                          |
| F14 | Replace no-show worker                            | Vacancy reopens; fill % drops                                                                                   | No — invite/applicants path |
| F15 | Invalid `planId` URL                              | `Plan not found` → Planner Home                                                                                 | No                          |
| F16 | Finance route before P3                           | Placeholder page, not 404                                                                                       | No                          |
| F17 | App reload after publish                          | Plan active, index present, posts linked                                                                        | No                          |
| F18 | Career domain data                                | Zero Career storage reads/writes in Planner code paths                                                          | N/A                         |
| F19 | Employee Project Detail for active plan           | Full pre-apply page renders from public index                                                                   | No                          |
| F20 | Bundle → View breakdown                           | Navigates to Plan Application Summary — not dead-end expand                                                     | No                          |
| F21 | Shift Home project strip                          | Shows when plans exist; links to Search Mega section                                                            | No                          |
| F22 | Direct invite hidden planner post                 | Project context banner + VIP badge; no other workers shown                                                      | No                          |
| F23 | Crew broadcast received                           | Message in worker's workspace only — BCC                                                                        | No                          |
| F24 | Worker cannot see other crew                      | No member list, no group chat, no peer join broadcast                                                           | No                          |
| F25 | Plan cancel employee impact                       | Mega Card gone; bundle shows cancelled; pending unavailable                                                     | No                          |
| F26 | Pick more days from summary                       | Opens Project Detail with prior days disabled                                                                   | No                          |
| F27 | Partial confirm in bundle                         | Subtitle shows mixed statuses per day                                                                           | No                          |
| F28 | Employee offline on Search                        | Cached Mega Cards or honest offline empty state                                                                 | No                          |
| F29 | Live Earnings meter                               | Updates on every day tap with correct sum                                                                       | No                          |
| F30 | Same-day conflict                                 | Conflict cell shows warning; day not selectable                                                                 | No                          |
| F31 | Commitment Streak 5+ days                         | Badge on profile + employer applicant card                                                                      | No                          |
| F32 | Confirm → diary sync                              | Teal badge on Home diary calendar same day                                                                      | No                          |

**Sign-off:** Product Owner + QA must mark all F1–F32 **pass** before first real-user plan publish.

---

**Last updated:** 2026-07-01 (v1.9 — Bespoke visual tier implemented + universal pay display + Step 2 pay gate)  
**Maintainer:** Product Architecture / Mitra Labs

---

## Appendix A — Planner vs Workforce Ops

```txt
WORKFORCE OPS          → hidden ERP, deprioritized
SHIFT DEMAND PLANNER   → launch pillar, agency post+manage loop, Teal domain
```

## Appendix B — Sample Journeys

**Employer:**

```txt
Planner Home → New Plan → Publish → Plan Detail → Day → Review → Confirm
→ Broadcast to crew → (P3) Finance
```

**Employee:**

```txt
Find Shifts → Mega Card → Pick Mon/Wed/Fri → Submit → My Work bundle
→ Per-day status → Confirmed → Workspace + crew broadcast received
```

## Appendix C — Changelog

| Version | Date       | Changes                                                                                                                                                                                                                                        |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0    | 2026-07-01 | Initial Planner master document                                                                                                                                                                                                                |
| v1.1    | 2026-07-01 | Mega Project Card + Mega Workspace Merge                                                                                                                                                                                                       |
| v1.2    | 2026-07-01 | E2E audit: public index, My Work bundle, My Posts grouping, P1 plan detail stub, draft/cancel API, direct invite exception, dead-end table, phase fix, nav domain                                                                              |
| v1.3    | 2026-07-01 | Audit hardening: booking/overfill, backend migration model, idempotency, audit log, withdraw/replacement flows, offline/error states, a11y/PWA, advanced backlog, P1 failure cases (Section 17)                                                |
| v1.4    | 2026-07-01 | Version sync to v1.4; P1 active plan cancel policy hardened (Section 6.8): immediate Mega Card removal, unfilled child post close, pending app unavailable status, cancelled plan group in My Posts; P2 bulk-cancel scoped as enhanced UI only |
| v1.5    | 2026-07-01 | Employee Planner Experience parity: Section 8 full spec, employee routes (5.4), screens 7.10–7.16, EmployeePlanEngagement (6.9), parity map, P1 employee launch blockers, F19–F28 failure cases                                                |
| v1.6    | 2026-07-01 | Ultra-Premium Employee Gig features: Live Earnings Calculator (8.10.1), Intelligent Conflict Guard (8.10.2), Commitment Streak badge (8.10.3), Unified Diary Auto-Sync (8.10.4), data model 6.10, F29–F32                                      |
| v1.7    | 2026-07-01 | Employee Availability Calendar + Smart Earnings Predictor TypeScript contracts (6.11) and UX wiring spec (8.11)                                                                                                                                |
| v1.8    | 2026-07-01 | Bespoke Visual Tier spec (Section 18): quartz glass, wizard morph, pulse glow-swap, odometer meter, mega shimmer, blind demand card, privacy shield                                                                                            |
| v1.9    | 2026-07-01 | Section 18 marked **implemented P1** with file map; universal symbol-free pay display (18.8); Step 2 pay validation gate (18.9, F1b); all UI examples updated to remove hardcoded `₹`; 3-step wizard aligned in routes + `draftStep`           |

## Appendix D — E2E Workflow Verification Matrix

Use labels from `17_END_TO_END_WORKFLOW_CHECKLIST.md`: **Yes verified** / **No** / **Needs verification**

### D.1. Employer — Create & Publish

| Step                                   | Verification                                                     |
| -------------------------------------- | ---------------------------------------------------------------- |
| 1. Open Planner from Shift Home teaser | Route `/employer/planner/home`, Teal chrome                      |
| 2. Create new plan (3 steps)           | Draft saves each step; Step 2 blocks Review if pay missing (F1b) |
| 3. Publish plan                        | Posts created, public index written, plan detail opens           |
| 4. No dead end after publish           | Plan Detail P1 minimum visible                                   |

### D.2. Employer — Hire & Broadcast

| Step                              | Verification                       |
| --------------------------------- | ---------------------------------- |
| 5. Open plan day → post dashboard | Applicants visible                 |
| 6. Invite favorite (plan day)     | Invite sent despite hidden post    |
| 7. Confirm worker                 | Per-day workspace + crew enroll    |
| 8. Broadcast to project crew      | All confirmed crew receive message |
| 9. My Posts default view          | Plan summary row, not 30 cards     |

### D.3. Employee — Discover & Apply

| Step                                 | Verification                                    |
| ------------------------------------ | ----------------------------------------------- |
| 10. Find Shifts shows Mega Card      | One card per plan                               |
| 11. No child post cards in main list | Hidden posts excluded                           |
| 12. Open Project Detail              | `/projects/:planId` renders full pre-apply view |
| 13. Pick & Choose apply              | Subset days only                                |
| 14. Profile incomplete               | Redirect to profile                             |
| 15. My Work shows bundle             | One row per batch                               |
| 16. View breakdown                   | Plan Application Summary opens — per-day rows   |
| 17. Shift Home strip                 | Project plans strip when plans exist            |
| 18. Direct invite to plan day        | Project banner + VIP; accept works              |

### D.4. Employee — Workspace & Lifecycle

| Step                      | Verification                                            |
| ------------------------- | ------------------------------------------------------- |
| 19. Confirm one day       | Workspace + plan badge; no other workers visible        |
| 20. Crew broadcast        | Message in own workspace only (BCC)                     |
| 21. Partial confirm       | Bundle shows mixed day statuses                         |
| 22. Pick more days        | From summary → Project Detail → calendar                |
| 23. Plan cancelled        | Mega Card gone; bundle unavailable state                |
| 24. Live Earnings meter   | Tap days → meter updates with correct symbol-free total |
| 25. Conflict day          | Warning shown; day not selectable                       |
| 26. 5+ consecutive apply  | Commitment Streak badge earned                          |
| 27. Employer confirms day | Teal badge on Home Personal Work Diary calendar         |

### D.5. Lifecycle (Employer + System)

| Step                   | Verification                                                          |
| ---------------------- | --------------------------------------------------------------------- |
| 28. Cancel active plan | Mega Card gone; unfilled child posts closed; pending apps unavailable |
| 29. Resume draft       | Wizard opens at `draftStep`                                           |
| 30. Finance before P3  | Placeholder, not 404                                                  |
| 31. App reload         | Plan, index, applications, diary blocks persist                       |

**Launch requirement:** All **31** steps **Yes verified** before first plan published to real users.

---

## 18. Bespoke Visual Tier — Gig Projects / Agency Mode (v1.8 → **implemented P1 v1.9**)

**Brand name (UI):** Gig Projects (Agency Mode). **Technical domain:** Shift Demand Planner subdomain. **Never** mix with Career Blue or HR Purple.

**PO sign-off (2026-07-01):** Design + animation tier approved as implemented baseline. Section 18 is the locked visual contract for P1.

### 18.1. Obsidian Quartz Glass ✅ P1

All planner surfaces use `--wm-planner-*` tokens with glass treatment:

| Token / class         | Rule                                                             |
| --------------------- | ---------------------------------------------------------------- |
| `--wm-planner-accent` | `#0891b2` primary                                                |
| `.wm-planner-quartz`  | `rgba(255,255,255,0.9)` + `backdrop-blur` + subtle noise texture |
| Cards                 | No flat grey boxes — glass capsule or quartz panel only          |

**CSS:** `src/app/theme/shift-planner.css`

### 18.2. Wizard Container Morphing ✅ P1

`EmployerPlannerNewPage` wraps steps in `PlannerMorphWizardShell`:

- Step transitions use `cubic-bezier(0.16, 1, 0.3, 1)` over ~550ms
- Container physically stretches (`min-height` transition) — not hard cut
- **3-step wizard (P1):** Role & Team → Schedule & Pay → Review & Publish
- **Save Draft** persists to `demandPlannerStorage` (not shift create storage)

**Components:** `src/features/employer/planner/pages/EmployerPlannerNewPage.tsx`, `PlannerMorphWizardShell.tsx`, `useEmployerDemandPlannerState.ts`

### 18.3. Pulse — Left-Edge Neon Glow Swap ✅ P1

When `PulseNode` is active on a planner card:

1. Static card border hidden (`.wm-pulse-glowSwapHost`)
2. Absolute left-edge neon line renders (`w-1.5`, teal for planner node ids — `PLANNER_EDGE_TONE`)
3. On resolve, border restores over `PULSE_GLOW_SWAP_MS` (320ms)

**Forbidden:** Sibling card dimming (Apple Spotlight dimming dropped).

**Files:** `PulseNode.tsx`, `pulseStore.ts` (`PULSE_GLOW_SWAP_MS = 320`)

### 18.4. Employee Pick & Choose — Odometer Earnings Meter ✅ P1

Sticky glass footer (`.wm-planner-earningsCapsule`):

- Rolling digit odometer (`PlannerOdometerAmount`) with elastic settle — **number only, no currency symbol prefix**
- Teal progress bar fill ratio = selected days / open days
- Day tap → double haptic tick (`triggerSelectionHaptic`)
- Conflict cells blocked with `⚠️ Conflict: You have a [jobName] shift on this day`
- Selected day cells show pay amount as plain number (symbol-free)

**Files:** `PlannerPickChooseCalendar.tsx`, `PlannerOdometerAmount.tsx`, `smartEarningsPredictor.service.ts`

### 18.5. Mega Project Card ✅ P1

Find Shifts shows **one card per planId**:

- Left border `4px` teal
- Silver shimmer sweep (`.wm-planner-megaCard--shimmer`)
- Child planner posts never appear as separate search rows
- Pay line uses symbol-free range: `600–800 / day`

**File:** `PlannerMegaProjectSection.tsx`

### 18.6. Blind Demand Indicator (Employer Step 2) ✅ P1

When start date selected, show emerald card:

> 🔥 [Count] available workers found nearby. Publish your shift to reach them!

**Strict:** Count only — no names, avatars, or invite shortcuts on this surface.

**File:** `PlannerBlindDemandCard.tsx`

### 18.7. Privacy Shield (Inherited) ✅ P1

- No phone/email on shift/planner surfaces before confirm
- BCC workspace merge on confirm — workers never see crew list
- Employer broadcast only; worker replies private to employer

### 18.8. Universal Pay Display — No Hardcoded Currency Symbol ✅ P1

Job Mitra is a **universal app**. Planner and Shift surfaces must **not** hardcode `₹`, `$`, or any locale-specific symbol in UI copy.

| Surface                      | Display format              | Example                     |
| ---------------------------- | --------------------------- | --------------------------- |
| Per-day pay                  | `{amount} / day`            | `800 / day`                 |
| Pay range                    | `{min}–{max} / day`         | `600–800 / day`             |
| Estimated total / odometer   | Plain grouped number        | `2,400`                     |
| Budget / cost total          | `{amount} total`            | `24,000 total`              |
| Weekly earnings (Shift Home) | `{amount} earned this week` | `1,250.00 earned this week` |

**Rules:**

| Rule                      | Requirement                                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Employer wizard inputs    | Amount **without** currency symbol (placeholder: `Amount`)                                                                            |
| Employee currency picker  | **Not in P1** — misleading; pay is job-local, not viewer-local                                                                        |
| P2 employer plan currency | Optional `currencyCode` on `DemandPlan` → `Intl.NumberFormat` by **job** currency                                                     |
| Helper (single source)    | `plannerPayDisplay.helpers.ts` — `formatPlannerPayPerDay`, `formatPlannerPayRange`, `formatPlannerPayAmount`, `formatPlannerPayTotal` |

**Aligned with:** Shift Jobs `formatShiftPayDisplay` (`800 / hour`, `800 / day`) and Career “Global Currency Fix” (strip symbols from salary display).

### 18.9. Step 2 Pay Validation Gate ✅ P1

Before advancing from **Schedule & Pay** to **Review & Publish**:

| Check                                | Error / UX                                                           |
| ------------------------------------ | -------------------------------------------------------------------- |
| Calendar + location valid            | Existing `validateDemandPlannerSchedule`                             |
| At least one day with workers > 0    | `Set workers needed for at least one day.`                           |
| Every active day has `payPerDay > 0` | `Set pay per day for all N planned days before continuing.`          |
| Next button                          | Disabled when demand matrix is visible but pay incomplete            |
| Inline hint                          | `Set pay per day for every planned day before continuing.` on matrix |

**Helper:** `validateDemandPlannerDaySlots` in `employerDemandPlanner.helpers.ts`  
**Hook:** `handleStep2ScheduleNext` in `useEmployerDemandPlannerState.ts`  
**Failure case:** F1b (Section 17.10)

### 18.10. P1 Visual Implementation Map

| Feature                                   | Primary file(s)                                                     |
| ----------------------------------------- | ------------------------------------------------------------------- |
| Theme tokens + quartz + morph + meter CSS | `src/app/theme/shift-planner.css`                                   |
| Employer wizard shell                     | `PlannerMorphWizardShell.tsx`                                       |
| Step 2 Schedule & Pay                     | `DemandPlannerStep2SchedulePay.tsx`                                 |
| Gig Projects home                         | `EmployerPlannerHomePage.tsx`                                       |
| Employer plan detail                      | `EmployerPlannerDetailPage.tsx`                                     |
| Employee project detail + apply           | `EmployeeProjectDetailPage.tsx`, `EmployeeProjectPickApplyPage.tsx` |
| Shift Home strip                          | `PlannerShiftHomeProjectStrip.tsx`                                  |
| Profile gate                              | `PlannerProfileGateModal.tsx`                                       |
| Account menu row                          | `AccountMenuSheet` → Gig Projects                                   |
