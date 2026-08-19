/** PublicLandingDomainStrip — Day-1 product pillars from DOMAIN_REGISTRY */

import { DOMAIN_REGISTRY } from "../../../shared/config/domainRegistry";
import { MitraLabsBrandName } from "../../../shared/components/brand/BrandName";

export function PublicLandingDomainStrip() {
  return (
    <section className="wm-publicLanding__section" aria-labelledby="public-domains-title">
      <p className="wm-publicLanding__eyebrow">Product</p>
      <h2 className="wm-publicLanding__sectionTitle" id="public-domains-title">
        Built around real work domains
      </h2>
      <p className="wm-publicLanding__sectionLead">
        Shift, Career, Vault, Planner, and <MitraLabsBrandName size="sm" /> stay separate so each
        flow stays clear.
      </p>
      <div className="wm-publicLanding__domains">
        {DOMAIN_REGISTRY.map((domain) => (
          <article
            key={domain.key}
            className={`wm-publicLanding__domain wm-publicLanding__domain--${domain.tone}`}
          >
            <h3 className="wm-publicLanding__domainTitle">{domain.title}</h3>
            <p className="wm-publicLanding__domainCopy">{domain.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
