// src/App.tsx
import { useEffect } from "react";
import { AppRouter } from "./app/router/AppRouter";
import { SplashScreen } from "./shared/components/SplashScreen";
import { AuthSessionBootstrap } from "./shared/components/AuthSessionBootstrap";
import { NetworkOfflineBanner } from "./shared/components/NetworkOfflineBanner";
import { RuntimeOpsBootstrap, RuntimeOpsMaintenanceGate } from "./shared/ops/RuntimeOpsGate";
import { installHardwareBackButton } from "./shared/native/installHardwareBackButton";
import { hideNativeSplash } from "./shared/native/nativeSplash";

export default function App() {
  useEffect(() => {
    const teardownBack = installHardwareBackButton();
    void hideNativeSplash();
    return () => {
      teardownBack();
    };
  }, []);

  return (
    <>
      <RuntimeOpsBootstrap />
      <AuthSessionBootstrap />
      <NetworkOfflineBanner />
      <RuntimeOpsMaintenanceGate>
        <AppRouter />
      </RuntimeOpsMaintenanceGate>
      <SplashScreen />
    </>
  );
}
