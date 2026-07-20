<!-- App name: WorkMitra / Job Mitra
File name: 24_INFRA_SCALING_DATABASE_BACKEND_BACKUP_NOTES.md
Location: workmitra-master-docs/future reference document/
-->

# ഇൻഫ്രാ സ്കേലിങ് നോട്ടുകൾ — ഡേറ്റാബേസ്, ബാക്കെൻഡ്, ബാക്കപ്പ്, PITR, ഭാവി വളർച്ച

**ഡോക്യുമെൻ്റ് തരം:** Planning / Reference — Code മാറ്റമില്ല  
**ഘട്ടം:** Phase 2.1 Production Readiness — IN PROGRESS  
**Production Deploy:** NOT APPROVED  
**Phase 2 Auth:** LOCKED / PASS

> ഈ ഡോക്യുമെൻ്റ് planning reference മാത്രം.  
> ഇതിൽ secrets, DATABASE_URL, passwords, API keys, WM_SESSION_HASH_PEPPER ഒന്നും ഇല്ല.

---

## 1. ഇപ്പോഴത്തെ സിസ്റ്റം — ലളിതമായ വിശദീകരണം

### മൂന്ന് ഭാഗങ്ങൾ

| ഭാഗം            | എന്ത് ചെയ്യുന്നു                                                                   | Dev-ൽ ഇപ്പോൾ                  | Production-ൽ ഭാവിയിൽ                     |
| --------------- | ---------------------------------------------------------------------------------- | ----------------------------- | ---------------------------------------- |
| **Frontend**    | User കാണുന്ന screens — login, job list, dashboard                                  | localhost (Vite)              | Cloudflare Pages                         |
| **Backend API** | Business logic — login check, session, rate limit, audit, employer/employee routes | localhost:3001                | Render                                   |
| **Database**    | ഡേറ്റ സ്ഥിരമായി store ചെയ്യുന്നത്                                                  | Supabase PostgreSQL (staging) | Supabase PostgreSQL (production project) |

### Data ഒഴുകുന്ന വഴി

```
User Browser
    ↓
Frontend (mitraaccesshub.com / product subdomains — Cloudflare)
    ↓
Backend API (Render — /v1/jobmitra/auth/...)
    ↓
Supabase PostgreSQL Database
```

### Database-ൽ store ആകുന്ന data

**ഇപ്പോൾ (Phase 2):**

- User accounts (`auth_users`)
- Password hashes (plain password ഒരിക്കലും save ചെയ്യില്ല)
- Sessions (`auth_sessions`)
- Audit events — login, logout, rate limit (`auth_audit_events`)
- Login attempts (`auth_login_attempts`)

**ഭാവിയിൽ (Phase 3+):**

- Jobs — Shift, Career
- Applications
- Work Vault metadata
- Access grants, documents
- Employer/employee profiles

---

## 2. ഇപ്പോഴത്തെ Phase Status

| Gate                             | Status                                             |
| -------------------------------- | -------------------------------------------------- |
| Phase 2 — Auth Persistence       | **LOCKED / PASS** (2026-07-06)                     |
| Phase 2.1 — Production Readiness | **IN PROGRESS**                                    |
| Supabase Session Pooler          | Working                                            |
| Auth smoke test                  | PASS — login → /me → logout → 401                  |
| Secure cookie flags              | PASS — HttpOnly, SameSite=Lax, Secure (live)       |
| CORS                             | PASS — allowed origin echoed; wrong origin blocked |
| Rate limit                       | PASS — 429 on 6th failed login                     |
| Audit/login rows                 | PASS — auditRowCount=5, failedAttemptCount=5       |
| §8.1 Scheduled backups           | **NOT CLEARED** — Free plan-ൽ project backups ഇല്ല |
| §8.2 PITR                        | **DOCUMENTED** — Pro add-on plan limitation        |
| Production deployment            | **NOT APPROVED**                                   |

---

