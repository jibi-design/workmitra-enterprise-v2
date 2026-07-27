# SHIFT OPS MASTER AUDIT CHECKLIST

**Product:** WorkMitra Enterprise v2  
**Scope:** Shift Operations (`src/features/shiftOps`), Shift Jobs (employee + employer), Pulse LED, Phone/OTP verification, Favorites, Availability, Notifications  
**Mode:** READ-ONLY AUDIT — no code changes in this phase  
**Audience:** Windsurf / Cursor execution agents  
**Repo note:** There is no `src/modules/shift/`. Canonical trees are:

| Domain | Path |
|--------|------|
| Shift Ops (greenfield) | `src/features/shiftOps/**` |
| Employee Shift Jobs | `src/features/employee/shiftJobs/**` |
| Employer Shift Jobs | `src/features/employer/shiftJobs/**` |
| Shared Shift bridges | `src/features/shared/shift/**` |
| Shared Shift Ops bridges | `src/features/shared/shiftOps/**` |
| Pulse | `src/features/pulse/**` |
| Phone / country picker | `src/shared/phone/**` |

**Inventory counts (scan baseline):** ShiftOps ~33–51 TS/TSX · Employee shiftJobs ~157 · Employer shiftJobs ~210  

**Known product gaps (must appear on checklist as EXPLICIT N/A or DEFERRED):**
- Live **clock-in / QR attendance timers** — not implemented in FE (comments: v2.1); `attendanceConfirmedAt` is intent-only.
- ShiftOps pages do **not** use `PulseNode` / `PulseTarget` (Pulse lives on Shift Jobs + nav).
- Shift / ShiftOps domain separation from Career must remain intact.

---

## How to use this checklist

For each item mark:

- `[ ]` Not audited  
- `[x]` Pass  
- `[!]` Fail (note file + line / screenshot)  
- `[N/A]` Out of scope / deferred by product  

**Token rules (regression):**
- Worker ShiftOps surfaces → `wm-ee-*` / `wm-primarybtn` / green utility (no accidental `wm-planner-*` teal).
- Employer/manager ShiftOps → `wm-planner-*` / Obsidian (`wm-planner-card--obsidian`, glow primary) OK.
- Pulse LED → **exactly 10×10px circular** indicator; left-edge on cards; outer halo on buttons; **no** full-card blink, no right-edge LEDs, no dim text.
- Privacy → **never** show raw peer phone/email in Shift Ops UI (`privacy.ts` / platform lock).

---

# A. GLOBAL / CROSS-CUTTING

## A1. Route inventory (smoke every URL)

### Employee Shift Jobs
- [ ] `/employee/shift` — Control Center  
- [ ] `/employee/shift/search` — Search  
- [ ] `/employee/shift/post/:postId` — Post detail / apply  
- [ ] `/employee/shift/applications` — My Work  
- [ ] `/employee/shift/workspaces` — Workspaces hub  
- [ ] `/employee/shift/workspace/:workspaceId` — Workspace detail  
- [ ] `/employee/shift/earnings` — Earnings  
- [ ] Legacy redirects: `/employee/shift/projects` → planner  
- [ ] Legacy: `/employee/shift/projects/:planId` → planner  
- [ ] Legacy: `/employee/shift/projects/:planId/apply` → planner  
- [ ] Legacy: `/employee/shift/applications/plan/:planId` → planner summary  

### Employee Shift Ops
- [ ] `/employee/shift-ops/invite`  
- [ ] `/employee/shift-ops/verify`  
- [ ] `/employee/shift-ops/pending`  
- [ ] `/employee/shift-ops/accept`  
- [ ] `/employee/shift-ops/ready`  
- [ ] `/employee/shift-ops/gate`  

### Employer Shift Jobs
- [ ] `/employer/shift`  
- [ ] `/employer/shift/create`  
- [ ] `/employer/shift/post/:postId`  
- [ ] `/employer/shift/post/:postId/shortlist` (same dashboard)  
- [ ] `/employer/shift/post/:postId/candidate/:appId`  
- [ ] `/employer/shift/post/:postId/candidate/:appId/document-access`  
- [ ] `/employer/shift/posts`  
- [ ] `/employer/shift/workspaces`  
- [ ] `/employer/shift/workspace/:workspaceId`  
- [ ] `/employer/shift/favorites`  
- [ ] `/employer/shift/templates`  
- [ ] `/employer/shift/demand-planner` → `/employer/planner/home`  

