// App: Job Mitra / WorkMitra_Enterprise_v2
// File: JobMitraLandingLogo.tsx
// Path: C:\features\auth\components\JobMitraLandingLogo.tsx

type Props = {
  size?: "large" | "small";
};

export function JobMitraLandingLogo({ size }: Props) {
  const isLarge = size === "large";
  const iconSize = isLarge ? 32 : 24;
  const textSize = isLarge ? 26 : 18;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {/* Crisp, Sharp Enterprise Icon */}
      <svg width={iconSize} height={iconSize} viewBox="0 0 48 48" aria-hidden="true">
        <rect x="4" y="4" width="40" height="40" rx="10" fill="#0F172A" />
        <path
          d="M14 18L24 34L34 18"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="24" cy="18" r="4" fill="#3B82F6" />
      </svg>

      <div style={{ display: "flex", alignItems: "baseline", lineHeight: 1 }}>
        <span
          style={{
            fontSize: textSize,
            fontWeight: 800,
            color: "#0F172A",
            letterSpacing: "-0.04em",
          }}
        >
          Job
        </span>
        <span
          style={{
            fontSize: textSize,
            fontWeight: 800,
            color: "#2563EB",
            letterSpacing: "-0.04em",
          }}
        >
          Mitra
        </span>
      </div>
    </div>
  );
}
