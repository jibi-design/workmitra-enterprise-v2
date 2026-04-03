// src/features/employer/workVault/components/EmployerVaultSectionHead.tsx

type Props = {
  number: number;
  title: string;
};

export function EmployerVaultSectionHead({ number, title }: Props) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 900,
        color: "var(--wm-er-muted)",
        letterSpacing: 0.5,
        marginBottom: 6,
      }}
    >
      SECTION {number} — {title.toUpperCase()}
    </div>
  );
}