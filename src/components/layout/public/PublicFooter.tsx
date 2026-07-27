/** Job Mitra | PublicFooter.tsx | Public website footer */

import { LandingFooterLinks } from "../../../features/auth/components/LandingFooterLinks";

const SUPPORT_EMAIL = "support@mitralabs.app";
const PRIVACY_POLICY_URL = "https://jibi-design.github.io/workmitra-privacy/";

export function PublicFooter() {
  return (
    <footer className="wm-public-footer">
      <LandingFooterLinks supportEmail={SUPPORT_EMAIL} privacyPolicyUrl={PRIVACY_POLICY_URL} />
      <p style={{ marginTop: 8 }}>© Mitra Labs</p>
    </footer>
  );
}
