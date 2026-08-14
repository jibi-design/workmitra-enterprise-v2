/** Job Mitra | ActivePriorityBand.tsx | Elevated priority slot (call / join / welcome / nudge) */

import { Children, type ReactNode } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";

type Props = {
  children: ReactNode;
};

/**
 * Isolated Framer layout slot for action-elevated home items.
 * Pulse wrappers stay on children (PulseNode / PulseTarget) — no full-card blink here.
 */
export function ActivePriorityBand({ children }: Props) {
  const items = Children.toArray(children).filter(Boolean);

  if (items.length === 0) {
    return null;
  }

  return (
    <LayoutGroup id="employee-home-active-band">
      <motion.section
        layout
        className="wm-homeActiveBand"
        data-testid="employee-home-active-band"
        aria-label="Priority actions"
      >
        <AnimatePresence initial={false} mode="popLayout">
          {items.map((child, index) => (
            <motion.div
              key={
                typeof child === "object" && child !== null && "key" in child && child.key != null
                  ? String(child.key)
                  : `active-band-${index}`
              }
              layout
              className="wm-homeActiveBand__item"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {child}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.section>
    </LayoutGroup>
  );
}
