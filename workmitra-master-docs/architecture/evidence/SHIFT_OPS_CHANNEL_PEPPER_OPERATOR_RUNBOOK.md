# Shift Ops — channel_pepper Operator Runbook (T2-3)

> **Purpose:** Set and verify `shift_ops.config.channel_pepper` without committing secrets.  
> **Companion:** `SHIFT_OPS_LIVE_STATE_NOTE.md` · `SHIFT_OPS_OTP_EDGE_DESIGN.md`  
> **Hard rule:** Never paste the real pepper into git, chat, AI Studio, screenshots, or tickets.

**Status:** Runbook **READY** (2026-07-26). Live DB set is **blocked until T2-4 SQL apply**.

---

## Why this exists

- Channel hashes + OTP hashes + `pgp_sym_encrypt` all use `channel_pepper`.
- Migration ships placeholder `REPLACE_ME_SET_VIA_VAULT_BEFORE_PROD` (dev may fall back to `dev-only-pepper`).
- Production / shared-dev must use a strong unique pepper stored only in an operator vault (1Password / Bitwarden / company secret store).

---

## Timing (do not reorder)

| Step                                  | When                                                   |
| ------------------------------------- | ------------------------------------------------------ |
| A. Generate + store pepper offline    | **Now** (before or during T2-3) — no DB needed         |
| B. Apply Phase 0+1 SQL                | **T2-4** only after explicit “apply”                   |
| C. UPDATE `shift_ops.config`          | Immediately after T2-4 apply                           |
| D. Verify `is_channel_pepper_ready()` | Same session; paste **true/false only** into live note |
| E. Deploy OTP Edge                    | After C+D (and T2-5 smoke)                             |

---

## A. Generate (offline — never commit)

Use any local machine; do **not** ask Cursor/chat to invent and store the value.

PowerShell example (copy output to vault only):

```powershell
# 48-byte URL-safe secret; print once; store in password manager; clear scrollback
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

Or OpenSSL:

```bash
openssl rand -base64 48
```

Requirements:

- Length **≥ 32** characters after trim
- Unique per environment (`jobmitra-enterprise-v2-dev` ≠ future prod)
- Not equal to `REPLACE_ME_SET_VIA_VAULT_BEFORE_PROD` or `dev-only-pepper`

Vault item label suggestion: `JobMitra / shift_ops / channel_pepper / jobmitra-enterprise-v2-dev`

---

## B–C. Set in Supabase (after T2-4 apply only)

1. Open project `jobmitra-enterprise-v2-dev` → SQL Editor (operator only).
2. Confirm schema exists: `\dn shift_ops` or Table Editor shows `shift_ops.config`.
3. Run **only** this pattern (paste pepper from vault into Editor; do not save the query as a shared snippet with the value):

```sql
update shift_ops.config
set
  value = '<PASTE_FROM_VAULT_THEN_DELETE_FROM_EDITOR_HISTORY>',
  updated_at = now()
where key = 'channel_pepper';
```

4. Clear SQL Editor history / do not leave the pepper in a saved query.
5. Optional: store a **non-secret** note in vault that “DB row updated on &lt;date&gt;”.

---

## D. Verify (safe for chat / live note)

```sql
select shift_ops.is_channel_pepper_ready() as pepper_ready;
```

| Result  | Meaning                                             |
| ------- | --------------------------------------------------- |
| `true`  | Pepper set; mark live note T2-3 execute ✅          |
| `false` | Still placeholder / too short / missing — re-run §C |

**Forbidden:** `select value from shift_ops.config where key = 'channel_pepper';` in any shared channel.

---

## Rotation (later — out of T2-3 scope)

Changing pepper **invalidates** existing channel hashes and undecryptable secrets. Rotation needs a planned re-hash / re-encrypt migration — do not rotate casually after workers are onboarded.

---

## Operator checklist (tick in live note after execute)

- [ ] Pepper generated offline (≥32 chars)
- [ ] Stored in operator vault (not git / not chat)
- [ ] T2-4 SQL applied
- [ ] `UPDATE shift_ops.config … channel_pepper` done
- [ ] `is_channel_pepper_ready()` = `true` (boolean only recorded)
- [ ] SQL Editor cleared of plaintext pepper

---

## Change log

| Date       | What                                                |
| ---------- | --------------------------------------------------- |
| 2026-07-26 | T2-3 runbook created. Live set deferred until T2-4. |
