// App: Job Mitra / WorkMitra_Enterprise_v2
// File: LandingRoleHero.tsx — Job Mitra main title + Mitra Labs product tag

import { MitraLabsBrandName } from "../../../shared/components/brand/BrandName";
import { JobMitraLandingLogo } from "./JobMitraLandingLogo";

export function LandingRoleHero() {
  return (
    <div className="wm-auth-hero wm-auth-hero--erDna">
      <div className="wm-auth-hero__brand">
        {/* Main title = Job Mitra (brand hierarchy). Welcome stays secondary. */}
        <h1 className="wm-auth-hero__logo">
          <JobMitraLandingLogo size="large" />
        </h1>
        <p className="wm-auth-hero__productOf">
          A Product of <MitraLabsBrandName as="span" className="wm-auth-hero__labsMark" />
        </p>
      </div>

      <div className="wm-auth-hero__greeting">
        <p className="wm-auth-hero__title wm-auth-hero__title--erDna">Welcome</p>
        <p className="wm-auth-hero__sub wm-auth-hero__sub--erDna">
          Select your role to continue
        </p>
      </div>
    </div>
  );
}
