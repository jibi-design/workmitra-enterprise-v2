// src/App.tsx
import { AppRouter } from "./app/router/AppRouter";
import { SplashScreen } from "./shared/components/SplashScreen";
import { AuthSessionBootstrap } from "./shared/components/AuthSessionBootstrap";
import { RuntimeOpsBootstrap, RuntimeOpsMaintenanceGate } from "./shared/ops/RuntimeOpsGate";

export default function App() {
  return (
    <>
      <RuntimeOpsBootstrap />
      <AuthSessionBootstrap />
      <RuntimeOpsMaintenanceGate>
        <AppRouter />
      </RuntimeOpsMaintenanceGate>
      <SplashScreen />
    </>
  );
}
