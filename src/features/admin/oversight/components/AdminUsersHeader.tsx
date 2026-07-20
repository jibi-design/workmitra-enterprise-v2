// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AdminUsersHeader.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\admin\oversight\components\AdminUsersHeader.tsx

type Props = {
  employerCount: number;
  employeeCount: number;
};

export function AdminUsersHeader({ employerCount, employeeCount }: Props) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.6, color: "var(--wm-ad-navy)" }}
      >
        User Management
      </div>

      <div style={{ fontSize: 13, color: "var(--wm-ad-navy-400)", marginTop: 4 }}>
        {employerCount} employer{employerCount !== 1 ? "s" : ""}, {employeeCount} employee
        {employeeCount !== 1 ? "s" : ""} registered
      </div>
    </div>
  );
}
