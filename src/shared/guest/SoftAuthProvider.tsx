/** Phase 4 — Soft auth context for high-intent guest actions. */

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, type UserRole } from "../store/authStore";
import { SoftAuthSheet } from "./SoftAuthSheet";
import { stashIntentPacket, type IntentPacket } from "./intentPacket";
import { resumeIntentAfterAuth } from "./resumeIntent";
import { AUTH_BACKEND_ENABLED } from "../config/authConfig";
import { SoftAuthContext, type SoftAuthContextValue, type SoftAuthGateInput } from "./useSoftAuth";

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
      // Demo / AUTH-off: guest local-first actions proceed without soft sheet.
      if (!AUTH_BACKEND_ENABLED) {
        return true;
      }
      if (sessionChecked && isAuthenticated) {
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

  const onAuthenticated = useCallback(
    (role: UserRole) => {
      setOpen(false);
      resumeIntentAfterAuth(nav, role);
    },
    [nav],
  );

  const value = useMemo<SoftAuthContextValue>(
    () => ({ requireAuthForAction, openSoftAuth }),
    [requireAuthForAction, openSoftAuth],
  );

  return (
    <SoftAuthContext.Provider value={value}>
      {children}
      <SoftAuthSheet
        open={open}
        intent={intent}
        onClose={() => setOpen(false)}
        onAuthenticated={onAuthenticated}
      />
    </SoftAuthContext.Provider>
  );
}