### Employer Shift Ops
- [ ] `/employer/shift-ops/approvals`  

### Navigation / feature flags
- [ ] Employee Shift tab can deep-link Shift Ops invite when flag on (`navigation.runtime.ts`)  
- [ ] Employer Shift / default nav can deep-link Shift Ops approvals when flag on  
- [ ] Deep link `#/employee/shift-ops/invite?token=…&group=…` opens invite landing  

## A2. Design-system identity
- [ ] Worker ShiftOps pages use **only** `wm-ee-*` / employee green — zero `wm-planner-card` / teal hero  
- [ ] Manager ShiftOps uses Obsidian/`wm-planner-*` — not worker green  
- [ ] No Career tokens (`wm-ee-vCareer` / career purple) on Shift surfaces  
- [ ] No native `window.confirm` / `window.alert` on Employer Planner batch + ShiftOps manager flows  
- [ ] Touch targets ≥ 40–44px on primary CTAs (mobile)  
- [ ] Loading / empty / error states exist and do not layout-shift violently (CLS)  

## A3. Privacy / platform lock
- [ ] `isShiftContactRevealed()` remains false in UI paths  
- [ ] Call/Message never show raw phone/email  
- [ ] Call routes via `workspaceId` + `initiatorMl` + `receiverMl` only  
- [ ] Mask hints only (e.g. `****3210`) if any channel hint shown  

## A4. Pulse LED global contract
- [ ] LED size is **10×10px** (`PulseIndicator` / `PulseTargetIndicator` / `pulse-engine.css`)  
- [ ] Cards: left-edge pulse only  
- [ ] Buttons: outer halo only (not left-edge strip)  
- [ ] No full-card blink, no text dimming, no right-edge lights  
- [ ] Pulse = action-required only; bell = information-only  

---

# B. SHIFT OPS — WORKER FLOW

## B1. `PendingGroupJoinBanner`  
**File:** `src/features/shiftOps/components/PendingGroupJoinBanner.tsx`  
**Trigger:** Stashed pending join in `pendingGroupJoin.storage` + valid path  

### States
- [ ] Hidden when no pending join  
- [ ] Visible with Continue Join CTA when pending exists  
- [ ] Dismiss (if provided) clears/hides without breaking stash orchestration  

### UI/UX
- [ ] Uses `wm-ee-card wm-ee-vShift` (green worker — not teal)  
- [ ] Title/sub readable on mobile; buttons wrap cleanly  
- [ ] `data-testid="pending-group-join-banner"` present  

### Logic
- [ ] Continue navigates to orchestrated path (profile verify → invite)  
- [ ] Does not expose raw token in banner text  

---

## B2. Invite Landing — `ShiftOpsInviteLandingPage`  
**Route:** `/employee/shift-ops/invite`  
**File:** `pages/ShiftOpsInviteLandingPage.tsx`  
**Steps:** `verify` | `joining` | `pending` | `error`  

### State matrix
- [ ] **verify:** DualVerify embedded + group token + daily OTP inputs  
- [ ] **joining:** Submitting copy shown; controls disabled/busy-safe  
- [ ] **pending:** Renders `ShiftOpsPendingApprovalPage` with membershipId  
- [ ] **error (terminal):** `ShiftOpsJoinFallbackPanel` only  
- [ ] **error (soft):** Inline alert + optional Profile verify CTA + Try again  

### UI/UX
- [ ] Root `wm-ee-vShift`; group card `wm-ee-card`  
- [ ] Token field + 6-digit OTP `inputMode="numeric"`  
- [ ] Legacy TTL checkbox labeled clearly  
- [ ] Soft error chip styled (not bare red `<p>` only)  
- [ ] Group label (`shift-ops-group-label`) when peek succeeds  
- [ ] Empty/invalid token messaging clear  

### Logic
- [ ] Peek inactive group → terminal error  
- [ ] `dual_verification_required` → soft error + Profile CTA  
- [ ] Stash join intent on token change; clear on successful join  
- [ ] Daily OTP length gate (6) before submit  
- [ ] No phone numbers rendered  

---

## B3. Dual Verify — `ShiftOpsDualVerifyPage`  
**Route:** `/employee/shift-ops/verify` (also embedded in invite)  
**Files:** `pages/ShiftOpsDualVerifyPage.tsx`, `hooks/useDualVerification.ts`, `services/onboarding.service.ts`  
**Shared phone:** `src/shared/phone/PhoneNumberField.tsx`, `PhoneCountryPicker.tsx`  

