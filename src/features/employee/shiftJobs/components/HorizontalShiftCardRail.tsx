// App name: Job Mitra
// File name: HorizontalShiftCardRail.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\HorizontalShiftCardRail.tsx

import { useRef } from "react";
import { useHorizontalScrollArrows } from "../hooks/useHorizontalScrollArrows";
import type { ShiftCardData } from "../types/shiftSearchSection.types";
import {
  shiftSearchArrowButtonBaseStyle,
  shiftSearchFadeLeftStyle,
  shiftSearchFadeRightStyle,
  shiftSearchScrollContainerStyle,
} from "./ShiftSearchSectionStyles";
import { ShiftSearchChevronLeft, ShiftSearchChevronRight } from "./ShiftSearchSectionIcons";
import { ShiftMiniCard } from "./ShiftMiniCard";

type HorizontalShiftCardRailProps = {
  cards: ShiftCardData[];
  onOpen: (id: string) => void;
  getSubtitle: (card: ShiftCardData) => string;
  getFooter?: (card: ShiftCardData) => string | undefined;
};

export function HorizontalShiftCardRail({
  cards,
  onOpen,
  getSubtitle,
  getFooter,
}: HorizontalShiftCardRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { showLeft, showRight, scrollForward, scrollBack } = useHorizontalScrollArrows(scrollRef);

  return (
    <div style={{ position: "relative", marginTop: 10 }}>
      {showLeft && <div style={shiftSearchFadeLeftStyle} />}

      {showLeft && (
        <button
          type="button"
          style={{ ...shiftSearchArrowButtonBaseStyle, left: 4 }}
          onClick={scrollBack}
          aria-label="Scroll left"
        >
          <ShiftSearchChevronLeft />
        </button>
      )}

      <div ref={scrollRef} style={shiftSearchScrollContainerStyle}>
        {cards.map((card) => (
          <ShiftMiniCard
            key={card.id}
            card={card}
            subtitle={getSubtitle(card)}
            footer={getFooter?.(card)}
            onOpen={onOpen}
          />
        ))}
      </div>

      {showRight && <div style={shiftSearchFadeRightStyle} />}

      {showRight && (
        <button
          type="button"
          style={{ ...shiftSearchArrowButtonBaseStyle, right: 4 }}
          onClick={scrollForward}
          aria-label="Scroll right"
        >
          <ShiftSearchChevronRight />
        </button>
      )}
    </div>
  );
}
