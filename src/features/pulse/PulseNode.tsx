/** Job Mitra | PulseNode.tsx | src/features/pulse/PulseNode.tsx */

import {
  Children,
  cloneElement,
  isValidElement,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  useEffect,
  useRef,
} from "react";
import { triggerLightHaptic } from "../../shared/platform/haptics";
import { usePulseStore, type PulseChainSeverity, type PulseNodeId } from "./pulseStore";

type PulseCssVariableValue = string | number;
type PulseEdgeMode = "full" | "floating";
type PulseNodeVariant = "card" | "button";

type PulseNodeStyle = CSSProperties & {
  readonly "--wm-pulse-node-radius"?: PulseCssVariableValue;
};

type PulseNodeProps = {
  readonly id?: PulseNodeId;
  readonly pulseId?: PulseNodeId;
  readonly children: ReactNode;
  readonly className?: string;
  readonly style?: PulseNodeStyle;
  readonly disabled?: boolean;
  readonly onActivate?: () => void;
  readonly edgeMode?: PulseEdgeMode;
  readonly variant?: PulseNodeVariant;
  /** Show green glow — guide user to this element (e.g. first-login next step) */
  readonly isGuiding?: boolean;
  /** Show orange glow — pending action or alert (e.g. unread message) */
  readonly isAlert?: boolean;
  /** Show blue glow — element is currently selected/active (e.g. active tab) */
  readonly isActive?: boolean;
};

type PulseInjectableChildProps = {
  readonly children?: ReactNode;
  readonly style?: CSSProperties;
  readonly className?: string;
};

type PulseEdgeTone = {
  readonly background: string;
  /** Card left-edge LED: 3px bar with neon bloom */
  readonly shadow: string;
  readonly focusRing: string;
};

const SHIFT_EDGE_TONE: PulseEdgeTone = {
  background: "#10b981",
  shadow: "0 0 8px 2px rgba(16,185,129,0.9), 0 0 22px 6px rgba(16,185,129,0.45)",
  focusRing: "focus-visible:ring-emerald-500/35",
};

const CAREER_EDGE_TONE: PulseEdgeTone = {
  background: "#3b82f6",
  shadow: "0 0 8px 2px rgba(59,130,246,0.9), 0 0 22px 6px rgba(59,130,246,0.45)",
  focusRing: "focus-visible:ring-blue-500/35",
};

const WARNING_EDGE_TONE: PulseEdgeTone = {
  background: "#f59e0b",
  shadow: "0 0 8px 2px rgba(245,158,11,0.9), 0 0 22px 6px rgba(245,158,11,0.45)",
  focusRing: "focus-visible:ring-amber-500/35",
};

const URGENT_EDGE_TONE: PulseEdgeTone = {
  background: "#ef4444",
  shadow: "0 0 8px 2px rgba(239,68,68,0.9), 0 0 22px 6px rgba(239,68,68,0.45)",
  focusRing: "focus-visible:ring-red-500/35",
};

const PREMIUM_EDGE_TONE: PulseEdgeTone = {
  background: "#8b5cf6",
  shadow: "0 0 8px 2px rgba(139,92,246,0.9), 0 0 22px 6px rgba(139,92,246,0.45)",
  focusRing: "focus-visible:ring-violet-500/35",
};

const PLANNER_EDGE_TONE: PulseEdgeTone = {
  background: "#0891b2",
  shadow: "0 0 8px 2px rgba(8,145,178,0.95), 0 0 22px 6px rgba(8,145,178,0.45)",
  focusRing: "focus-visible:ring-cyan-500/35",
};

function getEdgeTone(nodeId: PulseNodeId, severity: PulseChainSeverity): PulseEdgeTone {
  const normalizedNodeId = nodeId.toLowerCase();

  if (normalizedNodeId.includes("planner") || normalizedNodeId.includes("gig-project")) {
    return PLANNER_EDGE_TONE;
  }

  if (normalizedNodeId.includes("shift")) return SHIFT_EDGE_TONE;

  if (
    normalizedNodeId.includes("career") ||
    normalizedNodeId.includes("interview") ||
    normalizedNodeId.includes("offer")
  ) {
    return CAREER_EDGE_TONE;
  }

  if (normalizedNodeId.includes("premium") || normalizedNodeId.includes("ai")) {
    return PREMIUM_EDGE_TONE;
  }

  if (severity === "urgent") return URGENT_EDGE_TONE;
  if (severity === "warning") return WARNING_EDGE_TONE;

  return SHIFT_EDGE_TONE;
}

