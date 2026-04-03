// src/shared/components/rating/RatingTagSelector.tsx
//
// Premium tag selector for rating modals.
// Pop animation + checkmark on selected tags.

import { useCallback, useRef, useState } from "react";

/* ── Keyframes (injected once) ─────────────────── */

const STYLE_ID = "wm-tag-selector-fx";

function ensureStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes wmTagPop {
      0%   { transform: scale(1); }
      40%  { transform: scale(1.12); }
      70%  { transform: scale(0.95); }
      100% { transform: scale(1); }
    }
  `;
  document.head.appendChild(style);
}

/* ── Props ─────────────────────────────────────── */

type Props<T extends string> = {
  tags: readonly T[];
  selected: T[];
  onChange: (tags: T[]) => void;
  accentColor?: string;
};

/* ── Component ─────────────────────────────────── */

export function RatingTagSelector<T extends string>({
  tags,
  selected,
  onChange,
  accentColor = "var(--wm-er-accent-shift, #16a34a)",
}: Props<T>) {
  const [popping, setPopping] = useState<string | null>(null);
  const timerRef = useRef(0);

  const toggle = useCallback(
    (tag: T) => {
      ensureStyles();
      const isSelected = selected.includes(tag);
      onChange(isSelected ? selected.filter((t) => t !== tag) : [...selected, tag]);
      setPopping(tag);
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setPopping(null), 350);
    },
    [selected, onChange],
  );

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {tags.map((tag) => {
        const isActive = selected.includes(tag);
        const isPop = popping === tag;
        return (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              border: isActive
                ? `1.5px solid ${accentColor}`
                : "1.5px solid var(--wm-er-border, #e2e8f0)",
              background: isActive ? `${accentColor}12` : "var(--wm-er-card, #fff)",
              color: isActive ? accentColor : "var(--wm-er-muted, #64748b)",
              transition: "background 0.2s ease, border 0.2s ease, color 0.2s ease",
              animation: isPop ? "wmTagPop 0.35s ease" : "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            {isActive && (
              <span style={{ fontSize: 11, lineHeight: 1 }}>&#10003;</span>
            )}
            {tag}
          </button>
        );
      })}
    </div>
  );
}