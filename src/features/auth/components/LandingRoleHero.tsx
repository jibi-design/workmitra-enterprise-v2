// App: Job Mitra / WorkMitra_Enterprise_v2
// File: LandingRoleHero.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\auth\components\LandingRoleHero.tsx

import { JobMitraLandingLogo } from "./JobMitraLandingLogo";

export function LandingRoleHero() {
  return (
    <div className="wm-auth-hero">
      <div className="wm-auth-hero__logo">
        <JobMitraLandingLogo size="large" />
      </div>

      <h1 className="wm-auth-hero__title">Sign in to your workspace</h1>

      <p className="wm-auth-hero__sub">Select the role that matches your account type.</p>
    </div>
  );
}
