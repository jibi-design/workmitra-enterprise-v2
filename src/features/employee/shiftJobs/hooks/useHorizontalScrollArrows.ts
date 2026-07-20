// App name: Job Mitra
// File name: useHorizontalScrollArrows.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\hooks\useHorizontalScrollArrows.ts

import { useCallback, useEffect, useState } from "react";

const SCROLL_STEP = 220;

export function useHorizontalScrollArrows(ref: React.RefObject<HTMLDivElement | null>) {
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const checkScroll = useCallback(() => {
    const element = ref.current;

    if (!element) {
      setShowLeft(false);
      setShowRight(false);
      return;
    }

    const canScroll = element.scrollWidth > element.clientWidth;
    const atStart = element.scrollLeft <= 8;
    const atEnd = element.scrollLeft + element.clientWidth >= element.scrollWidth - 8;

    setShowLeft(canScroll && !atStart);
    setShowRight(canScroll && !atEnd);
  }, [ref]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const rafId = requestAnimationFrame(checkScroll);

    element.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);

    return () => {
      cancelAnimationFrame(rafId);
      element.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [ref, checkScroll]);

  const scrollForward = useCallback(() => {
    ref.current?.scrollBy({ left: SCROLL_STEP, behavior: "smooth" });
  }, [ref]);

  const scrollBack = useCallback(() => {
    ref.current?.scrollBy({ left: -SCROLL_STEP, behavior: "smooth" });
  }, [ref]);

  return {
    showLeft,
    showRight,
    scrollForward,
    scrollBack,
  };
}
