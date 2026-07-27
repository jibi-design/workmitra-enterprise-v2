# Cloudflare Operator UI Navigation Note — mitraaccesshub.com

> **Purpose:** Click-path map of the **current** Cloudflare Dashboard UI so agents can guide without re-learning from screenshots every time.  
> **Update rule:** Any Cloudflare screenshot in chat → update this note **same session** (non-secrets only).  
> **Companions:** `CLOUDFLARE_LIVE_STATE_NOTE.md` · `PENDING_WORK_BOARD.md`  
> **Rule:** `.cursor/rules/infra-live-state-notes.mdc`  
> **Hard rule:** Never store API tokens, Global API keys, account emails passwords, or tunnel secrets here.

**Zone / site:** `mitraaccesshub.com`  
**Worker project (live):** `mitra-access-hub`  
**Last UI verified:** 2026-07-25 (from live state note; expand whenever new screenshots arrive)

---

## 1. Mental model

| Need                  | Go here                              | Notes                                              |
| --------------------- | ------------------------------------ | -------------------------------------------------- |
| Live site type        | Workers & Pages → `mitra-access-hub` | Live = **Worker**, not classic Pages               |
| Custom domain         | Worker → Domains / Custom domains    | Apex Active                                        |
| Deployments / version | Worker → Deployments                 | Manual deploy; Git not connected                   |
| SSL mode              | Zone → SSL/TLS                       | **Full** verified                                  |
| DNS records           | Zone → DNS → Records                 | Apex Worker `@` → `100::` Proxied; **www missing** |
| Public check          | Visit site / workers.dev             | Coming Soon placeholder                            |

Intended later (not live): **Pages** + Git + build `out/` — keep both facts in live note until founder migrates.

---

## 2. Screenshot update checklist (agent)

When operator sends a CF screenshot, capture into this note and/or `CLOUDFLARE_LIVE_STATE_NOTE.md`:

- [ ] Exact menu labels / left-nav path
- [ ] Project type (Worker vs Pages)
- [ ] Domain / DNS / SSL values (non-secret)
- [ ] Gaps/warnings shown in UI (e.g. www missing)
- [ ] Change log line + Last verified date

---

## 3. Change log

| Date       | What learned / changed                                                                                                                               |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-26 | Note created. Standing rule: every CF screenshot updates this + live note. Seeded from existing `CLOUDFLARE_LIVE_STATE_NOTE.md` (2026-07-25 verify). |
