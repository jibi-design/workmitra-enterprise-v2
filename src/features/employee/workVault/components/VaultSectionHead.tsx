// src/features/employee/workVault/components/VaultSectionHead.tsx

type Props = {
  number: number;
  title: string;
  auto?: boolean;
};

export function VaultSectionHead({ number, title, auto }: Props) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 900,
        color: "var(--wm-emp-muted)",
        letterSpacing: 0.5,
        marginBottom: 6,
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <span>
        SECTION {number} — {title.toUpperCase()}
      </span>
      {auto && (
        <span
          style={{
            fontSize: 9,
            fontWeight: 800,
            padding: "1px 6px",
            borderRadius: 999,
            background: "rgba(22, 163, 74, 0.08)",
            color: "#15803d",
            border: "1px solid rgba(22, 163, 74, 0.18)",
          }}
        >
          AUTO
        </span>
      )}
    </div>
  );
}