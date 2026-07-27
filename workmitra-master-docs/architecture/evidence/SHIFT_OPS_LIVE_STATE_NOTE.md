# Shift Ops Live Note — Phase 0–1 (Track 2)

> **Purpose:** Review-only status for Field Ops / Shift Ops greenfield.  
> **Companions:** `PENDING_WORK_BOARD.md` · `SHIFT_OPS_OTP_EDGE_DESIGN.md` · `SHIFT_OPS_CHANNEL_PEPPER_OPERATOR_RUNBOOK.md` · `SHIFT_OPS_T2_5_SMOKE.md` · `SUPABASE_OPERATOR_UI_NAV_NOTE.md`  
> **Rule:** `.cursor/rules/infra-live-state-notes.mdc`

**Last verified:** 2026-07-27 (v2.0 descope: live QR check-in / shift timers → v2.1)  
**Overall status:** T2-6 PASS. T2-7 Edge deploy parked (code ready). Group Join patches complete. **v2.0 does not ship live attendance punch-in or shift timers.**  
**Domain lock:** `shift_ops` schema only — never mix with Career / Planner localStorage

---

## 1. Current truth (quick read)

| Item                        | Status                                                                  |
| --------------------------- | ----------------------------------------------------------------------- |
| Phase 0+1 SQL               | **APPLIED** on `jobmitra-enterprise-v2-dev`                             |
| API Exposed schemas         | **DONE** — includes `shift_ops` (3 of 3)                                |
| `is_channel_pepper_ready()` | **true**                                                                |
| T2-5 live SQL smoke         | **PASS** (tables 13, fns 13, vault privileges locked, channels_safe OK) |
| Router / nav                | **DONE (T2-1)** behind `showShiftOpsFeatures`                           |
| OTP Edge                    | Stub in repo — **not deployed**                                         |
| Browser client env          | `.env.local` set (operator); invite page **PASS**                       |
| T2-6 Browser invite smoke   | **DONE / PASS** (2026-07-26)                                            |

---

## 2. Track 2 patches

| #               | Patch                        | Status                                                 |
| --------------- | ---------------------------- | ------------------------------------------------------ |
| T2-0            | Inventory / live note        | **DONE**                                               |
| T2-1            | Feature-flagged router + nav | **DONE**                                               |
| T2-2            | OTP Edge design + stub       | **DONE** (not deployed)                                |
| T2-3            | Pepper vault runbook         | **DONE**                                               |
| T2-4            | Apply Phase 0+1 SQL          | **DONE**                                               |
| Pepper live set | `is_channel_pepper_ready()`  | **DONE**                                               |
| T2-5            | Post-apply SQL smoke         | **DONE / PASS**                                        |
| T2-6            | Browser env + invite smoke   | **DONE / PASS**                                        |
| T2-7            | OTP Edge deploy              | **PARKED** — CLI login deferred; resume: `T2-7 resume` |

**Optional later:** deploy `shift-ops-otp-dispatch` after T2-6 (T2-7)

---

## 3. Hard locks

- Do **not** paste pepper / service_role into chat
- Do **not** put `service_role` in frontend
- Production **NOT APPROVED**
- **v2.0:** Do not claim live QR shift check-in, live shift timers, or payroll/payout settlement (see `PENDING_WORK_BOARD.md` → WorkMitra v2.1 Future Roadmap)

---

## 4. Change log

| Date       | Who               | What changed                                                                                      |
| ---------- | ----------------- | ------------------------------------------------------------------------------------------------- |
| 2026-07-26 | Operator + Cursor | T2-0…T2-4 + pepper + schema expose.                                                               |
| 2026-07-26 | Operator + Cursor | T2-5 SQL smoke PASS (part1+part2 screenshots). App env deferred. Track 2 SQL path complete.       |
| 2026-07-26 | Operator + Cursor | T2-6 PASS — invite page screenshot (dual verify + site invite + Shift Ops nav).                   |
| 2026-07-26 | Founder + Cursor  | Global UX (no ₹ hardcode; country phone; premium Shift Ops UI) parked as Track 5 — after pending. |
| 2026-07-27 | Founder + Cursor  | Descope live attendance QR/timers + settlement payout from v2.0 → v2.1 roadmap (board).           |
