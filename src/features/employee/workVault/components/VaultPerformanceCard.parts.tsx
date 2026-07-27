import { useState } from "react";
import { VAULT_ACCENT, vaultAccentMix } from "../constants/vaultConstants";
import { getTips, MIN_REVIEWS_FOR_VISIBLE_SCORE } from "./VaultPerformanceCard.helpers";

export function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const isEarly = total < MIN_REVIEWS_FOR_VISIBLE_SCORE;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "var(--wm-emp-muted)",
          width: 12,
          textAlign: "right",
        }}
      >
        {star}
      </span>

      <div
        style={{
          flex: 1,
          height: 5,
          borderRadius: "var(--wm-radius-pill)",
          background: "rgba(15, 23, 42, 0.06)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: "var(--wm-radius-pill)",
            background: "#f59e0b",
            opacity: isEarly ? 0.5 : 1,
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}

export function MetricBox({
  value,
  label,
  color,
  isEmpty,
}: {
  value: string;
  label: string;
  color: string;
  isEmpty?: boolean;
}) {
  return (
    <div style={{ textAlign: "center", flex: 1 }}>
      <div
        style={{
          fontSize: isEmpty ? 12 : 16,
          fontWeight: 900,
          color: isEmpty ? "var(--wm-emp-muted)" : color,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--wm-emp-muted)", marginTop: 1 }}>
        {label}
      </div>
    </div>
  );
}

export function TipsSection({
  rating,
  totalReviews,
}: {
  rating: number | null;
  totalReviews: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const { primary, secondary } = getTips(rating, totalReviews);

  return (
    <div
      style={{
        marginTop: 12,
        borderRadius: "var(--wm-radius-10)",
        border: `1px solid ${vaultAccentMix(10)}`,
        background: `${vaultAccentMix(3)}`,
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        style={{
          width: "100%",
          padding: "10px 14px",
          border: 0,
          background: "transparent",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 900, color: VAULT_ACCENT }}>
          Tips to improve your work reputation
        </span>
        <span style={{ fontSize: 11, color: VAULT_ACCENT, fontWeight: 900 }}>
          {expanded ? "Hide" : "Show"}
        </span>
      </button>

      {expanded && (
        <div style={{ padding: "0 14px 12px" }}>
          <div style={{ display: "grid", gap: 6 }}>
            {primary.map((tip, index) => (
              <div
                key={`primary-${index}`}
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--wm-emp-text)",
                  lineHeight: 1.5,
                }}
              >
                {tip}
              </div>
            ))}
          </div>

          {secondary.length > 0 && (
            <div
              style={{
                display: "grid",
                gap: 5,
                marginTop: 8,
                paddingTop: 8,
                borderTop: `1px solid ${vaultAccentMix(7)}`,
              }}
            >
              {secondary.map((tip, index) => (
                <div
                  key={`secondary-${index}`}
                  style={{ fontSize: 11, color: "var(--wm-emp-muted)", lineHeight: 1.5 }}
                >
                  {tip}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
