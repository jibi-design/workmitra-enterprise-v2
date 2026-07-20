<!-- App name: WorkMitra / Job Mitra
File name: 25_OPERATOR_LESSONS_FUTURE_ACTIONS_LIVING_NOTES.md
Location: workmitra-master-docs/future reference document/
Type: Living document — automatically updated during operator sessions
-->

# ഓപ്പറേറ്റർ ലെസ്സൺസ് & ഫ്യൂചർ ആക്ഷൻ നോട്ടുകൾ

> **ഈ document ഒരു living note ആണ്.**
> Session-ൽ important ആയ കാര്യങ്ങൾ കണ്ടാൽ **permission ചോദിക്കാതെ** ഓട്ടോമാറ്റിക്കലി ഇവിടെ add ചെയ്യും.
> Operator-ന് backend/server/logging-ൽ deep idea ഇല്ലാത്ത critical stage — mistakes after launch = serious failure. ഈ doc അത് catch ചെയ്യാൻ help ചെയ്യും.
> Secrets, passwords, DATABASE_URL, API keys — ഒന്നും ഇല്ല.

---

## AUTO-UPDATE RULE (2026-07-07 — operator agreed)

**എപ്പോൾ add ചെയ്യും (permission ഇല്ലാതെ):**

| Type                    | Example                                                      |
| ----------------------- | ------------------------------------------------------------ |
| 🔴 Risk / mistake avoid | "Production-ൽ backup ഇല്ലാതെ deploy ചെയ്യരുത്"               |
| 🟢 Best practice        | "Evidence script fail ആയാൽ app defect assume ചെയ്യരുത്"      |
| 📅 Future action        | "Launch-ന് മുൻപ് Supabase Pro upgrade"                       |
| 🟡 Decision recorded    | "PITR defer — cost high, not needed now"                     |
| 💡 Simple explanation   | Backend vs DB vs frontend — operator-ന് മനസ്സിലാകുന്ന ഭാഷയിൽ |
| ⚠️ Gate / phase status  | Phase 2.1 IN PROGRESS, production NOT APPROVED               |

**Add ചെയ്യില്ല:** secrets, credentials, speculative features, domain API plans outside current phase.

---

## എങ്ങനെ ഈ document വായിക്കണം

- **🔴 ഒരിക്കലും ചെയ്യരുത്** — serious mistake
- **🟡 ശ്രദ്ധിക്കണം** — careful ആയി handle
- **🟢 ചെയ്യണം** — best practice
- **📅 ഭാവിയിൽ ചെയ്യണം** — deferred action
- **✅ Done** — completed

---

## SESSION LOG

---

### SESSION 1 — Phase 2.1 Evidence & Staging (2026-07-06 / 07)

#### ഇതിൽ നിന്ന് പഠിച്ചത്

**Evidence script-ൽ ഉണ്ടായ problems:**

1. **`tsx -e` Windows-ൽ fail ആകും** — top-level `await` CJS format-ൽ work ചെയ്യില്ല.
   - 🟢 Fix: inline code-ന് പകരം separate `.mjs` file ഉണ്ടാക്കുക.

2. **PowerShell-ൽ `$1` SQL parameter-ൽ vanish ആകും** — `ANY($1::text[])` → `ANY(::text[])` ആകും.
   - 🟢 Fix: SQL parameters Windows shell-ൽ double-quote-ൽ wrap ചെയ്യുക.

3. **`npm warn` lines stdout-ൽ വരും** — JSON parse fail ആകും.
   - 🟢 Fix: `parseLastJsonLine()` — last `{` line മാത്രം pick ചെയ്യുക.

4. **`NODE_ENV=production` subprocess-ലേക്ക് pass ആകില്ല** — inline `-e` string-ൽ set ചെയ്താൽ work ചെയ്യില്ല.
   - 🟢 Fix: `spawnSync` `env:` option-ൽ pass ചെയ്യുക.

5. **`fetch()` OPTIONS response-ൽ CORS header hide ആകാം** — Node.js ചില versions-ൽ.
   - 🟢 Fix: raw `http.request()` use ചെയ്ത് CORS probe ചെയ്യുക.

---

**GAP-003 — CORS evidence mismatch (CLEARED ✅)**

- Problem: Evidence script allowed-origin CORS probe fail കാണിച്ചു.
- Reality: Server CORS correct ആണ് — script probe method wrong ആയിരുന്നു.
- Lesson: 🟡 Evidence script fail ≠ app defect. Script-ൽ bug ആണോ app-ൽ bug ആണോ എന്ന് confirm ചെയ്ത ശേഷം മാത്രം server code touch ചെയ്യുക.

**GAP-004 — Audit query fail (CLEARED ✅)**

