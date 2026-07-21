<!-- App name: WorkMitra / Job Mitra
File name: 06_GLOBAL_LUXURY_ENTERPRISE_POLISH_TRACK_v1.0.md
Full file path: C:\projects\WorkMitra_Enterprise_v2\workmitra-master-docs\planner\06_GLOBAL_LUXURY_ENTERPRISE_POLISH_TRACK_v1.0.md
Document version: v1.0 -->

# GLOBAL LUXURY ENTERPRISE POLISH TRACK (v1.0)

## 1. Status

| Field        | Value                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------- |
| Status       | **COMPLETE — Luxury Track L0–L4 shipped**                                                         |
| Scope        | Employer shell + Planner / Shift / Career **presentational polish only**                          |
| Out of scope | Employee redesign, Admin mix, Career↔Shift state merge, V2 forecasting, domain data-model changes |
| Prerequisite | Ultra-Enterprise UI U0–U5 (`05_EMPLOYER_ULTRA_ENTERPRISE_UI_SYSTEM_v1.0.md`)                      |

---

## 2. Mission

Ship Apple/Stripe-grade **feel** across employer domains with **zero risk** to existing domain logic, storage schemas, Zustand slices, Pulse/Bell contracts, and Planner→Shift ports.

Polish is **chrome + motion + navigation overlays**. Business rules stay untouched.

---

## 3. Locked decisions

1. **Employer only** — mount in `EmployerShell` (and employer theme bundles). No employee/admin shell work in this track.
2. **Domain separation preserved** — Command Palette may _navigate_ across Planner / Shift / Career routes; it must **never** load or mutate Shift + Career application state in one object.
3. **Presentational shared UI only** — new code under `src/shared/components/enterprise/` (or thin `luxury/` sibling) with **no** imports from `features/employer/shiftJobs/storage`, `careerJobs/storage`, or planner write services.
4. **Reuse before reinvent** — build on Ultra-Enterprise primitives (`SlideOver`, `StatusBadge`, `TrustStrip`), existing `motion.css` spring (`--wm-motion-spring`), and existing `GlobalToast` / `feedback.css`.
5. **Pulse vs Bell unchanged** — toasts are feedback chrome; action-required events stay Pulse (`PulseNode` / `PulseTarget*`). No full-card blink, no ad-hoc `pulse-dot`.
6. **Accessibility first** — `prefers-reduced-motion`, focus traps, Escape dismiss, aria-live on toasts, contrast hierarchy.
7. **Gated execution** — one slice at a time; list files → await OK → build/lint → await OK before next.

---

## 4. Audit snapshot (current baseline)

| Area            | Baseline                                                            | Gap for Luxury Track                                                           |
| --------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Command Palette | None (`Cmd/Ctrl+K` not present)                                     | Employer overlay + static nav registry                                         |
| Motion          | Strong `--wm-motion-spring` + `motion.css` / modals                 | Uneven adoption on SlideOver, tabs, domain CTAs                                |
| Toast           | `GlobalToast` + glass blur in `feedback.css` (employee-heavy usage) | Employer host + luxury glass tones; queue; map to enterprise tones             |
| Theme           | Light `color-scheme: light` in `tokens.css`                         | Contrast / hierarchy polish; dark as **token prep only** unless approved later |
| Enterprise UI   | U0–U5 primitives shipped                                            | Luxury track layers on top — does not replace                                  |

---

## 5. Slice map

```text
L0  Roadmap + inventory lock          ← THIS DOCUMENT
L1  Global Command Palette            ← NEXT (await approval)
L2  Tactile micro-interactions        ← after L1 exit
L3  Enterprise toast feedbacks        ← after L2 exit
L4  Theme engine polish (a11y/contrast) ← after L3 exit
```

### L0 — Scope freeze (complete with this doc)

- Semantic goals locked (palette / motion / toast / theme).
- Non-goals locked (no domain schema churn).
- Exit: this document + Product Owner OK to start **L1**.

### L1 — Global Command Palette (Cmd+K / Ctrl+K)

**Intent:** Instant search & cross-domain **navigation** from EmployerShell.

**In scope:**

- Overlay (portal + backdrop + Escape + focus trap; Zero Dead-End: dismiss + select).
- Shortcut: `Cmd+K` (mac) / `Ctrl+K` (win/linux); ignore when typing in inputs/textareas/contenteditable unless explicitly opened.
- Static **command registry** of employer routes/actions (labels + `ROUTE_PATHS` + domain accent tags `planner | shift | career`).
- Fuzzy filter on label/keywords only (client-side; no network).
- Visual language aligned with Ultra-Enterprise + glass tokens.

**Out of scope for L1:**

- Searching live posts/plans/candidates in storage (defer to later “smart search” if approved).
- Creating jobs/plans from palette (navigation to create routes only).
- Employee/Admin palette.
- Changing BottomNav IA.

**Risk posture:** Navigation-only; no domain writes.

### L2 — Tactile micro-interactions & spring transitions

**Intent:** Fluid feel for modals, tabs, SlideOver, buttons.

**In scope:**

- Align `SlideOver` enter/exit with `modals.css` / `motion.css` springs.
- Press physics (`wm-press-btn`) on employer primary/outline/domain CTA aliases where missing.
- Tab indicator / dashboard tab transitions without layout shift (CLS-safe).
- Honor `prefers-reduced-motion: reduce` (instant opacity or none).

**Out of scope:** Wizard visual rewrite; new animation libraries; JS spring engines unless already in repo.

