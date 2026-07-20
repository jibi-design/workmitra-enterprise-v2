// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeHomeWelcomeCard.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\home\components\EmployeeHomeWelcomeCard.tsx

type Props = {
  userDisplayName: string;
  welcomeFading: boolean;
};

export function EmployeeHomeWelcomeCard({ userDisplayName, welcomeFading }: Props) {
  return (
    <div
      className="wm-ee-welcomeCard"
      style={{
        marginTop: 12,
        borderRadius: 12,
        padding: 16,
        textAlign: "center",
        background: "var(--wm-success-wash, #f0fdf4)",
        border: "1px solid var(--wm-success-border, #86efac)",
        opacity: welcomeFading ? 0 : 1,
        transition: "opacity 0.5s ease-out",
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--wm-success-dark, #15803d)" }}>
        {userDisplayName ? `Welcome, ${userDisplayName}!` : "Welcome!"}
      </div>

      <div
        style={{
          marginTop: 6,
          fontSize: 13,
          color: "var(--wm-text-muted, #6b7280)",
          lineHeight: 1.5,
        }}
      >
        Your complete work companion is here. Find jobs, track your work, and stay organized.
      </div>
    </div>
  );
}
