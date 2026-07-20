// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerVaultOtpSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workVault\components\vaultView\EmployerVaultOtpSection.tsx

import { VAULT_ACCENT } from "../../../../employee/workVault/constants/vaultConstants";
import { EmployerVaultOtpInput } from "../EmployerVaultOtpInput";

type Props = {
  employeeName: string;
  error: string;
  onSubmit: (code: string) => void;
  onCancel: () => void;
};

export function EmployerVaultOtpSection({ employeeName, error, onSubmit, onCancel }: Props) {
  return (
    <section
      className="wm-ee-card"
      style={{
        marginTop: 16,
        padding: "24px 16px",
        borderRadius: 16,
        border: `1px solid ${VAULT_ACCENT}18`,
        background: `${VAULT_ACCENT}04`,
      }}
    >
      <EmployerVaultOtpInput
        employeeName={employeeName}
        onSubmit={onSubmit}
        onCancel={onCancel}
        error={error}
      />
    </section>
  );
}
