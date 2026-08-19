// App: Job Mitra / WorkMitra_Enterprise_v2
// File: JobMitraLandingLogo.tsx
// Global Brand Rules: JOB emerald (#059669) + MITRA slate/white

import { JobMitraBrandName } from "../../../shared/components/brand/BrandName";

type Props = {
  size?: "large" | "small";
};

export function JobMitraLandingLogo({ size }: Props) {
  const isLarge = size === "large";
  const iconSize = isLarge ? 40 : 24;

  return (
    <div
      className={
        isLarge
          ? "wm-auth-hero__logoMark wm-auth-hero__logoMark--large"
          : "wm-auth-hero__logoMark wm-auth-hero__logoMark--small"
      }
    >
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
        <circle cx="24" cy="18" r="4" fill="#059669" />
      </svg>

      <JobMitraBrandName as="span" className="wm-auth-hero__jobMitraMark" />
    </div>
  );
}