## 3. Database Backup എന്നത് എന്താണ്?

### ലളിതമായി പറഞ്ഞാൽ

Backup = App-ന്റെ data-യുടെ ഒരു safe copy, വേറൊരിടത്ത് save ചെയ്തത്.

### Backup ഉണ്ടെങ്കിൽ

- Accidental deletion ആയ data recover ചെയ്യാം
- Bad migration (schema change mistake) ആയാൽ restore ചെയ്യാം
- Data corruption വന്നാൽ fix ചെയ്യാം
- Real user records — employer, employee, jobs — സുരക്ഷിതം
- Production readiness approval-ന് mandatory

### Backup ഇല്ലെങ്കിൽ ഉള്ള Risk

- Data loss permanent ആകാം
- User records, job records, application history — നഷ്ടപ്പെടാം
- Audit evidence (login/audit logs) നഷ്ടപ്പെടാം
- ഒരു mistake ആയാൽ recover ചെയ്യാൻ വഴിയില്ല
- **Production deploy approve ചെയ്യരുത്**

### Decision

| Situation                | Backup                                          |
| ------------------------ | ----------------------------------------------- |
| Dev / local testing only | Urgent അല്ല — Free plan acceptable              |
| Real production launch   | **Mandatory** — backup ഇല്ലാതെ launch ചെയ്യരുത് |

---

## 4. Daily Backup vs PITR — വ്യത്യാസം

### Daily Backup

- ദിവസം ഒരിക്കൽ automatic snapshot എടുക്കുന്നു
- Problem ആയാൽ last backup-ലേക്ക് restore ചെയ്യാം
- MVP production-ന് ഇതു മതി
- Production launch-ന് minimum requirement

### PITR — Point-In-Time Recovery

- Database-നെ **exact second-ലേക്ക്** rollback ചെയ്യാം
- ഉദാഹരണം: "ഇന്ന് 2:34:17 PM-ന് ഉണ്ടായ mistake-ന് മുൻപ്" — ആ second-ലേക്ക് restore
- High-risk production data-ക്ക് useful
- Supabase-ൽ Pro add-on — extra cost
- ഇപ്പോൾ ആവശ്യമില്ല

### Decision Table

| Stage                       | What to use                      |
| --------------------------- | -------------------------------- |
| Dev / staging (ഇപ്പോൾ)      | Backup ആവശ്യമില്ല (Free plan OK) |
| MVP production (soon)       | **Daily backup mandatory**       |
| High growth / critical data | PITR consider ചെയ്യുക            |

---

## 5. Monthly Cost Planning

### Providers — വ്യത്യസ്ത bills

| Provider       | ഉദ്ദേശം                      | Dev                          | MVP Production                         |
| -------------- | ---------------------------- | ---------------------------- | -------------------------------------- |
| **Cloudflare** | Frontend, domain, DNS        | Free tier                    | Free / Workers paid (usage based)      |
| **Render**     | Backend API server           | Free tier (sleep after idle) | Paid plan needed for always-on         |
| **Supabase**   | Database, storage, backups   | Free tier                    | **Pro required** for backups           |
| Email / SMS    | Notifications (future)       | —                            | Separate service (Resend, Twilio etc.) |
| Monitoring     | Error tracking (Sentry etc.) | —                            | Separate service                       |

### Planning Rule

- **Dev phase:** Cost low ആക്കുക — paid upgrades avoid ചെയ്യുക
- **MVP production:** Lean budget target — Supabase Pro + Render paid + Cloudflare
- **PITR:** High cost — real business risk justify ചെയ്യുന്നതു വരെ defer
- **Always:** Provider pricing ഒരിക്കൽ കൂടി confirm ചെയ്ത ശേഷം മാത്രം decision എടുക്കുക

> ⚠️ Prices change ആകാം. Final business decision-ന് മുൻപ് current provider pricing ഒരിക്കൽ check ചെയ്യുക.

---

