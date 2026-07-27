// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerVaultOtpSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workVault\components\vaultView\EmployerVaultOtpSection.tsx

import { vaultAccentMix } from "../../../../shared/workVault/vaultPublic";
import { EmployerVaultOtpInput } from "../EmployerVaultOtpInput";

type Props = {
  employeeName: string;
  error: string;
  onSubmit: (code: string) => void | Promise<void>;
  onCancel: () => void;
};

export function EmployerVaultOtpSection({ employeeName, error, onSubmit, onCancel }: Props) {
  return (
    <section
      className="wm-ee-card"
      style={{
        marginTop: 16,
        padding: "24px 16px",
        borderRadius: "var(--wm-radius-chip)",
        border: `1px solid ${vaultAccentMix(10)}`,
        background: `${vaultAccentMix(2)}`,
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
