/** Job Mitra | BrandName.tsx — Canonical dual-tone brand names (Job Mitra / Mitra Labs) */

import { JobMitraBrandMark, MitraLabsBrandMark } from "./BrandMark";

export type BrandNameKind = "job-mitra" | "mitra-labs";
export type BrandNameSize = "sm" | "md" | "lg" | "xl";

type BrandNameProps = {
  readonly brand: BrandNameKind;
  readonly size?: BrandNameSize;
  readonly className?: string;
  readonly as?: "h1" | "span" | "div" | "p";
  readonly id?: string;
};

function sizeClass(size: BrandNameSize): string {
  return `wm-brandName--${size}`;
}

function mergeClass(size: BrandNameSize, className?: string): string {
  return [sizeClass(size), className].filter(Boolean).join(" ");
}

/** Unified brand renderer — JOB+MITRA or MITRA+LABS with locked tokens and typography */
export function BrandName({ brand, size = "md", className, as, id }: BrandNameProps) {
  const merged = mergeClass(size, className);

  if (brand === "job-mitra") {
    return <JobMitraBrandMark as={as ?? "span"} className={merged} id={id} />;
  }

  return <MitraLabsBrandMark as={as ?? "span"} className={merged} id={id} />;
}

type SingleBrandProps = Omit<BrandNameProps, "brand">;

export function JobMitraBrandName(props: SingleBrandProps) {
  return <BrandName brand="job-mitra" {...props} />;
}

export function MitraLabsBrandName(props: SingleBrandProps) {
  return <BrandName brand="mitra-labs" {...props} />;
}
