/** Job Mitra | EnterpriseResponsiveGrid.tsx | Touch-friendly auto-fill grid */

import type { CSSProperties, ReactNode } from "react";

export type EnterpriseResponsiveGridProps = {
  children: ReactNode;
  minItemWidth?: number;
  gap?: number;
  collapseMobile?: boolean;
  collapseTablet?: boolean;
  className?: string;
  testId?: string;
};

export function EnterpriseResponsiveGrid({
  children,
  minItemWidth = 148,
  gap = 12,
  collapseMobile = false,
  collapseTablet = false,
  className,
  testId,
}: EnterpriseResponsiveGridProps) {
  const style = {
    "--wm-ent-grid-min": `${minItemWidth}px`,
    "--wm-ent-grid-gap": `${gap}px`,
  } as CSSProperties;

  const classes = [
    "wm-ent-grid",
    "wm-stable-row",
    collapseMobile ? "wm-ent-grid--collapseMobile" : "",
    collapseTablet ? "wm-ent-grid--collapseTablet" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} style={style} data-testid={testId ?? "wm-ent-grid"}>
      {children}
    </div>
  );
}
