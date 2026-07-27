/** HomeSectionPanel — shared home section chrome */

import type { ReactNode } from "react";

type HomeSectionPanelProps = {
  readonly eyebrow: string;
  readonly title: string;
  readonly children: ReactNode;
  readonly well?: boolean;
  readonly className?: string;
};

export function HomeSectionPanel({
  eyebrow,
  title,
  children,
  well = false,
  className,
}: HomeSectionPanelProps) {
  return (
    <section
      className={["wm-homeSectionPanel", well ? "wm-homeSectionPanel--well" : "", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="wm-homeSectionPanel__head">
        <div className="wm-homeSectionPanel__eyebrow">{eyebrow}</div>
        <div className="wm-homeSectionPanel__title">{title}</div>
      </div>
      <div className="wm-homeSectionPanel__body">{children}</div>
    </section>
  );
}
