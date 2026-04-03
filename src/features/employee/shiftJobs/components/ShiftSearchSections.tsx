// src/features/employee/shiftJobs/components/ShiftSearchSections.tsx

import { useRef, useState, useEffect, useCallback } from "react";
import type { CSSProperties } from "react";

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
export type ShiftCardData = {
  id: string;
  jobName: string;
  companyName: string;
  payPerDay: number;
  locationName: string;
  distanceKm: number;
  category: string;
};

/* ------------------------------------------------ */
/* Styles                                           */
/* ------------------------------------------------ */
const SHIFT_GREEN = "#16a34a";
const SCROLL_STEP = 220;

const scrollContainerStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  overflowX: "auto",
  paddingBottom: 4,
  scrollbarWidth: "none",
  scrollBehavior: "smooth",
};

const miniCardStyle: CSSProperties = {
  minWidth: 200,
  maxWidth: 220,
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid var(--wm-er-border)",
  borderLeft: `3px solid ${SHIFT_GREEN}`,
  background: "#fff",
  cursor: "pointer",
  textAlign: "left",
  flexShrink: 0,
};

const sectionWrapStyle: CSSProperties = {
  marginTop: 14,
  padding: "12px 16px",
  borderRadius: 12,
  background: "rgba(22, 163, 74, 0.03)",
  border: "1px solid rgba(22, 163, 74, 0.12)",
};

const arrowBtnBase: CSSProperties = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  width: 28,
  height: 28,
  borderRadius: "50%",
  background: "#fff",
  boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2,
  border: "none",
  cursor: "pointer",
  color: SHIFT_GREEN,
  padding: 0,
};

const fadeRightStyle: CSSProperties = {
  position: "absolute",
  right: 0,
  top: 0,
  bottom: 0,
  width: 40,
  background: "linear-gradient(to right, transparent, rgba(255,255,255,0.9))",
  pointerEvents: "none",
  zIndex: 1,
  borderRadius: "0 12px 12px 0",
};

const fadeLeftStyle: CSSProperties = {
  position: "absolute",
  left: 0,
  top: 0,
  bottom: 0,
  width: 40,
  background: "linear-gradient(to left, transparent, rgba(255,255,255,0.9))",
  pointerEvents: "none",
  zIndex: 1,
  borderRadius: "12px 0 0 12px",
};

/* ------------------------------------------------ */
/* Chevron Icons                                    */
/* ------------------------------------------------ */
function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6Z" />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59Z" />
    </svg>
  );
}

/* ------------------------------------------------ */
/* useScrollArrows hook                             */
/* ------------------------------------------------ */
function useScrollArrows(ref: React.RefObject<HTMLDivElement | null>) {
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = ref.current;
    if (!el) { setShowLeft(false); setShowRight(false); return; }
    const canScroll = el.scrollWidth > el.clientWidth;
    const atStart = el.scrollLeft <= 8;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
    setShowLeft(canScroll && !atStart);
    setShowRight(canScroll && !atEnd);
  }, [ref]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rafId = requestAnimationFrame(checkScroll);
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [ref, checkScroll]);

  const scrollForward = useCallback(() => {
    ref.current?.scrollBy({ left: SCROLL_STEP, behavior: "smooth" });
  }, [ref]);

  const scrollBack = useCallback(() => {
    ref.current?.scrollBy({ left: -SCROLL_STEP, behavior: "smooth" });
  }, [ref]);

  return { showLeft, showRight, scrollForward, scrollBack };
}

/* ------------------------------------------------ */
/* Recommended Section                              */
/* ------------------------------------------------ */
type RecommendedProps = {
  cards: ShiftCardData[];
  title: string;
  subtitle: string;
  onOpen: (id: string) => void;
};

export function RecommendedSection({ cards, title, subtitle, onOpen }: RecommendedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { showLeft, showRight, scrollForward, scrollBack } = useScrollArrows(scrollRef);

  if (cards.length === 0) return null;

  return (
    <div style={sectionWrapStyle}>
      <div style={{ fontSize: 13, fontWeight: 900, color: "var(--wm-er-text)" }}>{title}</div>
      <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>{subtitle}</div>
      <div style={{ position: "relative", marginTop: 10 }}>
        {showLeft && <div style={fadeLeftStyle} />}
        {showLeft && (
          <button type="button" style={{ ...arrowBtnBase, left: 4 }} onClick={scrollBack} aria-label="Scroll left">
            <ChevronLeft />
          </button>
        )}
        <div ref={scrollRef} style={scrollContainerStyle}>
          {cards.map((c) => (
            <button key={c.id} type="button" style={miniCardStyle} onClick={() => onOpen(c.id)}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--wm-er-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {c.jobName}
              </div>
              <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 3 }}>{c.companyName}</div>
              <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
                {c.locationName}{c.distanceKm > 0 ? ` · ${c.distanceKm} km` : ""}
              </div>
              <div style={{ fontSize: 12, fontWeight: 900, color: SHIFT_GREEN, marginTop: 6 }}>
                {c.payPerDay} / day
              </div>
            </button>
          ))}
        </div>
        {showRight && <div style={fadeRightStyle} />}
        {showRight && (
          <button type="button" style={{ ...arrowBtnBase, right: 4 }} onClick={scrollForward} aria-label="Scroll right">
            <ChevronRight />
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------ */
/* Recently Viewed Section                          */
/* ------------------------------------------------ */
type RecentlyViewedProps = {
  cards: ShiftCardData[];
  onOpen: (id: string) => void;
};

export function RecentlyViewedSection({ cards, onOpen }: RecentlyViewedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { showLeft, showRight, scrollForward, scrollBack } = useScrollArrows(scrollRef);

  if (cards.length === 0) return null;

  return (
    <div style={sectionWrapStyle}>
      <div style={{ fontSize: 13, fontWeight: 900, color: "var(--wm-er-text)" }}>Recently Viewed</div>
      <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>Shifts you checked out recently</div>
      <div style={{ position: "relative", marginTop: 10 }}>
        {showLeft && <div style={fadeLeftStyle} />}
        {showLeft && (
          <button type="button" style={{ ...arrowBtnBase, left: 4 }} onClick={scrollBack} aria-label="Scroll left">
            <ChevronLeft />
          </button>
        )}
        <div ref={scrollRef} style={scrollContainerStyle}>
          {cards.map((c) => (
            <button key={c.id} type="button" style={miniCardStyle} onClick={() => onOpen(c.id)}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--wm-er-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {c.jobName}
              </div>
              <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 3 }}>{c.companyName}</div>
              <div style={{ fontSize: 12, fontWeight: 900, color: SHIFT_GREEN, marginTop: 6 }}>
                {c.payPerDay} / day
              </div>
              <div style={{ fontSize: 10, color: "var(--wm-er-muted)", marginTop: 4, fontStyle: "italic" }}>
                Still interested?
              </div>
            </button>
          ))}
        </div>
        {showRight && <div style={fadeRightStyle} />}
        {showRight && (
          <button type="button" style={{ ...arrowBtnBase, right: 4 }} onClick={scrollForward} aria-label="Scroll right">
            <ChevronRight />
          </button>
        )}
      </div>
    </div>
  );
}