## 6. Growth Stages — ഓരോ ഘട്ടവും

### Stage 0 — Local / Dev (ഇപ്പോൾ)

- Backend: localhost:3001
- Database: Supabase staging project
- Real users: ഇല്ല
- Free plan: OK
- Production deploy: **NOT APPROVED**

---

### Stage 1 — Private Staging

- Backend: Render staging deployment അല്ലെങ്കിൽ local
- Database: Supabase staging DB
- Auth smoke, CORS, rate limit evidence: collected
- Real customer data: ഇല്ല
- Backups: still plan limitation OK (no real data)

---

### Stage 2 — MVP Production ✅ (ഇതു ready ആകണം launch-ന് മുൻപ്)

Production-ന് മുൻപ് ഇവ confirm ആകണം:

- [ ] Render backend deployed (paid plan — always-on)
- [ ] Cloudflare frontend deployed (production domain)
- [ ] Supabase **production** DB (staging project ഉപയോഗിക്കരുത്)
- [ ] Daily backups enabled (Supabase Pro അല്ലെങ്കിൽ approved alternative)
- [ ] Secure cookies HTTPS-ൽ confirmed
- [ ] CORS exact production origin configured
- [ ] Production secrets set (secret manager — git-ൽ ഇല്ല)
- [ ] Rate limit + audit logs verified on production
- [ ] Restore procedure documented
- [ ] Production deploy gate approved (separate sign-off)

---

### Stage 3 — Active Early Users

- Render instance upgrade if response time slow
- Supabase storage / disk usage monitor
- Session cleanup cron job (GAP-001)
- Audit / login_attempt retention sweep (GAP-002)
- Basic monitoring + alerting
- Error tracking (Sentry or equivalent)
- Email notification service
- Migration rollback process review

---

### Stage 4 — High Growth / Critical Data

- Larger Render instance / horizontal scaling
- Supabase compute + storage upgrade
- PITR — consider if data loss risk high
- Read replicas — if reporting traffic grows
- Advanced monitoring + on-call
- Incident response runbook
- Backup restore drills
- Staging / production environments fully separated

---

## 7. Users കൂടുമ്പോൾ എന്ത് മാറും?

### Database-ൽ load കൂടും

- Login / session records കൂടും
- Jobs / applications കൂടും
- Audit logs കൂടും
- Storage കൂടും
- Backend requests കൂടും

### ഇതിന് scale ആകാൻ

| Action                       | When                                |
| ---------------------------- | ----------------------------------- |
| Backend server upgrade       | Response time slow ആകുമ്പോൾ         |
| DB compute / storage upgrade | Queries slow ആകുമ്പോൾ               |
| Indexes add ചെയ്യുക          | Specific queries slow ആകുമ്പോൾ      |
| Session cleanup cron         | Expired rows ഉണ്ടാകുന്ന phase-ൽ     |
| Audit retention sweep        | 90-day window exceed ആകുന്ന phase-ൽ |
| Monitoring add ചെയ്യുക       | Guess ചെയ്യുന്നതിന് മുൻപ്           |

> ⚠️ Early scale: premature expensive services avoid ചെയ്യുക. Data ഉള്ള evidence-ന്റെ basis-ൽ upgrade ചെയ്യുക.

---

## 8. ഇപ്പോഴത്തെ Open Operational Gaps

| Gap                               | Status       | Notes                                                                                              |
| --------------------------------- | ------------ | -------------------------------------------------------------------------------------------------- |
| GAP-001 — DB session cleanup cron | OPEN (P1)    | `auth_sessions` expired rows purge job ഇല്ല                                                        |
| GAP-002 — Audit retention sweep   | OPEN (P1)    | `auth_audit_events` / `auth_login_attempts` retention job ഇല്ല                                     |
| §8.1 Scheduled backups            | NOT CLEARED  | Free plan — project backups ഇല്ല; Pro upgrade required                                             |
| §8.2 PITR                         | DOCUMENTED   | Plan limitation — Pro add-on; defer until production risk justifies                                |
| Real staging frontend origin      | Pending      | localhost simulation മാത്രം — real staging HTTPS origin evidence required before production deploy |
| Production deployment             | NOT APPROVED | Phase 2.1 PASS + separate deploy gate required                                                     |

