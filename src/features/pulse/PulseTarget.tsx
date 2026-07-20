/** Job Mitra | PulseTarget.tsx | src/features/pulse/PulseTarget.tsx */

import type { CSSProperties, ReactNode } from "react";
import { PulseNode } from "./PulseNode";
import type { PulseNodeId } from "./pulseStore";

type PulseTargetEdgeMode = "full" | "floating";

type PulseTargetStyle = CSSProperties & {
  readonly "--wm-pulse-node-radius"?: string | number;
};

type PulseTargetProps = {
  readonly pulseId: PulseNodeId;
  readonly children: ReactNode;
  readonly className?: string;
  readonly style?: PulseTargetStyle;
  readonly disabled?: boolean;
  readonly onActivate?: () => void;
  readonly edgeMode?: PulseTargetEdgeMode;
  readonly radius?: string | number;
};

/**
 * Shared plug-and-play card target for the Pulse Engine.
 *
 * Use this when the visual target is a card or a custom React component that may
 * not forward `children` or `style` props. The wrapper creates a real DOM layer
 * so PulseNode can bind the edge-light inside the exact card boundary instead of
 * leaking to a page/section edge.
 */
export function PulseTargetCard({
  pulseId,
  children,
  className,
  style,
  disabled = false,
  onActivate,
  edgeMode = "full",
  radius = "24px",
}: PulseTargetProps) {
  const radiusValue = typeof radius === "number" ? `${radius}px` : radius;

  const pulseNodeStyle: PulseTargetStyle = {
    "--wm-pulse-node-radius": radiusValue,
    ...style,
  };

  return (
    <PulseNode
      pulseId={pulseId}
      className={className}
      style={pulseNodeStyle}
      disabled={disabled}
      onActivate={onActivate}
      edgeMode={edgeMode}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          borderRadius: "var(--wm-pulse-node-radius, 24px)",
          overflow: "hidden",
          isolation: "isolate",
        }}
      >
        {children}
      </div>
    </PulseNode>
  );
}

/**
 * Shared plug-and-play section target for larger page sections.
 *
 * Prefer PulseTargetCard for individual action cards. Use this only when the
 * next user action is truly a whole section.
 */
export function PulseTargetSection({
  pulseId,
  children,
  className,
  style,
  disabled = false,
  onActivate,
  edgeMode = "floating",
  radius = "24px",
}: PulseTargetProps) {
  return (
    <PulseTargetCard
      pulseId={pulseId}
      className={className}
      style={style}
      disabled={disabled}
      onActivate={onActivate}
      edgeMode={edgeMode}
      radius={radius}
    >
      {children}
    </PulseTargetCard>
  );
}

type PulseTargetButtonProps = PulseTargetProps & {
  /** Show green halo — guide user to this button (e.g. primary CTA on first login) */
  readonly isGuiding?: boolean;
  /** Show orange halo — pending action on this button */
  readonly isAlert?: boolean;
  /** Show blue halo — this button represents the currently active state */
  readonly isActive?: boolean;
};

/**
 * Shared plug-and-play button/action target.
 *
 * Renders an outer halo glow around the child button when the pulse node is
 * active, or when isGuiding / isAlert / isActive props are set. Does not inject
 * a left-edge bar. Does not change the child button's text, opacity, or
 * background. The edgeMode prop is accepted for backward compatibility but has
 * no effect — button halo is always rendered via PulseNode variant="button".
 */
export function PulseTargetButton({
  pulseId,
  children,
  className,
  style,
  disabled = false,
  onActivate,
  edgeMode: _edgeMode = "floating",
  radius = "16px",
  isGuiding,
  isAlert,
  isActive,
}: PulseTargetButtonProps) {
  void _edgeMode;
  const radiusValue = typeof radius === "number" ? `${radius}px` : radius;

  const pulseNodeStyle: PulseTargetStyle = {
    "--wm-pulse-node-radius": radiusValue,
    ...style,
  };

  return (
    <PulseNode
      pulseId={pulseId}
      variant="button"
      className={className}
      style={pulseNodeStyle}
      disabled={disabled}
      onActivate={onActivate}
      isGuiding={isGuiding}
      isAlert={isAlert}
      isActive={isActive}
    >
      {children}
    </PulseNode>
  );
}
