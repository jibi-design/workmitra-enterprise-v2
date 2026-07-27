// App name: Job Mitra
// File name: CareerPostExpiredBanner.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\components\CareerPostExpiredBanner.tsx

export function CareerPostExpiredBanner() {
  return (
    <div
      style={{
        margin: "0 4px",
        padding: "16px",
        border: "1px solid rgba(220,38,38,0.25)",
        background: "linear-gradient(135deg, rgba(254,242,242,0.95), rgba(255,255,255,0.9))",
        borderRadius: "var(--wm-radius-employee-card)",
        boxShadow: "0 8px 20px rgba(220,38,38,0.03)",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 900, color: "#dc2626" }}>Applications closed</div>
      <div
        style={{
          marginTop: 4,
          fontSize: 13,
          color: "#991b1b",
          lineHeight: 1.5,
          fontWeight: 600,
        }}
      >
        This career post has passed its closing date. New applications are no longer available.
      </div>
    </div>
  );
}
