// App name: Job Mitra
// File name: DressCodeSection.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\shiftPostDetails\DressCodeSection.tsx

import { CARD_STYLE, SECTION_TEXT_STYLE, SECTION_TITLE_STYLE } from "./shiftPostDetail.styles";

export function DressCodeSection({ dressCode }: { readonly dressCode?: string }) {
  if (!dressCode) return null;

  return (
    <div className="wm-ee-card" style={CARD_STYLE}>
      <div style={SECTION_TITLE_STYLE}>Dress code</div>
      <div style={SECTION_TEXT_STYLE}>{dressCode}</div>
    </div>
  );
}
