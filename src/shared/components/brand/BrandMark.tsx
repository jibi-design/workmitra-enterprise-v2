/** Job Mitra | BrandMark.tsx — Global dual-tone product / parent brand marks */

import type { ReactNode } from "react";

type BrandMarkProps = {
  readonly className?: string;
  readonly as?: "h1" | "span" | "div" | "p";
  readonly id?: string;
};

function BrandRoot({
  as: Tag = "span",
  className,
  children,
  ariaLabel,
  id,
}: BrandMarkProps & { readonly children: ReactNode; readonly ariaLabel: string }) {
  return (
    <Tag
      id={id}
      className={["wm-brandMark", className].filter(Boolean).join(" ")}
      aria-label={ariaLabel}
    >
      {children}
    </Tag>
  );
}

/** Product identity — JOB (emerald) + MITRA (slate/white) */
export function JobMitraBrandMark({ className, as = "h1", id }: BrandMarkProps) {
  return (
    <BrandRoot as={as} className={className} ariaLabel="Job Mitra" id={id}>
      <span className="wm-brandMark__job">Job</span>
      <span className="wm-brandMark__sep" aria-hidden="true">
        {"\u200B"}
      </span>
      <span className="wm-brandMark__mitra">Mitra</span>
    </BrandRoot>
  );
}

/** Parent brand — MITRA (slate/white) + LABS (electric cyan) */
export function MitraLabsBrandMark({ className, as = "span", id }: BrandMarkProps) {
  return (
    <BrandRoot
      as={as}
      className={`wm-brandMark--labs ${className ?? ""}`.trim()}
      ariaLabel="Mitra Labs"
      id={id}
    >
      <span className="wm-brandMark__mitra">Mitra</span>
      <span className="wm-brandMark__sep" aria-hidden="true">
        {"\u200B"}
      </span>
      <span className="wm-brandMark__labs">Labs</span>
    </BrandRoot>
  );
}