/* 3 px core line + layered neon bloom — thin and premium */
function getEdgeLightStyleFromTone({
  tone,
  edgeMode,
}: {
  readonly tone: PulseEdgeTone;
  readonly edgeMode: PulseEdgeMode;
}): CSSProperties {
  if (edgeMode === "floating") {
    return {
      position: "absolute",
      left: 0,
      top: "50%",
      width: 4,
      height: "50%",
      transform: "translateY(-50%)",
      borderTopRightRadius: 6,
      borderBottomRightRadius: 6,
      background: tone.background,
      boxShadow: tone.shadow,
      zIndex: 30,
      pointerEvents: "none",
    };
  }

  return {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 4,
    borderTopLeftRadius: "inherit",
    borderBottomLeftRadius: "inherit",
    background: tone.background,
    boxShadow: tone.shadow,
    zIndex: 30,
    pointerEvents: "none",
  };
}

function PulseEdgeLight({
  tone,
  edgeMode,
}: {
  readonly tone: PulseEdgeTone;
  readonly edgeMode: PulseEdgeMode;
}) {
  return (
    <span
      aria-hidden="true"
      className="wm-breathe"
      data-pulse-edge-mode={edgeMode}
      style={getEdgeLightStyleFromTone({ tone, edgeMode })}
    />
  );
}

function PulseButtonHalo({ tone }: { readonly tone: PulseEdgeTone }) {
  return (
    <span
      aria-hidden="true"
      className="wm-breathe"
      style={{
        position: "absolute",
        top: -3,
        right: -3,
        bottom: -3,
        left: -3,
        borderRadius: "inherit",
        /* border only — zero box-shadow, zero ambient light, zero card bleed */
        border: `2.5px solid ${tone.background}`,
        pointerEvents: "none",
        zIndex: 30,
      }}
    />
  );
}

function isHostElementChild(value: ReactNode): value is ReactElement<PulseInjectableChildProps> {
  return isValidElement<PulseInjectableChildProps>(value) && typeof value.type === "string";
}

function shouldScrollPulseNodeIntoView(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  const safeVerticalInset = 96;
  const safeHorizontalInset = 16;

  const isAboveSafeArea = rect.top < safeVerticalInset;
  const isBelowSafeArea = rect.bottom > viewportHeight - safeVerticalInset;
  const isOutsideHorizontalSafeArea =
    rect.left < safeHorizontalInset || rect.right > viewportWidth - safeHorizontalInset;

  return isAboveSafeArea || isBelowSafeArea || isOutsideHorizontalSafeArea;
}

function scrollPulseNodeIntoView(element: HTMLElement): void {
  if (!shouldScrollPulseNodeIntoView(element)) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  element.scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "center",
    inline: "nearest",
  });
}

/**
 * Keeps the pulse edge visually bound to the actual card when PulseNode wraps a
 * single card component.
 *
 * The wrapped child remains pulse-agnostic. This function only injects the
 * edge-light element and safe positioning styles. Pulse state changes still stay
 * inside PulseNode and pulseStore.
 *
 * Custom React components are intentionally not cloned because many components
 * do not forward style/children props. For those children, the edge stays bound
 * to the PulseNode wrapper so the light is not silently dropped.
 */