### States
- [ ] **loading:** skeleton `dual-verify-loading`  
- [ ] **error:** alert chip with message  
- [ ] Mobile **unverified:** Send OTP → enter OTP → Verify  
- [ ] Mobile **verified:** OTP inputs **hidden**; `ContactVerifiedBadge` / “Mobile verified”  
- [ ] Email **unverified:** Send → OTP → Verify  
- [ ] Email **verified:** OTP inputs **hidden**  
- [ ] **dualComplete:** Continue enabled  

### Phone / Country Code (CRITICAL)
- [ ] Work mobile uses `PhoneNumberField` (not plain free-text only)  
- [ ] Country code picker opens and applies dial code  
- [ ] E.164 / normalized value sent to OTP register  
- [ ] Invalid national number blocks Send OTP  
- [ ] Verified mobile: field disabled or locked; OTP row gone  
- [ ] Privacy copy: work contacts, not personal; mask lock message  

### UI/UX
- [ ] `wm-ee-card wm-ee-vShift`  
- [ ] Stacked OTP flow (mobile-first), not cramped 3-column flex on small screens  
- [ ] Primary = `wm-primarybtn`; secondary = `wm-outlineBtn`  
- [ ] Continue full-width; disabled until dual complete  
- [ ] No employer teal `wm-planner-*`  

### Logic
- [ ] Register/confirm OTP RPCs handle rate limit / wrong code  
- [ ] Profile sync after verify (hook)  
- [ ] Embedded `onComplete` vs route navigate to invite  

---

## B4. Pending Approval — `ShiftOpsPendingApprovalPage`  
**Route:** `/employee/shift-ops/pending`  
**File:** `pages/ShiftOpsPendingApprovalPage.tsx`  

### States
- [ ] Default pending: waiting copy + poll indicator  
- [ ] Polling “Checking…” vs “every 15 seconds…”  
- [ ] Poll error chip (amber) without crashing  
- [ ] **rejected / revoked:** Access denied card  
- [ ] On `ready_for_assignment`: navigate to Ready (replace)  

### UI/UX
- [ ] `wm-ee-card wm-ee-vShift`  
- [ ] Pulse/dot indicator uses intentional animation (not Pulse registry LED unless designed)  
- [ ] **No raw membership UUID** shown to worker  
- [ ] No teal planner tokens  

### Logic
- [ ] Poll interval ~15s; cleanup on unmount  
- [ ] Missing membershipId: no infinite crash  

---

## B5. Post-Approval Gate — `ShiftOpsPostApprovalGate`  
**Route:** `/employee/shift-ops/gate`  
**Files:** `pages/ShiftOpsPostApprovalGate.tsx`, `hooks/usePostApprovalRouting.ts`  

### States
- [ ] Busy / checking card  
- [ ] `awaitingApproval` → PendingApproval  
- [ ] Error + Retry  
- [ ] `accept_decline` + assignment id → AcceptDecline  
- [ ] Else → ReadyState  

### UI/UX
- [ ] Worker `wm-ee-*` cards  
- [ ] Error chip readable; Retry outline button  

### Logic
- [ ] Optional `siteId` query / prop respected  
- [ ] Zero dead-ends (always a next surface)  

---

## B6. Accept / Decline — `ShiftOpsAcceptDeclinePage`  
**Route:** `/employee/shift-ops/accept`  
**File:** `pages/ShiftOpsAcceptDeclinePage.tsx`  

### States
- [ ] Loading assignment  
- [ ] Loaded: title + start/end times  
- [ ] Missing assignmentId error  
- [ ] Accept success → Ready / `onDone`  
- [ ] Decline success → Ready / `onDone`  
- [ ] Action failure alert  

### UI/UX
- [ ] `wm-ee-card`; Accept primary, Decline outline  
- [ ] Buttons disabled while busy / until row loads  
- [ ] Times localized readable on mobile  

### Logic
- [ ] Status transitions: pending_accept → accepted | declined  
- [ ] No contact reveal  

---

## B7. Ready State — `ShiftOpsReadyStatePage`  
**Route:** `/employee/shift-ops/ready`  
**File:** `pages/ShiftOpsReadyStatePage.tsx`, `services/readyState.service.ts`  

