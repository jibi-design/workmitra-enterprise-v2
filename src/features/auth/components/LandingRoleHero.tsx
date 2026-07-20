// App: Job Mitra / WorkMitra_Enterprise_v2
// File: LandingRoleHero.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\auth\components\LandingRoleHero.tsx

import { JobMitraLandingLogo } from "./JobMitraLandingLogo";

export function LandingRoleHero() {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", marginBottom: 32 }}>
      <JobMitraLandingLogo size="large" />

      <h1
        style={{
          marginTop: 24,
          fontSize: 22 /* Professional size */,
          fontWeight: 700,
          color: "#0F172A",
          lineHeight: 1.2,
          letterSpacing: "-0.03em",
        }}
      >
        Sign in to your workspace
      </h1>

      <p
        style={{
          marginTop: 6,
          fontSize: 14,
          fontWeight: 400,
          color: "#64748B",
          lineHeight: 1.5,
        }}
      >
        Select the role that matches your account type.
      </p>
    </div>
  );
}
