/** PublicLandingDomainStrip — four product pillars */

const DOMAINS = [
  {
    key: "shift",
    title: "Shift Jobs",
    copy: "Browse and fill short-term local work.",
    tone: "shift",
  },
  {
    key: "career",
    title: "Career Jobs",
    copy: "Post and apply for longer-term roles.",
    tone: "career",
  },
  {
    key: "vault",
    title: "Work Vault",
    copy: "Keep work identity and records in one place.",
    tone: "vault",
  },
  {
    key: "planner",
    title: "Demand Planner",
    copy: "Plan upcoming staffing needs ahead of time.",
    tone: "planner",
  },
] as const;

export function PublicLandingDomainStrip() {
  return (
    <section className="wm-publicLanding__section" aria-labelledby="public-domains-title">
      <p className="wm-publicLanding__eyebrow">Product</p>
      <h2 className="wm-publicLanding__sectionTitle" id="public-domains-title">
        Built around real work domains
      </h2>
      <p className="wm-publicLanding__sectionLead">
        Shift, Career, Vault, and Planner stay separate so each flow stays clear.
      </p>
      <div className="wm-publicLanding__domains">
        {DOMAINS.map((domain) => (
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
