/** Soft auth context + hook (split from provider for react-refresh). */

import { createContext, useContext } from "react";
import type { IntentAction, IntentPacket } from "./intentPacket";

export type SoftAuthGateInput = {
  action: IntentAction;
  targetId: string;
  returnPath: string;
  roleHint?: "employee" | "employer";
  payload?: Record<string, unknown>;
};

export type SoftAuthContextValue = {
  /** Returns true if caller may proceed immediately (already authenticated). */
  requireAuthForAction: (input: SoftAuthGateInput) => boolean;
  openSoftAuth: (packet: IntentPacket) => void;
};

export const SoftAuthContext = createContext<SoftAuthContextValue | null>(null);

export function useSoftAuth(): SoftAuthContextValue {
  const ctx = useContext(SoftAuthContext);
  if (!ctx) {
    throw new Error("useSoftAuth must be used within SoftAuthProvider");
  }
  return ctx;
}
