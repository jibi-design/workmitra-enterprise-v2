// src/shared/components/rating/StarRating.tsx
//
// Premium animated star rating component.
// Scale bounce + glow on tap. Used in both rating modals.

import { useCallback, useRef, useState } from "react";
import { STAR_LABELS } from "../../rating/ratingTags";

/* ── Keyframes (injected once) ─────────────────── */

const STYLE_ID = "wm-star-rating-fx";

function ensureStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes wmStarBounce {
      0%   { transform: scale(1); }
      35%  { transform: scale(1.35); }
      60%  { transform: scale(0.92); }
      80%  { transform: scale(1.08); }
      100% { transform: scale(1); }
    }
    @keyframes wmStarGlow {
      0%   { box-shadow: 0 0 0 0 rgba(250,204,21,0.5); }
      50%  { box-shadow: 0 0 12px 4px rgba(250,204,21,0.35); }
      100% { box-shadow: 0 0 0 0 rgba(250,204,21,0); }
    }
    @keyframes wmLabelFade {
      0%   { opacity: 0; transform: translateY(4px); }
      100% { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

/* ── Props ─────────────────────────────────────── */

type Props = {
  value: number;
  onChange: (star: 1 | 2 | 3 | 4 | 5) => void;
  accentColor?: string;
  size?: number;
  disabled?: boolean;
};

/* ── Component ─────────────────────────────────── */

export function StarRating({
  value,
  onChange,
  accentColor = "var(--wm-er-accent-shift, #16a34a)",
  size = 42,
  disabled = false,
}: Props) {
  const [animating, setAnimating] = useState(0);
  const timerRef = useRef(0);

  const handleClick = useCallback(
    (v: number) => {
      if (disabled) return;
      ensureStyles();
      onChange(v as 1 | 2 | 3 | 4 | 5);
      setAnimating(v);
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setAnimating(0), 450);
    },
    [disabled, onChange],
  );

  return (
    <div>
      <div style={{ display: "flex", gap: 8 }}>
        {([1, 2, 3, 4, 5] as const).map((v) => {
          const filled = value >= v;
          const isPopping = animating === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => handleClick(v)}
              disabled={disabled}
              aria-label={`${v} star${v !== 1 ? "s" : ""}`}
              style={{
                width: size,
                height: size,
                borderRadius: 12,
                border: filled
                  ? "2px solid transparent"
                  : "1.5px solid var(--wm-er-border, #e2e8f0)",
                background: filled
                  ? `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`
                  : "var(--wm-er-card, #fff)",
                color: filled ? "#fff" : "var(--wm-er-muted, #94a3b8)",
                fontSize: size * 0.48,
                cursor: disabled ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.2s ease, border 0.2s ease, color 0.2s ease",
                animation: isPopping
                  ? "wmStarBounce 0.45s ease, wmStarGlow 0.45s ease"
                  : "none",
                boxShadow: filled
                  ? `0 2px 8px ${accentColor}30`
                  : "0 1px 3px rgba(0,0,0,0.06)",
              }}
            >
              &#9733;
            </button>
          );
        })}
        {value > 0 && (
          <div style={{
            alignSelf: "center", marginLeft: 4,
            fontSize: 14, fontWeight: 700, color: accentColor,
            animation: "wmLabelFade 0.3s ease",
          }}>
            {value}/5
          </div>
        )}
      </div>
      {value > 0 && (
        <div style={{
          marginTop: 6, fontSize: 12, fontWeight: 600,
          color: accentColor, animation: "wmLabelFade 0.3s ease",
        }}>
          {STAR_LABELS[value as 1 | 2 | 3 | 4 | 5]}
        </div>
      )}
    </div>
  );
}