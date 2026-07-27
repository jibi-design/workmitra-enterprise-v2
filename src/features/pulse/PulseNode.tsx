/** Job Mitra | PulseNode.tsx | Card/button pulse host — single-cap + arrival lock */

import {
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useRef,
} from "react";
import { triggerLightHaptic } from "../../shared/platform/haptics";
import type { PulseChainSeverity, PulseNodeId } from "./pulseTypes";
import {
  CAREER_EDGE_TONE,
  getEdgeTone,
  SHIFT_EDGE_TONE,
  WARNING_EDGE_TONE,
  type PulseEdgeTone,
  type PulseVisualMode,
} from "./pulseEdgeTones";
import { PulseButtonHalo, PulseEdgeLight } from "./pulseEdgeVisuals";
import { renderChildrenWithCardBoundPulse, scrollPulseNodeIntoView } from "./pulseNodeChildren";
import { usePulseAdvanceChain, usePulseNodeBindings } from "./usePulseNodeBindings";

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
  readonly isGuiding?: boolean;
  readonly isAlert?: boolean;
  readonly isActive?: boolean;
};

function resolveVisualMode(args: {
  storeIsActive: boolean;
  isResolving: boolean;
  hasViewportBreathingPulse: boolean;
  isLocalGuideOrAlert: boolean;
}): PulseVisualMode {
  if (args.isResolving) return "arrival";
  if (args.storeIsActive) return "breathe";
  if (args.isLocalGuideOrAlert && args.hasViewportBreathingPulse) return "static";
  if (args.isLocalGuideOrAlert) return "breathe";
  return "static";
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

  const { storeIsActive, isResolving, severity, hasViewportBreathingPulse } =
    usePulseNodeBindings(nodeId);
  const advanceChain = usePulseAdvanceChain();

  const canInteract = !disabled && Boolean(nodeId) && (storeIsActive || Boolean(onActivate));
  const focusRingClassName = nodeId
    ? getEdgeTone(nodeId, severity).focusRing
    : SHIFT_EDGE_TONE.focusRing;

  const isLocalGuideOrAlert = isGuiding || isAlert || isActive;

  const effectiveTone: PulseEdgeTone | null =
    storeIsActive || isResolving
      ? getEdgeTone(nodeId, isResolving ? "success" : severity)
      : isAlert
        ? WARNING_EDGE_TONE
        : isGuiding
          ? getEdgeTone(nodeId || "info", "info")
          : isActive
            ? CAREER_EDGE_TONE
            : null;

  const edgeSeverity: PulseChainSeverity = isResolving
    ? "success"
    : storeIsActive
      ? severity
      : isAlert
        ? "warning"
        : "info";

  const visualMode = resolveVisualMode({
    storeIsActive,
    isResolving,
    hasViewportBreathingPulse,
    isLocalGuideOrAlert,
  });

  useEffect(() => {
    if (!storeIsActive || disabled) return undefined;
    const timeoutId = window.setTimeout(() => {
      const nodeElement = nodeRef.current;
      if (!nodeElement) return;
      scrollPulseNodeIntoView(nodeElement);
    }, 120);
    return () => window.clearTimeout(timeoutId);
  }, [disabled, storeIsActive, nodeId]);

  function absorbPulse(): boolean {
    if (disabled || !storeIsActive) return false;
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
    onActivate?.();
  }

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

    return (
      <div
        ref={nodeRef}
        className={buttonClassName}
        style={{
          position: "relative",
          display: "inline-flex",
          boxSizing: "border-box",
          borderRadius: "var(--wm-pulse-node-radius, 1rem)",
          ...style,
        }}
        data-pulse-node-id={nodeId}
        data-pulse-active={storeIsActive ? "true" : "false"}
        data-pulse-visual-mode={visualMode}
        data-pulse-variant="button"
        aria-disabled={disabled ? "true" : undefined}
        onClickCapture={storeIsActive ? () => absorbPulse() : undefined}
      >
        {effectiveTone !== null && <PulseButtonHalo tone={effectiveTone} mode={visualMode} />}
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

  const edgeLight = effectiveTone ? (
    <PulseEdgeLight
      tone={effectiveTone}
      edgeMode={edgeMode}
      severity={edgeSeverity}
      mode={visualMode}
    />
  ) : null;

  return (
    <div
      ref={nodeRef}
      className={mergedClassName}
      style={{ display: "block", width: "100%", boxSizing: "border-box", ...style }}
      data-pulse-node-id={nodeId}
      data-pulse-active={storeIsActive ? "true" : "false"}
      data-pulse-visual-mode={visualMode}
      data-pulse-edge-mode={edgeMode}
      data-pulse-variant="card"
      role={canInteract ? "button" : undefined}
      tabIndex={canInteract ? 0 : undefined}
      aria-current={storeIsActive ? "step" : undefined}
      aria-disabled={disabled ? "true" : undefined}
      onClickCapture={canInteract ? handleClick : undefined}
      onKeyDown={canInteract ? handleKeyDown : undefined}
    >
      {renderChildrenWithCardBoundPulse({ children, edgeLight })}
    </div>
  );
}
