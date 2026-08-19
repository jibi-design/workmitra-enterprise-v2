// App: Job Mitra / WorkMitra_Enterprise_v2
// File: LandingFooterLinks.tsx

import { MitraLabsBrandName } from "../../../shared/components/brand/BrandName";

type Props = {
  supportEmail: string;
  privacyPolicyUrl: string;
  termsUrl?: string;
  /** Compact brand footer for role-pick landing */
  variant?: "links" | "enterprise";
  accessHubUrl?: string;
};

export function LandingFooterLinks({
  supportEmail,
  privacyPolicyUrl,
  termsUrl = `${privacyPolicyUrl}#terms`,
  variant = "links",
  accessHubUrl = "https://mitraaccesshub.com",
}: Props) {
  if (variant === "enterprise") {
    return (
      <footer className="wm-auth-brand-footer wm-auth-brand-footer--compact" aria-label="Mitra Labs brand footer">
        <p className="wm-auth-brand-footer__line wm-auth-brand-footer__line--primary">
          <span className="wm-auth-brand-footer__copy">
            © 2026 <MitraLabsBrandName as="span" />
          </span>
          <span className="wm-auth-brand-footer__sep" aria-hidden="true">
            •
          </span>
          <span className="wm-auth-brand-footer__poweredBy">
            Product powered by{" "}
            <a
              href={accessHubUrl}
              target="_blank"
              rel="noreferrer"
              className="wm-auth-footer__accessHubLink"
            >
              Mitra Access Hub
            </a>
          </span>
        </p>
        <p className="wm-auth-brand-footer__line wm-auth-brand-footer__line--legal">
          <a
            href={privacyPolicyUrl}
            target="_blank"
            rel="noreferrer"
            className="wm-auth-footer-links__link"
          >
            Privacy
          </a>
          <span className="wm-auth-brand-footer__sep" aria-hidden="true">
            •
          </span>
          <a href={termsUrl} target="_blank" rel="noreferrer" className="wm-auth-footer-links__link">
            Terms
          </a>
        </p>
      </footer>
    );
  }

  return (
    <div className="wm-auth-footer-links">
      <a href={`mailto:${supportEmail}`} className="wm-auth-footer-links__link">
        Support
      </a>

      <span aria-hidden="true">&middot;</span>

      <a href={termsUrl} target="_blank" rel="noreferrer" className="wm-auth-footer-links__link">
        Terms
      </a>

      <span aria-hidden="true">&middot;</span>

      <a
        href={privacyPolicyUrl}
        target="_blank"
        rel="noreferrer"
        className="wm-auth-footer-links__link"
      >
        Privacy
      </a>
    </div>
  );
}