### L3 — Enterprise toast notification feedbacks

**Intent:** Glassmorphic, high-trust feedback for saves / errors / informational pulse-adjacent notices.

**In scope:**

- Employer toast host (shell-level) reusing/extending `GlobalToast` + `feedback.css`.
- Thin `showEnterpriseToast({ tone, message })` API (presentational store or event bus — **no** domain slice).
- Tone map: success / error / warn / info ↔ enterprise visual hierarchy.
- Optional: informational bridge copy for Pulse _acknowledgements_ — **not** replacing Pulse action-required UI.

**Out of scope:** Replacing NoticeModal confirm flows; Bell notification system rewrite; toast as sole Pulse channel.

### L4 — Seamless theme engine polish

**Intent:** Harmonized light contrast + accessibility-hardened hierarchy; dark as token prep.

**In scope:**

- Token audit for text/muted/border contrast on employer surfaces.
- Focus-ring / hierarchy consistency with Ultra-Enterprise badges & TrustStrip.
- `prefers-color-scheme` / `data-theme` **token scaffolding only** if safe — no forced dark rollout.

**Out of scope:** Full dark-mode product launch; employee theme redesign; brand palette rewrite that breaks domain accents (planner cyan / shift green / career blue stay).

---

## 6. Execution gates (binding)

1. One slice at a time; stop for validation between L0–L4.
2. Before any slice’s code: list **exact files** to touch; await confirm.
3. Layout safety: inspect full file before edits; avoid CLS / full-card blink.
4. After each slice: lint + `npm run build` (+ slice smoke if present).
5. Do not start V2 forecasting or employee redesign from this track.
6. Do not mix Career and Shift state in shared components.

---

## 7. Suggested file homes (preview — confirm per slice)

| Concern            | Likely path                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Command Palette UI | `src/shared/components/enterprise/CommandPalette.tsx` (+ CSS in `enterprise-system.css` or `enterprise-luxury.css`) |
| Command registry   | `src/shared/components/enterprise/commandPalette.registry.ts` (ROUTE_PATHS only)                                    |
| Shell mount        | `src/app/shells/EmployerShell.tsx` (+ tiny hook)                                                                    |
| Toast host API     | `src/shared/components/feedback/` or enterprise toast adapter                                                       |
| Motion polish      | `src/app/theme/components/motion.css`, `enterprise-system.css`, `SlideOver.tsx`                                     |
| Theme polish       | `src/app/theme/tokens.css`, employer bundle CSS                                                                     |

Exact L1 file list is in **§8** below.

---

## 8. Slice L1 — exact scope (await approval)

### Goal

Ship employer Global Command Palette: open with **Cmd+K / Ctrl+K**, filter static commands, navigate via React Router, close with Escape / backdrop / explicit dismiss.

### Files to touch (proposed)

| Action         | Path                                                                         |
| -------------- | ---------------------------------------------------------------------------- |
| New            | `src/shared/components/enterprise/CommandPalette.tsx`                        |
| New            | `src/shared/components/enterprise/commandPalette.registry.ts`                |
| New            | `src/shared/components/enterprise/useCommandPaletteHotkey.ts`                |
| Edit           | `src/shared/components/enterprise/index.ts` (barrel export)                  |
| Edit           | `src/app/theme/components/enterprise-system.css` (palette overlay styles)    |
| Edit           | `src/app/shells/EmployerShell.tsx` (mount + hotkey)                          |
| New            | `src/shared/components/enterprise/__tests__/commandPalette.registry.test.ts` |
| Optional smoke | `tests/e2e/employer-command-palette-smoke.spec.ts`                           |

### Non-touch (explicit)

- No `employerShift.storage` / career storage / demand planner write APIs.
- No BottomNav redesign.
- No Pulse registry changes.
- No employee/admin shells.

### Exit criteria

- Vitest: registry contains Planner + Shift + Career nav entries with distinct domain tags.
- Manual/E2E smoke: open palette → filter → navigate → Escape closes.
- `npm run build` PASS; lint clean on touched files.
- No domain state imports in palette module.

### Approval phrase

Reply **`L1 yes`** to authorize implementation of the file list above.  
Reply **`L1 revise`** with notes if the file list or scope must change first.

---

## 9. Relationship to Ultra-Enterprise UI

Luxury Track **extends** U0–U5 chrome; it does not reopen badge/grid/SlideOver foundation work unless a bug blocks L2–L3.

| Track                | Focus                                                   |
| -------------------- | ------------------------------------------------------- |
| Ultra-Enterprise (U) | Semantic tones, grids, SlideOver, skeletons, TrustStrip |
| Luxury Polish (L)    | Command speed, tactile motion, toast feel, theme a11y   |

---

## 10. Document control

| Version | Date       | Notes                                                          |
| ------- | ---------- | -------------------------------------------------------------- |
| v1.0    | 2026-07-21 | Initial Luxury Track roadmap; L1 proposed, awaiting approval   |
| v1.1    | 2026-07-21 | L0–L4 complete: palette, motion, toast host, theme a11y polish |

### L4 exit checklist

- [x] Muted/text/border contrast improved on light employer surfaces
- [x] Focus-ring SSOT + domain-colored focus (shift / planner / career)
- [x] Enterprise badge / TrustStrip / empty hierarchy contrast
- [x] Dark `data-theme` scaffolding only (not activated)
- [x] Domain accents preserved (planner cyan / shift green / career blue)
- [x] `npm run build` PASS