### States
- [ ] Available vs Unavailable toggle (`role="switch"`)  
- [ ] Test alert success chip  
- [ ] Test alert rate-limited (1 / 24h) message + next allowed time  
- [ ] Error chip on failure  

### UI/UX
- [ ] `wm-ee-card wm-ee-vShift`  
- [ ] Toggle visually clear (not text-only ghost button only)  
- [ ] Test alert primary CTA full-width  

### Logic
- [ ] `setMyAvailability` persists  
- [ ] `requestTestAlert` rate limit enforced  
- [ ] No FCM delivery claim beyond “logged / later phase” honesty  

---

## B8. Join Fallback — `ShiftOpsJoinFallbackPanel`  
**File:** `components/ShiftOpsJoinFallbackPanel.tsx`  

### States
- [ ] Terminal error titles/messages for known codes (`group_inactive`, invalid OTP, etc.)  
- [ ] Retry / Start over when `onRetry` provided  

### UI/UX
- [ ] Uses `EnterpriseEmpty` domain shift  
- [ ] Worker-safe colors  

---

# C. SHIFT OPS — EMPLOYER / MANAGER FLOW

## C1. Manager Approvals Page — `ShiftOpsManagerApprovalsPage`  
**Route:** `/employer/shift-ops/approvals`  
**File:** `pages/ShiftOpsManagerApprovalsPage.tsx`  

### Composition
- [ ] Renders `ShiftOpsGroupAccessCard`  
- [ ] Renders `ShiftOpsActiveRosterCard`  
- [ ] Pending approvals list section  

### States
- [ ] Empty pending queue  
- [ ] Rows with Approve / Reject  
- [ ] Busy per-row disable  
- [ ] Load / decide error (Obsidian error box)  

### UI/UX
- [ ] Shell: `wm-er-vPlanner` + `wm-planner-obsidianShell`  
- [ ] Cards: `wm-planner-card--obsidian`  
- [ ] Approve: `wm-planner-btnPrimary--glow`  
- [ ] Reject: ghost obsidian  
- [ ] **Not** worker green  

### Logic
- [ ] Approve → membership `ready_for_assignment`  
- [ ] Reject → `rejected`  
- [ ] Refresh list after decision  

---

## C2. Group Access Card — `ShiftOpsGroupAccessCard`  
**File:** `components/ShiftOpsGroupAccessCard.tsx`  

### States
- [ ] No managed sites empty  
- [ ] Site select populated  
- [ ] Ensure static link (new token once)  
- [ ] Rotate link warning / new QR  
- [ ] Mint daily OTP → digit tiles  
- [ ] OTP day status (active / none)  
- [ ] Copy join URL success info chip  
- [ ] Error chip  

### UI/UX
- [ ] Obsidian card  
- [ ] QR centered; readable caption  
- [ ] OTP digit tiles luxury treatment (not raw monospace only)  
- [ ] Glow primary CTAs  

### Logic / Privacy
- [ ] Raw token shown once messaging accurate  
- [ ] Join URL hash path correct (`/#/employee/shift-ops/invite?…`)  
- [ ] No worker phone displayed  

---

## C3. Active Roster — `ShiftOpsActiveRosterCard`  
**File:** `components/ShiftOpsActiveRosterCard.tsx`  
**Service:** `rosterReassign.service.ts`  

### States
- [ ] Group select  
- [ ] Empty active members  
- [ ] Loading  
- [ ] Worker cards with avatar initial, role, zone  
- [ ] Overlay/demo fallback only when intended (no surprise fake workers in prod if RPC empty — confirm policy)  

### UI/UX
- [ ] Obsidian cards  
- [ ] Manage Assignment ghost CTA  

### Logic
- [ ] Lists only `ready_for_assignment`  
- [ ] After reassign to other group, row leaves current list  

---

## C4. Group Comms — `ShiftOpsGroupCommsActions`  
**File:** `components/ShiftOpsGroupCommsActions.tsx`  
**Gate:** `shiftOpsCommsGate.helpers.ts`  

### States
- [ ] **Locked:** Call locked + Message disabled when not active member / missing ML / missing group  
- [ ] **Unlocked:** `CallButton` + Message  
- [ ] Optional emergency / late check-in label  
- [ ] Message SlideOver compose → send in-app  

### UI/UX
- [ ] Privacy strip (“contacts stay masked”)  
- [ ] Message SlideOver `variant="obsidian"`  
- [ ] Char limit on message  

