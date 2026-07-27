/** Inject Pulse LED into a single host-element child when possible. */

import {
  Children,
  cloneElement,
  isValidElement,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";

type PulseInjectableChildProps = {
  readonly children?: ReactNode;
  readonly style?: CSSProperties;
  readonly className?: string;
};

function isHostElementChild(value: ReactNode): value is ReactElement<PulseInjectableChildProps> {
  return isValidElement<PulseInjectableChildProps>(value) && typeof value.type === "string";
}

export function renderChildrenWithCardBoundPulse({
  children,
  edgeLight,
}: {
  readonly children: ReactNode;
  readonly edgeLight: ReactNode;
}): ReactNode {
  const childList = Children.toArray(children);

  if (childList.length !== 1 || !isHostElementChild(childList[0])) {
    return (
      <>
        {edgeLight}
        {children}
      </>
    );
  }

  const child = childList[0];
  const originalStyle = child.props.style;

  const nextStyle: CSSProperties = {
    ...originalStyle,
    position:
      !originalStyle?.position || originalStyle.position === "static"
        ? "relative"
        : originalStyle.position,
    overflow: originalStyle?.overflow ?? "hidden",
    isolation: "isolate",
  };

  return cloneElement(child, {
    style: nextStyle,
    className:
      [child.props.className, edgeLight ? "wm-pulse-glowSwapHost" : ""].filter(Boolean).join(" ") ||
      undefined,
    children: (
      <>
        {edgeLight}
        {child.props.children}
      </>
    ),
  });
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
