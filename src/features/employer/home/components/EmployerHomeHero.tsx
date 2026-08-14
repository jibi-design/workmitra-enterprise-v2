/** Job Mitra | EmployerHomeHero.tsx | Ultra-compact greeting strip (Employee-style) */

type EmployerHomeHeroProps = {
  readonly companyName: string;
};

export function EmployerHomeHero({ companyName }: EmployerHomeHeroProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const displayName = companyName.trim() || "Partner";
  const initial = displayName.charAt(0).toUpperCase() || "P";

  return (
    <header
      className="wm-homeCompactHeader wm-homeCompactHeader--employer"
      data-testid="employer-home-compact-header"
      aria-label="Home greeting"
    >
      <div className="wm-homeCompactHeader__copy">
        <p className="wm-homeCompactHeader__greeting">
          {greeting}, <span className="wm-homeCompactHeader__name">{displayName}</span>
        </p>
        <span className="wm-homeCompactHeader__pill">System Active</span>
      </div>
      <div className="wm-homeCompactHeader__avatar" aria-hidden="true">
        {initial}
      </div>
    </header>
  );
}
