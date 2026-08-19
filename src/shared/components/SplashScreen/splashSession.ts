// Job Mitra — session-scoped splash intro state (once per tab session)

const SESSION_KEY = "wm_splash_intro_played_v1";
const REPLAY_EVENT = "wm:splash-replay";

export function shouldPlaySplashIntro(): boolean {
  if (typeof navigator !== "undefined" && navigator.webdriver) {
    return false;
  }
  if (typeof sessionStorage === "undefined") {
    return true;
  }

  try {
    return sessionStorage.getItem(SESSION_KEY) !== "1";
  } catch {
    return true;
  }
}

export function markSplashIntroPlayed(): void {
  if (typeof sessionStorage === "undefined") {
    return;
  }

  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // Demo-safe sessionStorage fallback.
  }
}

export function requestSplashReplay(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Demo-safe sessionStorage fallback.
  }

  window.dispatchEvent(new CustomEvent(REPLAY_EVENT));
}

export function subscribeSplashReplay(onReplay: () => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handler = () => onReplay();
  window.addEventListener(REPLAY_EVENT, handler);
  return () => window.removeEventListener(REPLAY_EVENT, handler);
}
