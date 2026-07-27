// App: Job Mitra / WorkMitra_Enterprise_v2
// File: VaultSensitiveUploadDisclaimer.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\components\VaultSensitiveUploadDisclaimer.tsx

import { VAULT_SENSITIVE_UPLOAD_NOTICE } from "../constants/vaultConstants";

type Props = {
  /** Optional tighter spacing when nested inside dense forms. */
  compact?: boolean;
};

/** Bold notice shown on every document upload surface (Global Docs D2). */
export function VaultSensitiveUploadDisclaimer({ compact = false }: Props) {
  return (
    <div
      className="wm-vault-sensitive-notice"
      role="note"
      style={{ marginBottom: compact ? 10 : 12 }}
    >
      <strong>Notice:</strong> {VAULT_SENSITIVE_UPLOAD_NOTICE}
    </div>
  );
}
