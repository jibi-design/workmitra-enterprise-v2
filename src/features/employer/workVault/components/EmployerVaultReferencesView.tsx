// src/features/employer/workVault/components/EmployerVaultReferencesView.tsx

import type { VaultReference } from "../../../employee/workVault/types/vaultProfileTypes";

type Props = {
  refs: VaultReference[];
};

export function EmployerVaultReferencesView({ refs }: Props) {
  if (refs.length === 0) {
    return (
      <div style={{ fontSize: 12, color: "var(--wm-er-muted)", fontStyle: "italic" }}>
        No employer reviews yet.
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 6 }}>
      {refs.map((ref, i) => {
        const barColor =
          ref.rating >= 4 ? "#16a34a" : ref.rating >= 2 ? "#f59e0b" : "#94a3b8";
        const pct = Math.round((ref.rating / 5) * 100);

        return (
          <div
            key={`${ref.companyName}-${ref.source}-${i}`}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid var(--wm-er-divider, rgba(15, 23, 42, 0.08))",
              background: "var(--wm-er-bg, #fff)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--wm-er-text)",
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {ref.companyName}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 900, color: barColor }}>
                  {ref.rating.toFixed(1)}
                </span>
                {ref.rating >= 4 && (
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 900,
                      padding: "1px 6px",
                      borderRadius: 999,
                      background: "rgba(22, 163, 74, 0.08)",
                      color: "#15803d",
                      border: "1px solid rgba(22, 163, 74, 0.18)",
                    }}
                  >
                    Reference
                  </span>
                )}
              </div>
            </div>

            <div
              style={{
                marginTop: 6,
                height: 4,
                borderRadius: 999,
                background: "rgba(15, 23, 42, 0.06)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  borderRadius: 999,
                  background: barColor,
                  transition: "width 0.3s ease",
                }}
              />
            </div>

            <div
              style={{
                fontSize: 10,
                color: "var(--wm-er-muted)",
                marginTop: 4,
                textTransform: "capitalize",
              }}
            >
              Source: {ref.source}
            </div>
          </div>
        );
      })}
    </div>
  );
}