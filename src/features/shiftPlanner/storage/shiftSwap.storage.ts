/**
 * Weekly Shift Planner — swap request Zustand store (persist to localStorage).
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CreateSwapRequestInput } from "../validation/shiftSwap.schemas";

export type SwapStatus =
  | "requested"
  | "peer_accepted"
  | "manager_approved"
  | "rejected"
  | "expired"
  | "locked";

export type ShiftSwapRecord = CreateSwapRequestInput & {
  readonly id: string;
  readonly status: SwapStatus;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly peerRoleTag?: string;
};

type ShiftPlannerState = {
  swapRequests: ShiftSwapRecord[];
  addSwapRequest: (
    input: CreateSwapRequestInput & { peerRoleTag?: string },
  ) => ShiftSwapRecord;
  updateSwapStatus: (id: string, status: SwapStatus) => void;
  getPendingSwapsByPeer: (peerId: string) => ShiftSwapRecord[];
  getPendingSwapsForManager: (siteId?: string) => ShiftSwapRecord[];
};

function uid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `swap_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export const useShiftPlannerStore = create<ShiftPlannerState>()(
  persist(
    (set, get) => ({
      swapRequests: [],

      addSwapRequest(input) {
        const now = Date.now();
        const record: ShiftSwapRecord = {
          ...input,
          id: uid(),
          status: "requested",
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ swapRequests: [record, ...s.swapRequests] }));
        return record;
      },

      updateSwapStatus(id, status) {
        set((s) => ({
          swapRequests: s.swapRequests.map((r) =>
            r.id === id ? { ...r, status, updatedAt: Date.now() } : r,
          ),
        }));
      },

      getPendingSwapsByPeer(peerId) {
        return get().swapRequests.filter(
          (r) => r.peerId === peerId && r.status === "requested",
        );
      },

      getPendingSwapsForManager(siteId) {
        return get().swapRequests.filter(
          (r) =>
            r.status === "peer_accepted" &&
            (siteId ? r.siteId === siteId : true),
        );
      },
    }),
    {
      name: "wm_shift_planner_swaps_v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ swapRequests: s.swapRequests }),
    },
  ),
);
