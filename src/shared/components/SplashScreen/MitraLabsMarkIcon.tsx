// Mitra Labs — DEFINITIVE visual lock (geometric center + permanent teal shift)

type Props = {
  size?: number;
  className?: string;
};

const NODE_ANGLES = [12, 52, 98, 142, 188, 232, 278, 322] as const;
const OUTER_R = 88;
const INNER_R = 74;
const CX = 100;
const CY = 100;
const MONOGRAM_SCALE = 0.85;

/**
 * Centroid lock (pre-scale, before 0.85):
 *   x: 76–124 → center 100.000
 *   y: 73.5–127 (incl. L-node r=5.5) → center 100.250
 * Micro-nudge: translate(0, -0.25) post-scale origin → optical center (100, 100).
 */
const ML_MONOGRAM_PATH = "M 76 127 L 76 85 L 90 113 L 104 85 L 104 127 L 124 127";
const ML_L_NODE_CX = 104;
const ML_L_NODE_CY = 79;
const ML_STAR_CX = 90;
const ML_STAR_CY = 113;
const MONOGRAM_CENTER_NUDGE_Y = -0.25;

function polarToCartesian(angleDeg: number, radius: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: CX + radius * Math.cos(rad),
    y: CY + radius * Math.sin(rad),
  };
}

export function MitraLabsMarkIcon({ size = 168, className }: Props) {
  const nodeGradientId = "wm-ml-node-gradient";
  const ringBloomId = "wm-ml-ring-bloom";
  const shimmerId = "wm-ml-shimmer-gradient";

  const monogramTransform = `translate(${CX} ${CY}) scale(${MONOGRAM_SCALE}) translate(0 ${MONOGRAM_CENTER_NUDGE_Y}) translate(${-CX} ${-CY})`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="-32 -32 264 264"
      aria-hidden="true"
      className={className}
      shapeRendering="geometricPrecision"
      overflow="visible"
    >
      <defs>
        <filter
          id={ringBloomId}
          x="-60%"
          y="-60%"
          width="220%"
          height="220%"
          filterUnits="objectBoundingBox"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.8" result="tealBloom" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="6.5" result="softBloom" />
          <feMerge>
            <feMergeNode in="softBloom" />
            <feMergeNode in="tealBloom" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id={nodeGradientId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="52%" stopColor="#0891B2" />
          <stop offset="100%" stopColor="rgba(8, 145, 178, 0)" />
        </radialGradient>
        <linearGradient id={shimmerId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="48%" stopColor="rgba(255,255,255,0.95)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>

      <g className="wm-splash-ml-ring-layer" filter={`url(#${ringBloomId})`}>
        <circle
          className="wm-splash-ml-laser-stroke"
          cx={CX}
          cy={CY}
          r={OUTER_R}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1"
          strokeDasharray="54 13 54 13 54 13 54 13"
          transform={`rotate(-6 ${CX} ${CY})`}
        />
        <circle
          className="wm-splash-ml-laser-stroke"
          cx={CX}
          cy={CY}
          r={INNER_R}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1"
          strokeDasharray="36 9 36 9 36 9 36 9 36 9"
          transform={`rotate(14 ${CX} ${CY})`}
        />

        {NODE_ANGLES.map((angle) => {
          const outer = polarToCartesian(angle, OUTER_R - 6);
          const inner = polarToCartesian(angle, INNER_R + 4);
          return (
            <line
              key={`spoke-${angle}`}
              className="wm-splash-ml-laser-stroke"
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="#FFFFFF"
              strokeWidth="1"
            />
          );
        })}

        {NODE_ANGLES.map((angle) => {
          const point = polarToCartesian(angle, OUTER_R);
          return (
            <circle
              key={`node-${angle}`}
              className="wm-splash-ml-node"
              cx={point.x}
              cy={point.y}
              r="4.2"
              fill={`url(#${nodeGradientId})`}
            />
          );
        })}
      </g>

      <g className="wm-splash-ml-monogram-group" transform={monogramTransform}>
        <path
          className="wm-splash-ml-monogram-body"
          d={ML_MONOGRAM_PATH}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="wm-splash-ml-laser-stroke wm-splash-ml-monogram-core"
          d={ML_MONOGRAM_PATH}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          className="wm-splash-ml-l-node"
          cx={ML_L_NODE_CX}
          cy={ML_L_NODE_CY}
          r="5.5"
          fill="#0891B2"
        />
        <circle
          className="wm-splash-ml-l-node-core wm-splash-ml-energy-node"
          cx={ML_L_NODE_CX}
          cy={ML_L_NODE_CY}
          r="2.2"
          fill="#FFFFFF"
        />
        <circle
          className="wm-splash-ml-star wm-splash-ml-energy-node"
          cx={ML_STAR_CX}
          cy={ML_STAR_CY}
          r="2.8"
          fill="#FFFFFF"
        />
      </g>

      <rect
        className="wm-splash-ml-edge-spark"
        x="-32"
        y="-32"
        width="264"
        height="264"
        fill={`url(#${shimmerId})`}
        opacity="0"
      />
    </svg>
  );
}
