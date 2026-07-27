// App name: Job Mitra | EmployerFavoritesHeader.tsx — DomainHero (Wave 3)

import { DomainHero } from "../../../../shared/components/layout/DomainHero";

type EmployerFavoritesHeaderProps = {
  totalFavorites: number;
};

export function EmployerFavoritesHeader({ totalFavorites }: EmployerFavoritesHeaderProps) {
  return (
    <DomainHero
      variant="shift"
      audience="employer"
      icon={<FavoritesHeroIcon />}
      title="My Favorites"
      subtitle="Workers you want to hire again"
      description="Hire-again ratings land here automatically. You can also add workers by Mitra Labs ID."
      trailing={<span className="wm-domainHeroBadge">{totalFavorites} saved</span>}
    />
  );
}

function FavoritesHeroIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27Z"
      />
    </svg>
  );
}
