# Supabase Operator UI Navigation Note — jobmitra-enterprise-v2-dev

> **Purpose:** Click-path map of the **current** Supabase Dashboard UI so agents can guide the operator without re-learning from screenshots every time.  
> **Update rule:** When a new screenshot shows a different label/path, update this file **the same session**.  
> **Standing operator rule (2026-07-26):** Any Supabase (or related) dashboard screenshot → update this note + `SUPABASE_LIVE_STATE_NOTE.md` as needed so future issues are solved from notes, not chat memory.  
> **Companions:** `SUPABASE_LIVE_STATE_NOTE.md` · `SHIFT_OPS_LIVE_STATE_NOTE.md` · `SHIFT_OPS_CHANNEL_PEPPER_OPERATOR_RUNBOOK.md`  
> **Hard rule:** Never store API keys, DB passwords, JWTs, service_role, or `channel_pepper` in this file.

**Project:** `jobmitra-enterprise-v2-dev` (Mitra Labs)  
**Last UI verified:** 2026-07-26 (operator screenshots)

---

## 1. Mental model (simple)

| Need                                        | Go here                                                                    | Do NOT go here                                                            |
| ------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Run SQL (migrations, pepper update, checks) | Left sidebar → **SQL Editor**                                              | Settings                                                                  |
| Expose `shift_ops` to the app API           | **Project Settings → Data API → Settings tab → Exposed schemas**           | **API Keys**                                                              |
| Copy anon / publishable keys for `.env`     | Project Settings → **API Keys**                                            | Data API (unless you only need the REST URL)                              |
| Project URL for `VITE_SUPABASE_URL`         | Project Settings → **General** (Project URL)                               | —                                                                         |
| Legacy anon for `VITE_SUPABASE_ANON_KEY`    | API Keys → tab **Legacy anon, service_role API keys** → copy **anon** only | Never copy service_role into Vite                                         |
| Edge Functions list / deploy status         | Left sidebar → **Edge Functions**                                          | Homepage Edge still none; Shift Ops OTP = `shift-ops-otp-dispatch` (T2-7) |
| Function secrets                            | Edge Functions → Secrets / CLI `supabase secrets set`                      | Never paste into chat                                                     |
| Tables browse                               | Table Editor                                                               | —                                                                         |

**Common mistake:** API Keys page ≠ Exposed schemas. Keys are secrets/publishable tokens. Schema expose is under **Data API → Settings**.

---

## 2. Left sidebar (project home)

Typical order (icons may vary; labels matter):

- Home / Project overview
- Table Editor
- SQL Editor ← migrations & one-off SQL
- … other product icons …
- **Project Settings** (gear) ← configuration

---

## 3. Project Settings left menu (verified 2026-07-26)

Header: `< Project Settings`

### CONFIGURATION

- General
- Compute and Disk
- Infrastructure
- Integrations
- **API Keys** ← publishable / secret keys (NOT schema expose)
- JWT Keys
- Log Drains
- Add-ons

### INTEGRATIONS

- **Data API** (external-link style) ← **Exposed schemas live here**
- Vault (BETA)

### BILLING

- Subscription
- Usage

---

## 4. Data API screens (verified)

### 4.1 Overview tab

- Title: Data API (Official), status INSTALLED
- Shows REST URL `…/rest/v1/`
- Toggle: **Enable Data API** (keep ON for Shift Ops client)
- Tabs: **Overview | Settings | Docs**

### 4.2 Settings tab ← Task “expose shift_ops”

Path:

1. Project Settings
2. INTEGRATIONS → **Data API**
3. Tab → **Settings** (not Overview)
4. **Exposed schemas** dropdown
5. Tick **`shift_ops`** (keep existing schemas such as `public`)
6. Expect count to increase (e.g. was “2 of 3” → “3 of 3” when `shift_ops` was the missing one)
7. **Save**

**Verified 2026-07-26 (operator screenshot):** Exposed schemas dropdown listed and checked:

- `graphql_public`
- `public`
- `shift_ops`

UI text: **“3 of 3 schemas exposed.”**  
Also visible same page: Exposed functions “1 of 22”; Automatically expose new tables **ON**; Extra search path `PUBLIC`, `EXTENSIONS`; Max rows 1000; Pool size automatic.  
**Harden Data API** button → still **do not click** unless founder asks.

---

## 5. SQL Editor habits (operator)

1. After a successful Run, the editor may still show old SQL — that is **history text**, not “pending apply”.
2. Before the next file: **New query** or **select all → delete**, then paste only the next file.
3. Phase 0 then Phase 1 = **two separate Runs**.
4. Supabase warning “creates table without RLS”: for Shift Ops vault/outbox tables choose **Run and enable RLS** (not “Run without RLS”).
5. “Success. No rows returned” is normal for DDL (`CREATE` / `GRANT` / `COMMIT`).
6. Never paste pepper or secret keys into chat; after pepper `UPDATE`, clear the editor / delete saved query with the secret.

---

## 6. Shift Ops post-apply checklist (UI)

| #   | Task          | Where                                                      | Done signal (chat-safe)                                   |
| --- | ------------- | ---------------------------------------------------------- | --------------------------------------------------------- |
| 1   | Expose schema | Data API → Settings → Exposed schemas → `shift_ops` → Save | `schema exposed`                                          |
| 2   | Set pepper    | SQL Editor + vault (see pepper runbook)                    | `pepper ready` only if `is_channel_pepper_ready()` = true |
| 3   | Smoke         | Agent T2-5 after above                                     | `T2-5 തുടങ്ങൂ`                                            |

---

## 7. How agents must use this note

1. Before any Supabase dashboard guidance: **read this file first**.
2. Give click paths using **labels in this note**, not guesses from old Supabase docs.
3. If the operator’s screen differs: ask for a screenshot of **that panel only** (no keys), then **update §3–4** here.
4. Prefer one task at a time (“do Task 1 only; reply `schema exposed`”).

---

## 8. Change log

| Date       | What learned / changed                                                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-07-26 | Mapped Settings menu; Data API under INTEGRATIONS; Exposed schemas on Data API **Settings** tab; API Keys ≠ schema expose; “2 of 3 schemas” UI; Harden button exists — do not click. |
| 2026-07-26 | Screenshot: Exposed schemas = **3 of 3** checked — `graphql_public`, `public`, `shift_ops`. Auto-expose tables ON; search path PUBLIC+EXTENSIONS.                                    |
| 2026-07-26 | T2-6: Prefer Legacy **anon** key for `VITE_SUPABASE_ANON_KEY`; Project URL from Settings → General. Never put service_role in Vite.                                                  |
