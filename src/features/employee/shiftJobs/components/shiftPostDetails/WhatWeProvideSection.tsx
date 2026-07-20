// App name: Job Mitra
// File name: WhatWeProvideSection.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\shiftPostDetails\WhatWeProvideSection.tsx

import { PROVIDE_MAP } from "../../helpers/shiftPostDetailHelpers";
import { CARD_STYLE, SECTION_TITLE_STYLE, SHIFT_GREEN } from "./shiftPostDetail.styles";

export function WhatWeProvideSection({ items }: { readonly items: readonly string[] }) {
  if (items.length === 0) return null;

  return (
    <div className="wm-ee-card" style={CARD_STYLE}>
      <div style={SECTION_TITLE_STYLE}>What we provide</div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {items.map((provideId) => {
          const item = PROVIDE_MAP[provideId];

          if (!item) return null;

          return (
            <span
              key={provideId}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 10px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 800,
                background: "rgba(22,163,74,0.08)",
                color: SHIFT_GREEN,
                border: "1px solid rgba(22,163,74,0.2)",
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
