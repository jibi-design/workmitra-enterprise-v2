// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { normalizeHashRouterDeepLink } from "./app/router/pendingRoute";
import "./index.css";
import App from "./App.tsx";
import { GodModePanel } from "./dev/GodModePanel.tsx";
import { initAppHaptics } from "./shared/platform/haptics";

normalizeHashRouterDeepLink();
initAppHaptics();

if (import.meta.env.DEV && "serviceWorker" in navigator) {
  void navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      void registration.unregister();
    });
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <GodModePanel />
  </StrictMode>,
);