---

## 9. Decision Rules — ഓർക്കേണ്ട നിയമങ്ങൾ

### ഇവ ഒരിക്കലും ചെയ്യരുത്

| Rule                                                                       |
| -------------------------------------------------------------------------- |
| Backup / approved backup strategy ഇല്ലാതെ production run ചെയ്യരുത്         |
| Business risk justify ചെയ്യുന്നതു വരെ PITR enable ചെയ്യരുത്                |
| Employee domain-ഉം Employer domain-ഉം mix ചെയ്യരുത്                        |
| Shift Jobs-ഉം Career Jobs-ഉം mix ചെയ്യരുത്                                 |
| New issue / phase gate ഇല്ലാതെ Phase 2 Auth modify ചെയ്യരുത്               |
| Secrets docs-ൽ അല്ലെങ്കിൽ git-ൽ store ചെയ്യരുത്                            |
| Dev / local evidence മാത്രം ഉപയോഗിച്ച് production deploy approve ചെയ്യരുത് |

---

## 10. ഇപ്പോഴത്തെ Recommendation

```text
Current recommendation (2026-07-07):

✅ Dev phase continue ചെയ്യുക — Supabase ഇപ്പോൾ upgrade ആവശ്യമില്ല
✅ Phase 2.1 IN PROGRESS ആയി നിലനിർത്തുക
✅ Production deployment NOT APPROVED — approve ചെയ്യരുത്
✅ Real production launch-ന് മുൻപ് Supabase Pro / backup enable ചെയ്യുക
✅ PITR defer — production data risk justify ചെയ്യുന്ന stage വരെ
✅ Dev / MVP phase-ൽ infrastructure lean ആയി നിലനിർത്തുക
✅ GAP-001, GAP-002 — production phase gate-ൽ address ചെയ്യുക
✅ Phase 2 Auth: LOCKED — new issue gate ഇല്ലാതെ modify ചെയ്യരുത്
```

---

## 11. Quick Reference — അടിസ്ഥാന Checklist

Production-ന് മുൻപ് operator confirm ചെയ്യേണ്ടത്:

```
[ ] Supabase Pro (backup enabled) — §8.1 cleared
[ ] PITR decision documented — §8.2 closed
[ ] Production DB ≠ staging DB
[ ] Render backend always-on (paid plan)
[ ] Cloudflare production domain configured
[ ] WM_ALLOWED_ORIGINS — exact production origin
[ ] Secure cookie over HTTPS confirmed
[ ] WM_SESSION_HASH_PEPPER — unique production pepper (secret manager)
[ ] Rate limit + audit verified on production DB
[ ] Session cleanup cron planned (GAP-001)
[ ] Audit retention sweep planned (GAP-002)
[ ] Restore procedure tested
[ ] Phase 2.1 PASS recorded
[ ] Production deploy gate approved (separate sign-off)
```

---

## Document Metadata

| Field               | Value                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------ |
| Created             | 2026-07-07                                                                                 |
| Phase               | 2.1 Production Readiness                                                                   |
| Phase 2.1 status    | IN PROGRESS                                                                                |
| Production deploy   | NOT APPROVED                                                                               |
| Auth code change    | None                                                                                       |
| Secrets stored      | None                                                                                       |
| Reference checklist | `23_PHASE_2_1_PRODUCTION_READINESS_CHECKLIST.md`                                           |
| Backup record       | `evidence/PHASE_2_1_8_1_RECORD.md`                                                         |
| GAP issues          | `issues/GAP-001`, `issues/GAP-002`, `issues/GAP-003` (cleared), `issues/GAP-004` (cleared) |
