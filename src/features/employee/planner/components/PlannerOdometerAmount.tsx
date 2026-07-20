// Job Mitra | PlannerOdometerAmount.tsx | Rolling odometer earnings display

import { useEffect, useMemo, useRef } from "react";

type Props = {
  amount: number;
  className?: string;
};

export function PlannerOdometerAmount({ amount, className = "" }: Props) {
  const safeAmount = Math.max(0, Math.round(amount));
  const formatted = useMemo(() => safeAmount.toLocaleString("en-IN"), [safeAmount]);
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const prevAmountRef = useRef(safeAmount);

  useEffect(() => {
    if (prevAmountRef.current === safeAmount) return;
    prevAmountRef.current = safeAmount;

    const node = rootRef.current;
    if (!node) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    node.classList.remove("wm-planner-odometer--bump");
    // Force reflow so repeated bumps replay when amount changes quickly.
    void node.offsetWidth;
    node.classList.add("wm-planner-odometer--bump");

    const timeoutId = window.setTimeout(() => {
      node.classList.remove("wm-planner-odometer--bump");
    }, 320);

    return () => window.clearTimeout(timeoutId);
  }, [safeAmount]);

  return (
    <span
      ref={rootRef}
      className={`wm-planner-odometer ${className}`.trim()}
      aria-live="polite"
      aria-label={`Estimated earnings ${formatted}`}
    >
      {formatted}
    </span>
  );
}
