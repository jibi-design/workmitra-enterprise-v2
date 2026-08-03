/** HomePageSkeleton — CLS-safe reserved layout while home chrome mounts */

type HomePageSkeletonProps = {
  readonly audience?: "employee" | "employer";
};

export function HomePageSkeleton({ audience = "employee" }: HomePageSkeletonProps) {
  const cardClass =
    audience === "employer"
      ? "wm-homeSkeleton__card wm-homeSkeleton__card--employer"
      : "wm-homeSkeleton__card";

  return (
    <div
      className="wm-homeSkeleton"
      aria-hidden="true"
      data-testid="home-page-skeleton"
      data-audience={audience}
    >
      <div className="wm-homeSkeleton__hero wm-skeleton" />
      <div className="wm-homeSkeleton__tiles">
        <div className="wm-homeSkeleton__tile wm-skeleton" />
        <div className="wm-homeSkeleton__tile wm-skeleton" />
      </div>
      <div className={`${cardClass} wm-skeleton`} />
      <div className={`${cardClass} wm-skeleton`} />
      <div className={`${cardClass} wm-skeleton`} />
    </div>
  );
}
