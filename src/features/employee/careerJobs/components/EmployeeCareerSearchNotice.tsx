// App name: Job Mitra
// File name: EmployeeCareerSearchNotice.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\components\EmployeeCareerSearchNotice.tsx

type EmployeeCareerSearchNoticeProps = {
  notice: string;
};

export function EmployeeCareerSearchNotice({ notice }: EmployeeCareerSearchNoticeProps) {
  if (!notice) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        padding: "10px 20px",
        borderRadius: 10,
        background: "var(--wm-er-accent-career)",
        color: "#fff",
        fontSize: 13,
        fontWeight: 700,
        zIndex: 100,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >
      {notice}
    </div>
  );
}
