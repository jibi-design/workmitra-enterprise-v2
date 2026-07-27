// App name: Job Mitra | WhatWeProvideSection.tsx — surface-glass (post-details polish)

import { PROVIDE_MAP } from "../../helpers/shiftPostDetailHelpers";
import { SECTION_PAD, SECTION_TITLE_STYLE } from "./shiftPostDetail.styles";

export function WhatWeProvideSection({ items }: { readonly items: readonly string[] }) {
  if (items.length === 0) return null;

  return (
    <section
      className="wm-shift-surface-glass wm-shift-surface-glass--shift wm-animateIn"
      data-testid="shift-post-provide"
      style={{ ...SECTION_PAD, animationDelay: "80ms" }}
    >
      <div style={SECTION_TITLE_STYLE}>What we provide</div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {items.map((provideId) => {
          const item = PROVIDE_MAP[provideId];
          if (!item) return null;

          return (
            <span
              key={provideId}
              className="wm-shift-pill"
              style={{ fontSize: 12, fontWeight: 800 }}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </span>
          );
        })}
      </div>
    </section>
  );
}
