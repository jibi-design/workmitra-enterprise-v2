/** EmployeeHomeWelcomeCard — soft glass welcome callout */

type Props = {
  userDisplayName: string;
  welcomeFading: boolean;
};

export function EmployeeHomeWelcomeCard({ userDisplayName, welcomeFading }: Props) {
  return (
    <div
      className="wm-homeCardEnter"
      style={{
        padding: "16px",
        borderRadius: "var(--wm-radius-employee-card, 20px)",
        border: "1px solid var(--wm-success-border, #86efac)",
        background:
          "color-mix(in srgb, var(--wm-success-wash, #f0fdf4) 70%, var(--wm-emp-glass-bg-strong, #fff))",
        boxShadow: "var(--wm-emp-surface-shadow, 0 8px 20px rgba(15, 23, 42, 0.05))",
        textAlign: "center",
        opacity: welcomeFading ? 0 : 1,
        transition: "opacity 0.5s var(--wm-motion-spring, ease-out)",
      }}
      role="status"
    >
      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "var(--wm-success-dark, #15803d)",
        }}
      >
        {userDisplayName ? `Welcome, ${userDisplayName}!` : "Welcome!"}
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 13,
          lineHeight: 1.5,
          color: "var(--wm-text-muted, #6b7280)",
        }}
      >
        Find work, keep track of what's next, and stay organised.
      </div>
    </div>
  );
}
