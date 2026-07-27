# Cloudflare Live State Note — mitraaccesshub.com

> **Purpose:** Current verified Cloudflare state. Update this file when anything changes.  
> **Do not** re-audit from zero if this note is current — read this first, then check only deltas.  
> **Companion archive:** `CLOUDFLARE_CONFIGURATION_REPORT_MITRAACCESSHUB.md`  
> **Operator UI map (click paths):** `CLOUDFLARE_OPERATOR_UI_NAV_NOTE.md`  
> **Supabase note (separate):** `SUPABASE_LIVE_STATE_NOTE.md`  
> **Rule:** `.cursor/rules/infra-live-state-notes.mdc`

**Last verified:** 2026-07-25 (operator dashboard: Worker + Domains + Deployments + Visit + SSL + DNS Records)  
**Overall status:** PARTIAL — apex live via Worker DNS; www missing; Git/Pages/`out` not active

---

## 1. Current truth (quick read)

| Item                           | Value                                                      | Status                             |
| ------------------------------ | ---------------------------------------------------------- | ---------------------------------- |
| Cloudflare project name        | `mitra-access-hub`                                         | VERIFIED                           |
| Project type                   | **Worker** (not classic Pages)                             | VERIFIED                           |
| Custom domain                  | `mitraaccesshub.com` → Production                          | VERIFIED                           |
| Zone                           | `mitraaccesshub.com`                                       | VERIFIED                           |
| DNS setup                      | **Full** (Cloudflare-managed DNS)                          | VERIFIED                           |
| Domain registrar               | Cloudflare; status Active                                  | VERIFIED                           |
| Plan                           | Free                                                       | VERIFIED                           |
| workers.dev                    | `mitra-access-hub.jibin-dev-apps.workers.dev` — ON, Public | VERIFIED                           |
| Preview URL toggle             | OFF                                                        | VERIFIED                           |
| Git / Build connection         | **Not connected**                                          | VERIFIED                           |
| Deploy method                  | **Manually deployed** (Dashboard)                          | VERIFIED                           |
| Active version                 | `b89a85f2` — 100% traffic                                  | VERIFIED                           |
| Recent Builds                  | “No builds exist yet for this worker.”                     | VERIFIED                           |
| Live page content              | **Coming Soon** placeholder (Mitra Access Hub)             | VERIFIED                           |
| HTTPS public reachability      | YES (Visit loads over HTTPS)                               | VERIFIED                           |
| SSL/TLS encryption mode        | **Full** (Automatic mode enabled)                          | VERIFIED                           |
| SSL preferred later (optional) | Full (strict) — not required to change now                 | NOTE ONLY                          |
| DNS records count              | **1 of 200**                                               | VERIFIED                           |
| Apex (`@`) record              | Type **Worker** → content `100::` · **Proxied** · TTL Auto | VERIFIED                           |
| www record                     | **Missing** (CF warning: www not reachable)                | VERIFIED GAP                       |
| www → apex redirect            | Not configured                                             | VERIFIED GAP                       |
| Email DNS (MX/SPF/DKIM/DMARC)  | Missing (CF recommendation only)                           | NOTED — do not fix unless approved |
| Intended long-term host        | Cloudflare Pages + `npm run build` → `out/`                | DOC INTENT (not live yet)          |
| Local Next.js `out/` build     | PASS (2026-07-25) in `mithra-access-hub` repo              | VERIFIED LOCALLY                   |

---

## 2. Important distinction (do not confuse)

| Layer                | Reality today                                                    |
| -------------------- | ---------------------------------------------------------------- |
| Live public site     | Cloudflare **Worker** `mitra-access-hub` serving **Coming Soon** |
| Source repo scaffold | `C:\projects\mithra-access-hub` — Next.js static export → `out/` |
| Docs / future target | Cloudflare **Pages** with Git + `out/`                           |
| Gap                  | Live Worker ≠ Git-connected Pages ≠ latest Next.js scaffold      |

---

## 3. Still open (next dashboard checks)

1. ~~SSL/TLS encryption mode~~ → **DONE: Full**
2. ~~DNS → Records (apex)~~ → **DONE: Worker @ → 100:: Proxied**
3. www record + www → apex redirect — **GAP (do not add until founder approves)**
4. Email MX/SPF/DKIM/DMARC — optional later; not homepage-critical
5. Decision later (founder approve): stay on Worker manual deploy vs migrate to Pages + `out/`

---

## 4. Hard locks

- Do **not** Delete Worker
- Do **not** click GitHub/GitLab Connect without explicit approval
- Do **not** change SSL mode / DNS without explicit approval + note update
- Do **not** assume live site = latest `mithra-access-hub` Next.js build (it is Coming Soon today)

---

## 5. Change log

| Date       | Who               | What changed                                                                                                        | Note updated? |
| ---------- | ----------------- | ------------------------------------------------------------------------------------------------------------------- | ------------- |
| 2026-07-25 | Operator + Cursor | Initial live note from Overview, Settings, Domains, Deployments, Visit                                              | YES — created |
| 2026-07-25 | Operator + Cursor | SSL/TLS Overview: encryption mode **Full**; DNS setup Full; registrar Cloudflare Active; Free plan                  | YES — updated |
| 2026-07-25 | Operator + Cursor | DNS Records: 1 record — Worker `@` → `100::` Proxied; **www missing**; email DNS missing (noted only)               | YES — updated |
| 2026-07-26 | Operator + Cursor | Standing rule: every CF/Supabase screenshot updates live + UI nav notes. Added `CLOUDFLARE_OPERATOR_UI_NAV_NOTE.md` | YES — linked  |

---

## 6. How to update this note (every Cloudflare session)

1. Read this file first.
2. Change only what you actually verified or changed in the dashboard.
3. Update the matching row in **Current truth**.
4. Add one line to **Change log**.
5. Set **Last verified** date.
6. If something was removed/disabled, mark it explicitly (do not leave stale YES).
