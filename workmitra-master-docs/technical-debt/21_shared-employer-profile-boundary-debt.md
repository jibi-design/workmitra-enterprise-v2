# Shared Employer Profile Boundary Debt

## Status

Accepted temporary boundary debt.

---

## Current Issue

The following shared file still imports employer feature storage:

```text
src/shared/employerProfile/EmployerTrustBadge.tsx
```

Current dependency:

```text
src/shared/employerProfile/EmployerTrustBadge.tsx
imports:
src/features/employer/company/storage/employerSettings.storage.ts
```

---

## Why It Is Temporarily Accepted

`EmployerTrustBadge` currently falls back to `employerSettingsStorage` when `employerWmId` is not passed.

This fallback cannot be removed safely yet because employee-side Career and Shift post data does not consistently carry `employerWmId`.

Current evidence:

1. `CareerSearchPost` does not contain `employerWmId`.
2. `ShiftPostDemo` does not contain `employerWmId`.
3. `EmployeeCareerPostDetailsPage` passes only current post data.
4. `ShiftPostDetailsApplyPage` passes only company/post data.
5. No reliable `employerWmId` is available at all badge call sites.

---

## Why Direct Cleanup Is Unsafe

Removing the fallback now may cause employer trust badges to disappear or show incomplete trust data on employee-side Career and Shift screens.

Guessing the employer ID from company name, current logged-in employer profile, or localStorage side effects is not enterprise-grade and may create incorrect trust data.

---

## Correct Future Fix

This is not a component-only cleanup.

The correct fix requires a data model and sync upgrade:

1. Add `employerWmId` to employer Career post source data.
2. Add `employerWmId` to employer Shift post source data.
3. Ensure employee synced/search post data includes `employerWmId`.
4. Update `CareerSearchPost`.
5. Update `ShiftPostDemo`.
6. Update parsers and normalizers.
7. Pass `employerWmId` into `EmployerTrustBadge`.
8. Only then remove the `employerSettingsStorage` fallback from `EmployerTrustBadge`.

---

## Current Lock

Do not remove the fallback now.

Do not change badge behavior now.

Do not fix by guessing.

Do not inspect or move `employerPublicProfileService.ts` unless starting a separate service-boundary audit.

---

## Cleanup Phase Result

### Completed

- `shared/docAccess` reverse-import cleanup completed.
- `AntiFraudNotice` converted into pure shared UI using prop-based `jmId`.
- Shared doc-access constants/types extracted from WorkVault feature dependencies.
- Shared doc-access UI components cleaned from employee/workVault reverse imports.
- DocAccess feature-composition hook moved out of `shared` into employer careerJobs composition layer.

### Remaining Accepted Debt

```text
src/shared/employerProfile/EmployerTrustBadge.tsx
```

Fallback import remains temporarily accepted until employer identity becomes part of employee-visible post/search data models.

---

## Final Enterprise-Grade Decision

Pause `shared/employerProfile` cleanup here.

Do not continue boundary cleanup by guessing or injecting fake employer identity sources.

Next valid cleanup phase must begin with either:

1. Employer identity data-model/sync upgrade audit
   or
2. Separate `employerPublicProfileService.ts` service-boundary audit
