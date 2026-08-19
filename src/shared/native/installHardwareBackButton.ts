/**
 * Capacitor hardware back button — close overlays first, then history, then exit.
 */
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { closeTopOverlay } from "./overlayBackStack";

let installed = false;

export function installHardwareBackButton(): () => void {
  if (installed || !Capacitor.isNativePlatform()) {
    return () => undefined;
  }
  installed = true;

  const listenerPromise = App.addListener("backButton", ({ canGoBack }) => {
    if (closeTopOverlay()) return;

    if (canGoBack || (typeof window !== "undefined" && window.history.length > 1)) {
      window.history.back();
      return;
    }

    void App.exitApp();
  });

  return () => {
    installed = false;
    void listenerPromise.then((handle) => handle.remove());
  };
}