- Problem: Evidence script audit rows കണ്ടെത്തിയില്ല — 429 PASS ആയ സ്ഥലത്ത്.
- Reality: DB write OK ആയിരുന്നു — subprocess quoting Windows-ൽ break ആയി.
- Lesson: 🟡 Rate limit 429 കിട്ടി എന്നതിനർത്ഥം DB write work ചെയ്തു. Evidence query fail ≠ DB write fail.

---

#### Supabase Backup — Free Plan (2026-07-07)

**Dashboard message:** "Free Plan does not include project backups. Upgrade to the Pro Plan for up to 7 days of scheduled backups."

**PITR message:** "Point In Time Recovery is a Pro Plan add-on. Roll back your database to a specific second. Starts at $100/month. Pro Plan already includes daily backups at no extra cost."

| Item        | Status                                   |
| ----------- | ---------------------------------------- |
| §8.1 Backup | NOT CLEARED — Free plan, upgrade needed  |
| §8.2 PITR   | DOCUMENTED — plan limitation, Pro add-on |

- 🟢 Lesson: Free plan = no backups. Dev-ൽ OK. Real production-ന് Pro upgrade mandatory.
- 📅 Production launch-ന് മുൻപ്: Supabase Pro enable ചെയ്യുക.

---

#### Phase 2.1 Final Status (2026-07-07)

- **Operator evidence rerun: 16 PASS / 0 FAIL / 0 BLOCKED / 1 NEEDS_OPERATOR**
- §8.1 backup plan limitation cleared pending upgrade
- Phase 2.1: **IN PROGRESS**
- Production: **NOT APPROVED**

---

### SESSION 2 — Living doc agreement + infra reference (2026-07-07)

#### Operator context (important)

- Operator-ന് **backend / server / logs / database scaling**-ൽ deep technical background limited ആണ്.
- App **critical stage**-ൽ ആണ് — Phase 2 auth LOCKED, Phase 2.1 evidence collection, production ഇനിയും approve ചെയ്തിട്ടില്ല.
- 🔴 **Launch-ന് ശേഷം mistake = serious failure** — user data, jobs, trust എല്ലാം risk-ൽ.
- 🟢 **ഈ document-ന്റെ ഉദ്ദേശ്യം:** Session-ൽ discuss ചെയ്ത important points operator-ന് വീണ്ടും ഓർമ്മിപ്പിക്കാൻ; AI permission ചോദിക്കാതെ auto-update ചെയ്യും.

#### Documents created today

| File                                                 | Purpose                                                            |
| ---------------------------------------------------- | ------------------------------------------------------------------ |
| `24_INFRA_SCALING_DATABASE_BACKEND_BACKUP_NOTES.md`  | Infra scaling reference — Malayalam, stages 0–4, cost, backup/PITR |
| `25_OPERATOR_LESSONS_FUTURE_ACTIONS_LIVING_NOTES.md` | Living lessons — **ഈ file**; auto-updated each session             |

- 🟢 **24 = reference guide** (read when planning). **25 = living log** (grows each session).
- 📅 Launch-ന് മുൻപ് doc 24-ന്റെ Stage 2 checklist ഒന്നൊന്ന് tick ചെയ്യുക.

#### Simple mental model (ഓർക്കാൻ)

```
Website (Cloudflare)  →  user കാണുന്ന ഭാഗം
API Server (Render)   →  login, rules, validation — "മോട്ടർ"
Database (Supabase)   →  data സൂക്ഷിക്കുന്ന സ്ഥലം — "മെമ്മറി"
```

- Website down = users കാണില്ല. API down = login/work ചെയ്യില്ല. DB down / no backup = **data നഷ്ടം possible**.

---

### SESSION 3 — Supabase defer + GAP planning (2026-07-07)

#### Operator decisions recorded

- 📅 **Supabase Pro upgrade — DEFERRED** (ഇപ്പോൾ upgrade ചെയ്യില്ല)
- 📅 **PITR add-on — DEFERRED** ($100/month — business risk justify ചെയ്യുന്നതു വരെ)
- 🟢 **കാരണം:** Dev/staging മാത്രം; real production users ഇല്ല; premature cost avoid
- §8.1 **NOT CLEARED** — Free plan, backups ഇല്ല (expected, documented)
- §8.2 **DOCUMENTED** — plan limitation
- 🔴 Production launch-ന് മുൻപ് Pro **or** approved backup strategy **mandatory**

#### Next milestone started

