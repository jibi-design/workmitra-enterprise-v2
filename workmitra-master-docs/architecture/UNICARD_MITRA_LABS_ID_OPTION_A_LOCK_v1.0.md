<!-- App name: WorkMitra / Job Mitra
File name: UNICARD_MITRA_LABS_ID_OPTION_A_LOCK_v1.0.md
Full file path: C:\projects\WorkMitra_Enterprise_v2\workmitra-master-docs\architecture\UNICARD_MITRA_LABS_ID_OPTION_A_LOCK_v1.0.md -->

# UNICARD / MITRA LABS ID — OPTION A LOCK (v1.0)

## 1. Document Status

| Field                    | Value                                                                                                       |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Status                   | **LOCKED — Product Owner approved (2026-08-08)**                                                            |
| Decision                 | **Option A**                                                                                                |
| Canonical public ID      | **`ML-XXXX-ABC-XXXX`**                                                                                      |
| Scope                    | All Mitra Labs products (Job Mitra, HomeFix Mitra, future apps)                                             |
| Related roadmap          | [`22_MITRA_ECOSYSTEM_ROADMAP_AND_BOUNDARIES.md`](./22_MITRA_ECOSYSTEM_ROADMAP_AND_BOUNDARIES.md) §6 / §14.1 |
| Current client generator | `src/shared/identity/generators/uniqueIdGenerator.ts`                                                       |
| Current client constants | `src/shared/identity/constants/idConstants.ts`                                                              |

---

## 2. Locked Decision (Option A)

```txt
Mitra Labs UniCard ID = ML-XXXX-ABC-XXXX
Globally unique across all Mitra Labs products.
Product provenance is source_app / membership metadata — never encoded in the public ID.
Auth UUID remains the security principal.
App / product codes (JM, WM, HFM, etc.) NEVER appear inside the public UniCard ID string.
ML ID minting moves from client-side to server-side during backend DB migration.
```

This lock is permanent unless a later Product Owner review explicitly supersedes this document.

---

## 3. Public UniCard ID Format

### 3.1 Locked format

```txt
ML-XXXX-ABC-XXXX
```

| Block  | Meaning                                                    |
| ------ | ---------------------------------------------------------- |
| `ML`   | Mitra Labs prefix only                                     |
| `XXXX` | 4 random alphanumeric characters                           |
| `ABC`  | Name-derived 3-character center block (padded when needed) |
| `XXXX` | 4 random alphanumeric characters                           |

Display length remains **16 characters** including separators.

### 3.2 Forbidden public ID patterns

Do **not** use or invent:

```txt
ML-USER-123
ML-JM-XXXX-...
ML-WM-XXXX-...
JM-XXXX-ABC-XXXX
WM-XXXX-ABC-XXXX
```

Product codes must not be hardcoded into the public ID string in any Mitra Labs product.

---

## 4. Provenance Model

### 4.1 Locked rule

Product provenance is stored as metadata, not in the ID string.

Canonical field direction for user / account schema:

```txt
source_app
```

Examples of intended values (illustrative, not exhaustive):

```txt
job_mitra
homefix_mitra
mitra_access_hub
```

Membership / role context may also record which apps the account belongs to, but the **public UniCard ID remains one shared Mitra Labs format**.

### 4.2 What provenance is for

- audit and analytics
- first-registration product tracking
- support / ops routing
- future cross-app membership queries

### 4.3 What provenance is not

- part of the human-readable UniCard ID
- a substitute for auth UUID
- automatic permission to merge cross-app private data

Cross-app data merge still requires explicit user permission and product-level approval (see ecosystem roadmap §6.4).

---

## 5. Identity Layers (do not collapse)

| Layer                                        | Role                                    | Locked stance                                                |
| -------------------------------------------- | --------------------------------------- | ------------------------------------------------------------ |
| Auth UUID / session principal                | Security identity                       | Remains separate from UniCard display ID                     |
| Public UniCard / Mitra Labs ID               | Human-facing global Mitra Labs identity | Format locked as `ML-XXXX-ABC-XXXX`                          |
| `source_app` / membership metadata           | Product provenance                      | Required in user DB schema direction                         |
| Role profiles (employer / employee / etc.)   | App-specific role state                 | Remain app-scoped; never encoded in UniCard ID               |
| Trust Profile / full Shared Mitra ID product | Future cross-app trust layer            | Still roadmap / implementation No-Go until separate approval |

---

## 6. Minting Migration Plan (client → server)

### 6.1 Current state (pre-migration)

- UniCard / ML IDs are minted client-side.
- Registry today is local (`wm_id_registry_v1` / client identity helpers).
- Server may store or reference ML IDs, but does not yet own mint authority.

### 6.2 Locked migration intent

During backend DB migration / account ownership work:

1. Move ML ID mint authority to the server.
2. Enforce uniqueness in the database (global uniqueness across Mitra Labs products).
3. Persist `source_app` (and related membership metadata) with the user record.
4. Keep public format exactly `ML-XXXX-ABC-XXXX`.
5. Preserve existing issued IDs where possible; do not rewrite public IDs to inject product codes.
6. Keep auth UUID as the security principal; UniCard ID remains the public Mitra Labs identity handle.

### 6.3 Implementation gate

Do **not** invent interim public formats (for example JM/WM-prefixed IDs) “just for migration.”

Any minting implementation change must preserve this Option A lock.

---

## 7. Go / No-Go Summary

| Topic                                                    | Status                                                        |
| -------------------------------------------------------- | ------------------------------------------------------------- |
| Public UniCard format `ML-XXXX-ABC-XXXX`                 | **GO — LOCKED**                                               |
| No product codes inside public ID                        | **GO — LOCKED**                                               |
| `source_app` provenance in user DB schema                | **GO — LOCKED (schema direction)**                            |
| Plan client → server minting during backend DB migration | **GO — LOCKED (migration plan)**                              |
| Full Shared Mitra ID / Trust Profile product rollout     | **NO-GO for implementation now** (roadmap; see ecosystem doc) |

---

## 8. Change Control

Any future change to:

- public UniCard format
- product-code-in-ID proposals
- provenance field naming / meaning
- mint authority (client vs server)

requires:

1. Product Owner review
2. documented superseding lock
3. update to this file status and the ecosystem roadmap cross-reference
