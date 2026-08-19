/** Job Mitra | PublicFooter.tsx | Public website footer */

import { LandingFooterLinks } from "../../../features/auth/components/LandingFooterLinks";
import { MitraLabsBrandName } from "../../../shared/components/brand/BrandName";

const SUPPORT_EMAIL = "support@mitraaccesshub.com";
const PRIVACY_POLICY_URL = "https://jibi-design.github.io/workmitra-privacy/";

export function PublicFooter() {
  return (
    <footer className="wm-public-footer">
      <LandingFooterLinks supportEmail={SUPPORT_EMAIL} privacyPolicyUrl={PRIVACY_POLICY_URL} />
      <p style={{ marginTop: 8 }}>
        © <MitraLabsBrandName as="span" />
      </p>
    </footer>
  );
}
