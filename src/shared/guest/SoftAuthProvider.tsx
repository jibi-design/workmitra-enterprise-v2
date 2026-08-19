/** Phase 4 — Soft auth context for high-intent guest create/apply actions. */

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { GuestIntentWarningModal } from "./GuestIntentWarningModal";
import { stashIntentPacket, type IntentPacket } from "./intentPacket";
import { SoftAuthContext, type SoftAuthContextValue, type SoftAuthGateInput } from "./useSoftAuth";
import { ROUTE_PATHS } from "../../app/router/routePaths";
import { isEmployerCreateIntent, isPublishPhase } from "./guestIntentKinds";
import { hasGuestCreatePreviewSkip, setGuestCreatePreviewSkip } from "./guestCreatePreview.session";

export function SoftAuthProvider({ children }: { readonly children: ReactNode }) {
  const nav = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const sessionChecked = useAuthStore((s) => s.sessionChecked);

  const [open, setOpen] = useState(false);
  const [intent, setIntent] = useState<IntentPacket | null>(null);

  const openSoftAuth = useCallback((packet: IntentPacket) => {
    stashIntentPacket(packet);
    setIntent(packet);
    setOpen(true);
  }, []);

  const requireAuthForAction = useCallback(
    (input: SoftAuthGateInput): boolean => {
      if (!sessionChecked) {
        return true;
      }
      if (isAuthenticated) {
        return true;
      }

      if (input.action === "save_shift" || input.action === "save_career") {
        return true;
      }

      const enterCreate =
        isEmployerCreateIntent(input.action) && !isPublishPhase(input.payload);
      if (enterCreate && hasGuestCreatePreviewSkip()) {
        return true;
      }

      const packet = stashIntentPacket({
        action: input.action,
        targetId: input.targetId,
        returnPath: input.returnPath,
        roleHint: input.roleHint ?? "employee",
        payload: input.payload,
      });
      setIntent(packet);
      setOpen(true);
      return false;
    },
    [isAuthenticated, sessionChecked],
  );

  const onPrimary = useCallback(() => {
    const dest =
      intent?.roleHint === "employer" ? ROUTE_PATHS.register : ROUTE_PATHS.login;
    setOpen(false);
    nav(dest, { state: { from: intent?.returnPath ?? "/" } });
  }, [intent, nav]);

  const onSkip = useCallback(() => {
    if (intent && isEmployerCreateIntent(intent.action) && !isPublishPhase(intent.payload)) {
      setGuestCreatePreviewSkip();
    }
    setOpen(false);
  }, [intent]);

  const value = useMemo<SoftAuthContextValue>(
    () => ({ requireAuthForAction, openSoftAuth }),
    [requireAuthForAction, openSoftAuth],
  );

  return (
    <SoftAuthContext.Provider value={value}>
      {children}
      <GuestIntentWarningModal
        open={open}
        intent={intent}
        onPrimary={onPrimary}
        onSkip={onSkip}
      />
    </SoftAuthContext.Provider>
  );
}