### Logic (CRITICAL)
- [ ] `canCommunicateInShiftOpsGroup` requires `ready_for_assignment` + groupId + workerMlId  
- [ ] Call uses `workspaceId=siteId`, initiator/receiver ML — **no tel:**  
- [ ] Message uses notify path — no SMS leak  

---

## C5. Manage Assignment Modal — `ShiftOpsManageAssignmentModal`  
**File:** `components/ShiftOpsManageAssignmentModal.tsx`  
**RPC:** `reassign_worker_group_and_role` (migration `202607260004_…`)  

### States
- [ ] Open/close SlideOver obsidian  
- [ ] Site / zone / crew role / note fields  
- [ ] Busy saving  
- [ ] Error box  
- [ ] Success closes + parent refresh  

### UI/UX
- [ ] Executive glass SlideOver  
- [ ] Glow Save CTA  
- [ ] Copy states check-in/status preserved  

### Logic (CRITICAL)
- [ ] Changing group/zone/role does **not** reset membership status away from ready  
- [ ] Does **not** touch pending_shift_assignments / clock ledgers  
- [ ] Worker receives info notify (bell/info severity — not urgent pulse spam)  
- [ ] Conflict `worker_already_in_target_group` surfaced  

---

# D. EMPLOYEE SHIFT JOBS (AUXILIARY TO SHIFT OPS)

## D1. Control Center — `/employee/shift`  
**File:** `pages/ShiftControlCenterPage.tsx` + `ShiftControlCenter*`  

### UI
- [ ] Action tiles: Find / Applications / Earnings / Workspaces  
- [ ] PulseTargetCard IDs: `shift-dashboard-find-shifts`, `…-applications`, `…-earnings`, `…-workspaces`  
- [ ] Empty/loading rails  

### Logic
- [ ] Deep links correct  
- [ ] Pulse LED 10px left-edge on targets when active  

---

## D2. Search — `/employee/shift/search`  
**Components:** FilterPanel, ResultsList, SmartMatches, SaveAlert, Favorites helpers  

### UI
- [ ] Filters usable on mobile  
- [ ] Empty / no results  
- [ ] Result cards hierarchy  

### Logic
- [ ] Favorites/save alert persistence  
- [ ] Smart match relevance (smoke)  

---

## D3. Post Detail / Apply — `/employee/shift/post/:postId`  
**Files:** `ShiftPostDetailsApplyPage.tsx`, apply sections, status cards  

### States
- [ ] Not found  
- [ ] Applied / shortlisted / waiting / confirmed / rejected status cards  
- [ ] Withdraw ConfirmModal  
- [ ] Direct invite accept path + safety modals  

### UI
- [ ] Button hierarchy Apply vs secondary  
- [ ] No contact leak  

### Logic
- [ ] Application status transitions  
- [ ] Invite accept/decline CenterModals  

---

## D4. My Applications — `/employee/shift/applications`  
**Files:** `MyShiftApplicationsPage.tsx`, `MyShiftApplicationCard.tsx`, status timeline  

### UI
- [ ] Filters / empty  
- [ ] PulseTarget on cards for shortlist/wait/confirm  

### Logic
- [ ] Status timeline accuracy  
- [ ] Withdraw confirm  

---

## D5. Workspaces — list + detail  
**Routes:** `/employee/shift/workspaces`, `/workspace/:workspaceId`  

### States
- [ ] active | upcoming | completed | left | replaced | cancelled  
- [ ] Exit Confirm/Notice modals  
- [ ] Rate employer modal  
- [ ] Attendance intent vs clock-in: confirm UI does **not** claim live QR clock-in if deferred  

### UI
- [ ] Workspace messaging surfaces privacy-safe  

---

## D6. Earnings — `/employee/shift/earnings`  
- [ ] Empty / totals / date ranges  
- [ ] No PII leak  

## D7. Availability broadcast (employee)  
**File:** `ShiftAvailabilityBroadcastCard.tsx` + `availabilityStorage`  

- [ ] Toggle/broadcast UI clear  
- [ ] Sync with employer match pulse queue (no false positives)  

---

# E. EMPLOYER SHIFT JOBS

## E1. Home — `/employer/shift`  
- [ ] KPI / recent posts  
- [ ] PulseNode on recent post targets  
- [ ] Promo strips (Gig/Planner) do not break Shift/Career separation  

