/** Time-based home greeting that yields to the display name after a short hold. */

import { useEffect, useState } from "react";

export const GREET_HOLD_MS = 3000;
export const GREET_FADE_MS = 300;

export function getTimeOfDayGreeting(
  now = new Date(),
): "Good Morning" | "Good Afternoon" | "Good Evening" {
  const hour = now.getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export function useHomeGreetingReveal(): {
  readonly greeting: ReturnType<typeof getTimeOfDayGreeting>;
  readonly showName: boolean;
} {
  const greeting = getTimeOfDayGreeting();
  const [showName, setShowName] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (showName) return undefined;
    const id = window.setTimeout(() => setShowName(true), GREET_HOLD_MS);
    return () => window.clearTimeout(id);
  }, [showName]);

  return { greeting, showName };
}
