/**
 * Job Mitra | ContactVerifiedBadge.tsx
 * Clean verified chip — shown instead of OTP actions.
 */

type Props = {
  channel: "phone" | "email";
  hint?: string;
  testId?: string;
};

export function ContactVerifiedBadge({ channel, hint, testId }: Props) {
  const label = channel === "phone" ? "Phone Verified ✓" : "Email Verified ✓";
  return (
    <div
      data-testid={testId ?? `contact-verified-${channel}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        borderRadius: 12,
        border: "1px solid rgba(22,163,74,0.28)",
        background: "rgba(22,163,74,0.08)",
        color: "#15803d",
        fontSize: 12,
        fontWeight: 800,
        lineHeight: 1.35,
      }}
      role="status"
    >
      <span>{label}</span>
      {hint ? (
        <span style={{ fontWeight: 650, color: "var(--wm-er-muted, #64748b)" }}>{hint}</span>
      ) : null}
    </div>
  );
}