- **GAP-001** — `auth_sessions` cleanup cron — PLANNING (implementation not approved)
- **GAP-002** — audit + login_attempts retention sweep — PLANNING (implementation not approved)
- 🟢 **Dry-run rule:** എല്ലാ cleanup jobs-ഉം DELETE-ന് മുൻപ് `DRY_RUN=true` mode mandatory
- 🔴 **Active sessions delete ചെയ്യരുത്** (GAP-001)
- 🔴 **Recent audit/security evidence destroy ചെയ്യരുത്** (GAP-002)

---

## STANDING RULES — ഓർക്കേണ്ടവ

### 🔴 ഒരിക്കലും ചെയ്യരുത്

| Rule                                                         | കാരണം                                   |
| ------------------------------------------------------------ | --------------------------------------- |
| Backup ഇല്ലാതെ production run ചെയ്യരുത്                      | Data loss permanent ആകാം                |
| Secrets git-ൽ commit ചെയ്യരുത്                               | DATABASE_URL, pepper, API keys — ഒന്നും |
| Dev evidence മാത്രം ഉപയോഗിച്ച് production approve ചെയ്യരുത്  | Staging evidence separately required    |
| Phase 2 auth code, new issue/gate ഇല്ലാതെ touch ചെയ്യരുത്    | LOCKED — gate required                  |
| Shift Jobs + Career Jobs mix ചെയ്യരുത്                       | Domain separation rule                  |
| Employee + Employer state mix ചെയ്യരുത്                      | Domain separation rule                  |
| Evidence script fail = app defect ആണ് എന്ന് assume ചെയ്യരുത് | Script bug-ഉം ഉണ്ടാകാം                  |

---

### 🟢 എപ്പോഴും ചെയ്യണം

| Rule                                     | Details                                  |
| ---------------------------------------- | ---------------------------------------- |
| Evidence ആദ്യം read-only                 | DB-യോ server-ഓ touch ചെയ്യുന്നതിന് മുൻപ് |
| Script fail → root cause confirm         | App defect? Script defect?               |
| Screenshots → ops drive only             | Git-ൽ ഇടരുത്                             |
| Secrets → secret manager                 | .env file-ഉം git-ൽ ഇടരുത്                |
| Phase gate open ചെയ്ത ശേഷം മാത്രം change | Locked sections touch ചെയ്യരുത്          |

---

## FUTURE ACTIONS — ഭാവിയിൽ ചെയ്യേണ്ടവ

### Production Launch-ന് മുൻപ് (Mandatory)

- [ ] 📅 Supabase Pro upgrade — backup enable
- [ ] 📅 `backup_enabled=yes` confirm, `last_successful_backup_date` record
- [ ] 📅 PITR decision — required ആണോ? ($100/month add-on)
- [ ] 📅 Supabase production project create (staging ≠ production)
- [ ] 📅 `WM_ALLOWED_ORIGINS` — exact production HTTPS origin
- [ ] 📅 `WM_SESSION_HASH_PEPPER` — unique production pepper (secret manager)
- [ ] 📅 Render backend paid plan (always-on)
- [ ] 📅 Cloudflare production domain setup
- [ ] 📅 Restore procedure test + document
- [ ] 📅 Real staging HTTPS origin CORS + cookie evidence
- [ ] 📅 Phase 2.1 PASS sign-off (§9.1)
- [ ] 📅 Production deploy gate approve (separate)

---

### Operational Gaps (address when production nears)

- [ ] 📅 **GAP-001** — `auth_sessions` expired rows cleanup cron (Render cron / Supabase scheduled function)
- [ ] 📅 **GAP-002** — `auth_audit_events` + `auth_login_attempts` retention sweep (90 days / 30 days)

---

### Scale ആകുമ്പോൾ (users കൂടുമ്പോൾ)

- [ ] 📅 Render instance upgrade — response time monitor
- [ ] 📅 Supabase compute/storage upgrade — DB query time monitor
- [ ] 📅 Error tracking (Sentry or equivalent)
- [ ] 📅 Email notification service (Resend / SendGrid)
- [ ] 📅 Backup restore drill (actual test)
- [ ] 📅 PITR evaluate (high data risk stage-ൽ)
- [ ] 📅 Read replicas — reporting traffic grows ആകുമ്പോൾ

---

## QUICK DECISION GUIDE — "ഇതെന്ത് ചെയ്യണം?" ഗൈഡ്

### "Server error / app crash"

```
1. Log നോക്കുക (Render dashboard → Logs)
2. Recent change ഉണ്ടോ? → Revert ചെയ്യുക
3. DB connection issue? → DATABASE_URL + Supabase status check
4. Auth issue? → Phase 2 code touch ചെയ്യരുത്; gate open ചെയ്യുക
5. Evidence collect ചെയ്ത ശേഷം AI-ൽ report ചെയ്യുക
```

### "DB query slow / timeout"