## E2. Create wizard — `/employer/shift/create`  
- [ ] Multi-step layout / footer  
- [ ] Nearby availability card  
- [ ] Confirm publish CenterModal  
- [ ] Draft reminder  

## E3. Post dashboard — `/employer/shift/post/:postId`  
**Tabs / lists:** Applied, Shortlist, Waiting, Confirmed, Rejected  

### UI
- [ ] DashboardTabs PulseNode  
- [ ] CandidatePulseRowChrome 10px LED  
- [ ] Candidate list SlideOver  
- [ ] CompareApplicantsModal / Edit / Replace / Confirm / Notice  

### Logic
- [ ] Confirm / shortlist / waiting / reject / replace sagas  
- [ ] Soft capacity warnings use glass ConfirmModal (not native) where applicable  
- [ ] Membership bridge best-effort on confirm (ShiftOps) without blocking  

## E4. Candidate detail + document access  
- [ ] Detail completeness  
- [ ] Doc access gate OTP (vault) separate from ShiftOps dual-verify  

## E5. Posts list — `/employer/shift/posts`  
- [ ] SlideOver quick view  
- [ ] PulseTargetIndicator on application received  
- [ ] Planner group promo card (green shift promo — not teal planner UI bleed into wrong domain)  

## E6. Workspaces employer  
- [ ] Broadcast / Reply modals  
- [ ] Rate worker  
- [ ] CallButton privacy (ML routing)  

## E7. Favorites — `/employer/shift/favorites`  
**CRITICAL secondary flow**  

### UI
- [ ] Favorite worker cards  
- [ ] Availability badge  
- [ ] Invite to shift modal  

### Logic
- [ ] Add/remove favorite  
- [ ] Invite creates direct invite without exposing phone  
- [ ] Availability label freshness  

## E8. Templates — `/employer/shift/templates`  
- [ ] CRUD / apply template to create  
- [ ] Empty state  

## E9. Local workers radar / nearby availability  
- [ ] Cards render without layout thrash  
- [ ] No raw contacts  
- [ ] Match pulse service sync with employee availability  

---

# F. PULSE LED — SHIFT SURFACES DETAIL

## F1. Employee
- [ ] Control Center tiles: PulseTargetCard destinations  
- [ ] Application cards: shortlisted / waitlisted / confirmation targets  
- [ ] LED = 10px circle; left-edge chrome only  

## F2. Employer
- [ ] Home recent posts PulseNode  
- [ ] Dashboard tabs PulseNode  
- [ ] Posts list PulseTargetIndicator (`SHIFT_APPLICATION_RECEIVED`)  
- [ ] Candidate rows CandidatePulseRowChrome  

## F3. ShiftOps
- [ ] Confirm **no** PulseNode/PulseTarget on ShiftOps pages (or document if added later)  
- [ ] Pending page CSS pulse dot is **status UX**, not domain Pulse registry — do not confuse rules  

## F4. Event registry smoke
- [ ] APPLICATION_RECEIVED, SHORTLISTED, WAITLISTED, CONFIRMATION_REQUIRED, EMPLOYEE_SELECTED, WORKER_CONFIRMED/CANCELLED, POST_COMPLETED route correctly  
- [ ] Info reassignment notify does not trigger urgent full-card pulse  

---

# G. PHONE VERIFICATION & COUNTRY PICKER

## G1. Shared phone kit
**Files:** `PhoneNumberField`, `PhoneCountryPicker`, `phoneDialCountries*`, `ContactVerifiedBadge`, `contactVerification.storage`  

- [ ] Picker lists countries; search works  
- [ ] Selecting country updates dial code + flag/label  
- [ ] National input formatting OK for IN (+91) and at least one other  
- [ ] Verified badge shows only when verified  
- [ ] Storage flags survive refresh  

## G2. ShiftOps Dual Verify integration
- [ ] OTP fields **hidden** when channel verified  
- [ ] Send OTP disabled when verified or invalid phone  
- [ ] Wrong OTP error; resend behavior  
- [ ] Email path parallel to mobile  

## G3. Profile contact section
- [ ] Shows verification badges; does not duplicate broken OTP UI  
- [ ] Deep link to ShiftOps verify when required  

## G4. Group Daily OTP (manager)
- [ ] 6-digit mint; digit tiles  
- [ ] Day rollover messaging (UTC day)  
- [ ] Worker join rejects wrong OTP  

---

