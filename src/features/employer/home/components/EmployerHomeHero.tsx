/** EmployerHomeHero — executive command glass hero */

type EmployerHomeHeroProps = {
  readonly companyName: string;
};

export function EmployerHomeHero({ companyName }: EmployerHomeHeroProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const initial = companyName.trim().charAt(0).toUpperCase() || "P";

  return (
    <header className="wm-homeHero wm-homeCardEnter">
      <div className="wm-homeHero__orb wm-homeHero__orb--employer" aria-hidden="true" />
      <div className="wm-homeHero__content">
        <div className="wm-homeHero__status">
          <span className="wm-homeHero__statusDot" aria-hidden="true" />
          System Active
        </div>
        <h1 className="wm-homeHero__title wm-typeHero">
          {greeting}, {companyName}
        </h1>
        <p className="wm-homeHero__subtitle">Executive Command Center</p>
      </div>
      <div className="wm-homeHero__avatar" aria-hidden="true">
        {initial}
      </div>
    </header>
  );
}
