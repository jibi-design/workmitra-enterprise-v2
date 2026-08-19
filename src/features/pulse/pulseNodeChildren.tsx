/** Inject hardware LED as PulseNode sibling — top-right inner corner, never the gutter. */

import { type ReactNode } from "react";

export function renderChildrenWithCardBoundPulse({
  children,
  edgeLight,
}: {
  readonly children: ReactNode;
  readonly edgeLight: ReactNode;
}): ReactNode {
  // Sibling after the card so overflow:hidden children cannot clip the LED.
  return (
    <>
      {children}
      {edgeLight}
    </>
  );
}

export function shouldScrollPulseNodeIntoView(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  const safeVerticalInset = 96;
  const safeHorizontalInset = 16;

  return (
    rect.top < safeVerticalInset ||
    rect.bottom > viewportHeight - safeVerticalInset ||
    rect.left < safeHorizontalInset ||
    rect.right > viewportWidth - safeHorizontalInset
  );
}

export function scrollPulseNodeIntoView(element: HTMLElement): void {
  if (!shouldScrollPulseNodeIntoView(element)) return;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  element.scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "center",
    inline: "nearest",
  });
}