# H. FAVORITES / AVAILABILITY / NOTIFICATIONS SYNC

## H1. Favorites
- [ ] Employer favorites page load/empty  
- [ ] Invite modal → employee pending invite  
- [ ] Server favorites routes (if API on) vs local storage fallback  

## H2. Availability
- [ ] Employee broadcast card  
- [ ] Employer nearby/radar + favorite availability badge  
- [ ] Match pulse queue: employer sees pulse only when action-required  
- [ ] ShiftOps Ready availability toggle does not fight Shift Jobs availability store (document expected source of truth)  

## H3. Notifications / Alerts
- [ ] Employee shift domain detectors (nearby, workspace message, completion)  
- [ ] Employer employee-notifications helper  
- [ ] Bell vs Pulse separation respected  
- [ ] Group message / reassignment appear as info, not contact leak  

---

# I. DATA / RPC / MIGRATION GATES (OPS)

- [ ] Shift Ops Supabase configured (`VITE_SUPABASE_URL` / anon)  
- [ ] Auth bridge `/supabase-bridge` session for RPCs  
- [ ] Migrations applied as needed:  
  - Phase0 identity  
  - Phase1 onboarding/approval  
  - Static link + daily OTP  
  - Auto provision membership  
  - **Roster reassign** `202607260004_shift_ops_roster_reassign.sql`  
- [ ] Overlay storages only used when RPC missing — flag in audit notes  

---

# J. RESPONSIVE / A11Y MATRIX (APPLY TO EVERY SCREEN IN A–E)

For each page above, also check:

- [ ] 375px width: no horizontal scroll (except intentional tables)  
- [ ] 768px / 1024px layouts acceptable  
- [ ] Focus visible on buttons/inputs  
- [ ] `aria-*` on dialogs, switches, alerts  
- [ ] `data-testid` stable for e2e (invite, dual-verify, roster, approvals)  
- [ ] Prefers-reduced-motion: SlideOver / pulse animations degrade  

---

# K. DOMAIN SEPARATION REGRESSION

- [ ] No Career state in Shift Zustand/UI  
- [ ] Planner bridges only via declared ports (`plannerLegacyShiftBridge`, `plannerShiftJobsBridge`, membership bridges)  
- [ ] ShiftOps does not import employer planner services directly  
- [ ] Employer ShiftOps manager UI does not use worker green tokens  

---

# L. EXPLICIT NON-GOALS / DEFERRED (mark N/A unless product expands)

- [ ] N/A — Live QR clock-in / break timers (v2.1)  
- [ ] N/A — Full in-app chat thread UI (group message is notify compose only)  
- [ ] N/A — Real FCM delivery for test alert / reassignment (logged / notify queue)  
- [ ] N/A — Dark mode product launch for all shells (Obsidian is employer surface treatment)  

---

# M. AUDIT EXECUTION ORDER (RECOMMENDED FOR WINDSURF)

1. **A1–A4** global smoke + tokens + Pulse contract  
2. **B1–B8** full worker ShiftOps path (happy + rejected + soft errors)  
3. **C1–C5** manager Obsidian + roster + call gate + reassign  
4. **G1–G4** phone/OTP/country + daily OTP  
5. **D** employee Shift Jobs critical path  
6. **E** employer Shift Jobs critical path  
7. **F + H** Pulse + Favorites/Availability/Notifications  
8. **I + K** RPC/migrations + domain separation  
9. File fail log with path, state trigger, expected vs actual  

---

## Appendix — Primary source files (quick index)

```
shiftOps/pages/*
shiftOps/components/*
shiftOps/hooks/useDualVerification.ts
shiftOps/hooks/usePostApprovalRouting.ts
shiftOps/services/{onboarding,groupDailyOtp,approval,readyState,rosterReassign,membershipBridge,authBridge}.ts
shiftOps/helpers/{shiftOpsCommsGate,groupJoinDeepLink,groupJoinErrors}.ts
shared/phone/*
features/pulse/{PulseIndicator,PulseTargetIndicator,pulseEdgeVisuals,pulseRegistry.shift}.ts*
employee/shiftJobs/pages/*
employer/shiftJobs/pages/*
app/router/routePaths.ts
supabase/migrations/*shift_ops*
supabase/migrations/202607260004_shift_ops_roster_reassign.sql
```

---

**Document status:** Master checklist generated from codebase scan — ready for Windsurf execution.  
**Code changes in this task:** none.