function renderChildrenWithCardBoundPulse({
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
    /* isolation:isolate creates a CSS stacking context so overflow:hidden
       correctly clips the PulseEdgeLight box-shadow bloom.
       Without this the neon glow bleeds outside the card in all directions. */
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

export function PulseNode({
  id,
  pulseId,
  children,
  className,
  style,
  disabled = false,
  onActivate,
  edgeMode = "full",
  variant = "card",
  isGuiding = false,
  isAlert = false,
  isActive = false,
}: PulseNodeProps) {
  const nodeId = pulseId ?? id ?? "";
  const nodeRef = useRef<HTMLDivElement | null>(null);

  const currentNodeId = usePulseStore((state) => state.chain[0] ?? null);
  const resolvingNodeId = usePulseStore((state) => state.resolvingNodeId);
  const severity = usePulseStore((state) =>
    nodeId ? (state.severityByNodeId[nodeId] ?? "info") : "info",
  );
  const advanceChain = usePulseStore((state) => state.advanceChain);

  // storeIsActive = pulse chain is pointing at this node (event-driven)
  const storeIsActive = Boolean(nodeId) && currentNodeId === nodeId;
  const isResolving = Boolean(nodeId) && resolvingNodeId === nodeId;
  const canInteract = !disabled && Boolean(nodeId) && (storeIsActive || Boolean(onActivate));
  const focusRingClassName = nodeId
    ? getEdgeTone(nodeId, severity).focusRing
    : SHIFT_EDGE_TONE.focusRing;

  // Priority: pulse event > isAlert (orange) > isGuiding (domain color) > isActive prop (blue)
  const effectiveTone: PulseEdgeTone | null = storeIsActive
    ? getEdgeTone(nodeId, severity)
    : isAlert
      ? WARNING_EDGE_TONE
      : isGuiding
        ? getEdgeTone(nodeId || "info", "info")
        : isActive
          ? CAREER_EDGE_TONE
          : null;

  useEffect(() => {
    if (!storeIsActive || disabled) return undefined;

    const timeoutId = window.setTimeout(() => {
      const nodeElement = nodeRef.current;

      if (!nodeElement) return;

      scrollPulseNodeIntoView(nodeElement);
    }, 120);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [disabled, storeIsActive, nodeId]);

  function absorbPulse(): boolean {
    if (disabled) return false;
    if (!storeIsActive) return false;

    void triggerLightHaptic();
    advanceChain();

    return true;
  }

  function handleClick(event: MouseEvent<HTMLDivElement>): void {
    if (disabled) return;

    absorbPulse();

    if (onActivate) {
      event.preventDefault();
      onActivate();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (!canInteract) return;
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();

    absorbPulse();

    if (onActivate) {
      onActivate();
    }
  }

  function handleButtonClickCapture(): void {
    absorbPulse();
  }

  // No nodeId and no ambient glow → transparent pass-through
  if (!nodeId && effectiveTone === null) {
    return <>{children}</>;
  }

  if (variant === "button") {
    const buttonClassName = [
      "relative inline-flex max-w-full rounded-[var(--wm-pulse-node-radius,1rem)]",
      "transition-transform duration-300 ease-out",
      storeIsActive ? "z-20" : "",
      isResolving ? "z-10" : "",
      disabled ? "pointer-events-none" : "",
      className ?? "",
    ]
      .filter(Boolean)
      .join(" ");

    const buttonNodeStyle: PulseNodeStyle = {
      position: "relative", // explicit — PulseButtonHalo positions relative to this div
      display: "inline-flex",
      boxSizing: "border-box",
      borderRadius: "var(--wm-pulse-node-radius, 1rem)", // explicit — halo inherits this via borderRadius:"inherit"
      ...style,
    };

    return (
      <div
        ref={nodeRef}
        className={buttonClassName}
        style={buttonNodeStyle}
        data-pulse-node-id={nodeId}
        data-pulse-active={storeIsActive ? "true" : "false"}
        data-pulse-variant="button"
        aria-disabled={disabled ? "true" : undefined}
        onClickCapture={storeIsActive ? handleButtonClickCapture : undefined}
      >
        {effectiveTone !== null && <PulseButtonHalo tone={effectiveTone} />}
        {children}
      </div>
    );
  }

  const mergedClassName = [
    "relative block w-full rounded-[var(--wm-pulse-node-radius,1.5rem)]",
    "transition-transform duration-300 ease-out",
    canInteract
      ? `cursor-pointer focus:outline-none focus-visible:ring-2 ${focusRingClassName} focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.99]`
      : "",
    storeIsActive ? "z-20" : "",
    isResolving ? "z-10" : "",
    disabled ? "pointer-events-none opacity-60" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const nodeStyle: PulseNodeStyle = {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    ...style,
  };

  const edgeLight = effectiveTone ? (
    <PulseEdgeLight tone={effectiveTone} edgeMode={edgeMode} />
  ) : null;

  return (
    <div
      ref={nodeRef}
      className={mergedClassName}
      style={nodeStyle}
      data-pulse-node-id={nodeId}
      data-pulse-active={storeIsActive ? "true" : "false"}
      data-pulse-edge-mode={edgeMode}
      data-pulse-variant="card"
      role={canInteract ? "button" : undefined}
      tabIndex={canInteract ? 0 : undefined}
      aria-current={storeIsActive ? "step" : undefined}
      aria-disabled={disabled ? "true" : undefined}
      onClickCapture={canInteract ? handleClick : undefined}
      onKeyDown={canInteract ? handleKeyDown : undefined}
    >
      {renderChildrenWithCardBoundPulse({
        children,
        edgeLight,
      })}
    </div>
  );
}
