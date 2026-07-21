<!-- App name: WorkMitra / Job Mitra
File name: 05_EMPLOYER_ULTRA_ENTERPRISE_UI_SYSTEM_v1.0.md
Full file path: C:\projects\WorkMitra_Enterprise_v2\workmitra-master-docs\planner\05_EMPLOYER_ULTRA_ENTERPRISE_UI_SYSTEM_v1.0.md
Document version: v1.0 -->

# EMPLOYER ULTRA-ENTERPRISE UI SYSTEM (v1.0)

## 1. Status

| Field        | Value                                                              |
| ------------ | ------------------------------------------------------------------ |
| Status       | **COMPLETE — U0–U5 shipped (employer presentational unification)** |
| Scope        | Employer Planner + Shift + Career only                             |
| Out of scope | Employee redesign, Career/Shift state merge, V2 forecasting        |

---

## 2. Semantic Tone API (Frozen)

```ts
type EnterpriseTone = "critical" | "warning" | "active" | "pending" | "neutral";
type EnterpriseDomainAccent = "planner" | "shift" | "career";
```

| Tone     | Meaning                        | Token basis                 |
| -------- | ------------------------------ | --------------------------- |
| critical | Blocker / expired / danger     | `--wm-error` / red wash     |
| warning  | Attention / stale / RTW warn   | `--wm-warning` / amber wash |
| active   | Healthy / live / success       | `--wm-success` / green wash |
| pending  | Locked / waiting / in progress | amber-soft / neutral-600    |
| neutral  | Informational / platform lock  | `--wm-neutral-*`            |

Domain accents (`planner` cyan / `shift` green / `career` blue) are **optional rings** on badges — never replace semantic tone colors for Critical/Warning.

---

## 3. Primitive Inventory (U1+)

| Primitive                | Path                                                            |
| ------------------------ | --------------------------------------------------------------- |
| StatusBadge              | `src/shared/components/enterprise/StatusBadge.tsx`              |
| TrustStrip               | `src/shared/components/enterprise/TrustStrip.tsx`               |
| EnterpriseEmpty          | `src/shared/components/enterprise/EnterpriseEmpty.tsx`          |
| EnterpriseSkeleton       | `src/shared/components/enterprise/EnterpriseSkeleton.tsx`       |
| EnterpriseResponsiveGrid | `src/shared/components/enterprise/EnterpriseResponsiveGrid.tsx` |
| SlideOver                | `src/shared/components/enterprise/SlideOver.tsx`                |
| CSS                      | `src/app/theme/components/enterprise-system.css`                |

---

## 4. Button Contract

- Primary / Outline / Ghost / Danger = `buttons.css` (`wm-primarybtn`, `wm-outlineBtn`, `wm-ghostBtn`, `wm-dangerBtn`)
- Domain CTA classes (`wm-shift-cta`, `wm-career-cta`, `wm-planner-btn*`) are visual aliases only — same radius/focus/size ladder
- No new hex/padding one-off button style maps

---

## 5. Non-Goals

- Employee domain redesign
- Merging Shift and Career Zustand / application state
- Full create-wizard visual rewrite in U1–U2
- Full-card blinking, text dimming, right-edge pulse lights

---

## 6. Section Gates

| Section | Scope                                                        |
| ------- | ------------------------------------------------------------ |
| U0      | This document                                                |
| U1      | StatusBadge + button contract + first badge migrations       |
| U2      | Responsive KPI/list grids                                    |
| U3      | SlideOver drawers (applicant / shift detail / planner audit) |
| U4      | Skeletons + actionable empties                               |
| U5      | TrustStrip hierarchy (lock / RTW / Pulse / stale)            |

---

## 7. Version History

| Version | Date       | Summary                             |
| ------- | ---------- | ----------------------------------- |
| v1.0    | 2026-07-21 | Scope freeze + tone/accent API lock |
