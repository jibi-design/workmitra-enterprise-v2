// src/features/employee/workVault/components/vaultHomeIcons.tsx

import { VAULT_ACCENT } from "../constants/vaultConstants";

export function IconShield() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill={VAULT_ACCENT}
        d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4Zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8Z"
      />
    </svg>
  );
}

export function IconPlus() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2Z" />
    </svg>
  );
}