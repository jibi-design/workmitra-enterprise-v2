// src/shared/components/RatingPendingBadge.tsx
//
// "Not yet rated" warning badge — reusable across Shift + Workforce.

type Props = {
  accentColor?: string;
};

export function RatingPendingBadge({ accentColor = "#d97706" }: Props) {
  return (
    <span
      style={{
        fontSize: 9,
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: 999,
        background: `${accentColor}12`,
        border: `1px solid ${accentColor}30`,
        color: accentColor,
        whiteSpace: "nowrap",
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
      }}
    >
      <span style={{ fontSize: 10, lineHeight: 1 }}>&#9888;</span>
      Not rated
    </span>
  );
}