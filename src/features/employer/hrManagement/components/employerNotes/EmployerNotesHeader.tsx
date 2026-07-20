// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerNotesHeader.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\employerNotes\EmployerNotesHeader.tsx

export function EmployerNotesHeader() {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontWeight: 900, fontSize: 15, color: "var(--wm-er-text)" }}>
        Employer Notes
      </div>

      <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
        Private notes — only you can see these
      </div>
    </div>
  );
}
