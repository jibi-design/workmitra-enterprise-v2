// src/main.tsx
import { StrictMode, type ComponentType } from "react";
import { createRoot } from "react-dom/client";
import { normalizeHashRouterDeepLink } from "./app/router/pendingRoute";
import { installIncomingCallNativeBridge } from "./features/shared/calling";
import "./index.css";
import App from "./App.tsx";
import { initAppHaptics } from "./shared/platform/haptics";
import { installShiftRetryQueueDrain } from "./shared/shift/shiftRetryQueue.drain";
import { initClientMonitor } from "./shared/observability/monitor";
import { hydratePiiSecureStorage } from "./shared/security/piiSecureStorage";
import { hydrateVaultDocumentsPlaintext } from "./features/employee/workVault/services/vaultDocumentService";

normalizeHashRouterDeepLink();
installIncomingCallNativeBridge();
initAppHaptics();
installShiftRetryQueueDrain();
initClientMonitor();

if (import.meta.env.DEV && "serviceWorker" in navigator) {
  void navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      void registration.unregister();
    });
  });
}

const rootEl = document.getElementById("root")!;

/**
 * Layer 6: GodMode is DEV-only — dynamic import so production Rollup
 * never pulls the debug module into the main graph.
 */
async function mount(): Promise<void> {
  try {
    await Promise.race([
      (async () => {
        await hydratePiiSecureStorage();
        await hydrateVaultDocumentsPlaintext();
      })(),
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, 2_000);
      }),
    ]);
  } catch (err) {
    console.error("[WorkMitra] PII / vault document hydrate failed", err);
  }

  let GodModePanel: ComponentType | null = null;
  if (import.meta.env.DEV) {
    const mod = await import("./dev/GodModePanel.tsx");
    GodModePanel = mod.GodModePanel;
  }

  createRoot(rootEl).render(
    <StrictMode>
      <App />
      {GodModePanel ? <GodModePanel /> : null}
    </StrictMode>,
  );
}

void mount();
