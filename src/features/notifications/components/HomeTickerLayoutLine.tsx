/** Job Mitra | HomeTickerLayoutLine.tsx | Badge — title | context ticker row */

import type { HomeTickerLayout } from "../helpers/homeTickerLayout";

type Props = {
  readonly layout: HomeTickerLayout;
};

export function HomeTickerLayoutLine({ layout }: Props) {
  return (
    <span className="wm-homeTickerLayout">
      <span className="wm-homeTickerLayout__badge">{layout.badge}</span>
      <span className="wm-homeTickerLayout__headline">{layout.headline}</span>
      {layout.context ? (
        <>
          <span className="wm-homeTickerLayout__sep" aria-hidden="true">
            |
          </span>
          <span className="wm-homeTickerLayout__context">{layout.context}</span>
        </>
      ) : null}
    </span>
  );
}