```
1. Supabase dashboard → Query performance
2. Index missing? → Add index (migration)
3. Too many rows? → Cleanup job run ചെയ്യുക
4. Compute insufficient? → Supabase plan upgrade consider
```

### "Login not working after deploy"

```
1. NODE_ENV=production ആണോ?
2. AUTH_USER_SOURCE=db ആണോ?
3. DATABASE_URL set ആണോ? (secret manager check)
4. WM_SESSION_HASH_PEPPER set ആണോ?
5. WM_ALLOWED_ORIGINS — correct production domain ആണോ?
6. HTTPS ആണോ? (Secure cookie requires HTTPS)
```

### "Cookie not working / logout not working"

```
1. Secure flag — HTTP-ൽ Secure cookie work ചെയ്യില്ല (HTTPS required)
2. SameSite=Lax — cross-site request ആണോ?
3. HttpOnly — JS-ൽ access ചെയ്യാൻ ശ്രമിക്കരുത്
4. Domain mismatch — frontend + backend same origin ആണോ?
```

### "CORS error in browser"

```
1. WM_ALLOWED_ORIGINS — exact frontend HTTPS URL ഉണ്ടോ?
2. Trailing slash ഇല്ലല്ലോ? (http://example.com ✓, http://example.com/ ✗)
3. HTTP vs HTTPS — match ആണോ?
4. Wrong method — OPTIONS preflight allowed ആണോ?
```

### "Rate limit 429 — real users affected"

```
1. WM_LOGIN_RATE_LIMIT_MAX env var — adjust ചെയ്യാം
2. IP block ആണോ? — auth_login_attempts check
3. Legitimate users block ആകുന്നെങ്കിൽ — rate limit window review
4. Attack ആണോ? — audit_events check
```

### "Supabase backup / data loss"

```
1. §8.1 — backup enabled ആണോ? (Free plan = NO backup)
2. Backup enabled ആണെങ്കിൽ — Supabase dashboard → Restore
3. PITR enabled ആണെങ്കിൽ — exact time rollback possible
4. Backup ഇല്ലെങ്കിൽ — data recovery possible അല്ല
→ Production-ൽ backup mandatory ആക്കുക
```

---

## ENVIRONMENT — ഓർക്കേണ്ട Env Variables

> Values ഇവിടെ ഇടരുത്. ഇവ secret manager-ൽ ആണ്.

| Variable                  | ഉദ്ദേശം             | Dev                     | Production                |
| ------------------------- | ------------------- | ----------------------- | ------------------------- |
| `NODE_ENV`                | Server mode         | `development`           | `production`              |
| `AUTH_USER_SOURCE`        | DB vs memory auth   | `db`                    | `db`                      |
| `DATABASE_URL`            | Supabase connection | staging pooler          | production pooler         |
| `WM_SESSION_HASH_PEPPER`  | Session security    | dev pepper              | **unique prod pepper**    |
| `WM_ALLOWED_ORIGINS`      | CORS whitelist      | `http://localhost:5173` | production HTTPS origin   |
| `PORT`                    | API server port     | `3001`                  | Render sets automatically |
| `WM_LOGIN_RATE_LIMIT_MAX` | Failed login limit  | 5 (default)             | 5 (default or adjust)     |

---

## COST REMINDER

| Provider       | Dev              | MVP Production            | Note                      |
| -------------- | ---------------- | ------------------------- | ------------------------- |
| Cloudflare     | Free             | Free / paid               | Domain, DNS, Pages        |
| Render         | Free (sleeps)    | Paid ($7+/month)          | Always-on required        |
| Supabase       | Free (no backup) | **Pro ($25/month)**       | Backup required           |
| PITR           | —                | Add-on ($100/month)       | Defer until needed        |
| Email          | —                | Resend / SendGrid         | When notifications needed |
| Error tracking | —                | Sentry (free tier exists) | When users start coming   |

---

## DOCUMENT UPDATE LOG

| Date       | Session                                | What added                                                                                                            |
| ---------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 2026-07-07 | Phase 2.1 operator evidence + §8.1/8.2 | Initial creation — lessons, GAP-003/004, backup plan limitation, standing rules, future actions, quick decision guide |
| 2026-07-07 | Living doc agreement                   | Auto-update rule (no permission); operator context; doc 24 vs 25; simple mental model                                 |
| 2026-07-07 | Supabase defer + GAP planning          | Pro/PITR deferred; GAP-001/002 planning; dry-run rule                                                                 |

---

> **Auto-update active:** Session-ൽ important point കണ്ടാൽ ഈ file-ൽ add ചെയ്യും — operator-ന് "എന്ത് add ചെയ്യണം" എന്ന് അറിയേണ്ടതില്ല.
