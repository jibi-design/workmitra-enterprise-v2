// App: Job Mitra / WorkMitra_Enterprise_v2
// File: VaultStorageMeter.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\components\VaultStorageMeter.tsx

import {
  MAX_DOCUMENT_SIZE_MB,
  MAX_VAULT_STORAGE_BYTES,
  MAX_VAULT_STORAGE_MB,
} from "../constants/vaultConstants";
import { StatusBadge } from "../../../../shared/components/enterprise/StatusBadge";

type Props = {
  usedBytes: number;
};

function formatMb(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(bytes >= 1024 * 1024 ? 1 : 2);
}

export function VaultStorageMeter({ usedBytes }: Props) {
  const safeUsed = Math.max(0, usedBytes);
  const pct = Math.min(100, Math.round((safeUsed / MAX_VAULT_STORAGE_BYTES) * 100));
  const remaining = Math.max(0, MAX_VAULT_STORAGE_BYTES - safeUsed);
  const tone = pct >= 90 ? "critical" : pct >= 70 ? "warning" : "active";

  return (
    <div className="wm-vault-storage-meter" data-testid="vault-storage-meter">
      <div className="wm-vault-storage-meter__head">
        <div>
          <div className="wm-vault-storage-meter__title">Vault storage</div>
          <div className="wm-vault-storage-meter__sub">
            {formatMb(safeUsed)} MB of {MAX_VAULT_STORAGE_MB} MB · {formatMb(remaining)} MB free
          </div>
        </div>
        <StatusBadge label={`${pct}% used`} tone={tone} />
      </div>

      <div
        className="wm-vault-storage-meter__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label="Vault storage used"
      >
        <div
          className={`wm-vault-storage-meter__fill wm-vault-storage-meter__fill--${tone}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="wm-vault-storage-meter__hint">
        Max {MAX_DOCUMENT_SIZE_MB} MB per file · JPEG, PNG, WebP, PDF
      </div>
    </div>
  );
}
