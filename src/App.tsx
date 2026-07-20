// src/App.tsx
import { AppRouter } from "./app/router/AppRouter";
import { SplashScreen } from "./shared/components/SplashScreen";
import { AuthSessionBootstrap } from "./shared/components/AuthSessionBootstrap";

export default function App() {
  return (
    <>
      <AuthSessionBootstrap />
      <AppRouter />
      <SplashScreen />
    </>
  );
}
