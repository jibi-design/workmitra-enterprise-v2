// App name: Job Mitra | DressCodeSection.tsx — surface-glass (post-details polish)

import { SECTION_PAD, SECTION_TEXT_STYLE, SECTION_TITLE_STYLE } from "./shiftPostDetail.styles";

export function DressCodeSection({ dressCode }: { readonly dressCode?: string }) {
  if (!dressCode) return null;

  return (
    <section
      className="wm-shift-surface-glass wm-shift-surface-glass--shift wm-animateIn"
      data-testid="shift-post-dress"
      style={{ ...SECTION_PAD, animationDelay: "100ms" }}
    >
      <div style={SECTION_TITLE_STYLE}>Dress code</div>
      <div style={SECTION_TEXT_STYLE}>{dressCode}</div>
    </section>
  );
}
