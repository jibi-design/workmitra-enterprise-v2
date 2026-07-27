// src/features/employee/workVault/components/VaultSectionHead.tsx

type Props = {
  number: number;
  title: string;
  auto?: boolean;
};

/** Quiet section label — L-V1 luxury (no SECTION N shout). */
export function VaultSectionHead({ number, title, auto }: Props) {
  const index = String(number).padStart(2, "0");

  return (
    <div className="wm-vault-section-label">
      <span className="wm-vault-section-label__index" aria-hidden="true">
        {index}
      </span>
      <span className="wm-vault-section-label__title">{title}</span>
      {auto ? <span className="wm-vault-section-label__auto">Auto</span> : null}
    </div>
  );
}
