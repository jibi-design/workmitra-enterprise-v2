/**
 * Saved branded QR posters — device-local, isolated from Shift/Career.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { resolveItemPersonFolderId, resolvePassVenueFolderId } from "../helpers/eventDayFolders.helpers";
import type { EccLevel } from "../validation/mitraLabs.schemas";

export type SavedQrPoster = {
  readonly posterId: string;
  readonly passId: string;
  readonly issuerId: string;
  readonly eventName: string;
  readonly guestName?: string;
  readonly venue: { readonly name: string };
  readonly validFrom: string;
  readonly status: "active";
  readonly payload: string;
  readonly paletteId: string;
  readonly eccLevel: EccLevel;
  readonly logoCover: number;
  readonly includeLogo: boolean;
  readonly createdAt: number;
};

type QrPosterState = {
  posters: SavedQrPoster[];
  savePoster: (input: Omit<SavedQrPoster, "posterId" | "passId" | "status" | "createdAt">) => SavedQrPoster;
  deletePoster: (posterId: string) => void;
  deletePosterFolder: (folderId: string) => void;
  deletePosterPersonFolder: (personFolderId: string) => void;
};

function mintPosterId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `qr_${crypto.randomUUID()}`;
  }
  return `qr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function resolveQrPosterFolderId(poster: SavedQrPoster): string {
  return resolvePassVenueFolderId(poster);
}

export const useQrPosterStore = create<QrPosterState>()(
  persist(
    (set) => ({
      posters: [],
      savePoster(input) {
        const id = mintPosterId();
        const record: SavedQrPoster = {
          ...input,
          posterId: id,
          passId: id,
          status: "active",
          createdAt: Date.now(),
        };
        set((s) => ({ posters: [record, ...s.posters] }));
        return record;
      },
      deletePoster(posterId) {
        set((s) => ({ posters: s.posters.filter((row) => row.posterId !== posterId) }));
      },
      deletePosterFolder(folderId) {
        set((s) => ({
          posters: s.posters.filter((row) => resolveQrPosterFolderId(row) !== folderId),
        }));
      },
      deletePosterPersonFolder(personFolderId) {
        set((s) => ({
          posters: s.posters.filter((row) => resolveItemPersonFolderId(row) !== personFolderId),
        }));
      },
    }),
    {
      name: "wm_mitra_labs_qr_posters_v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ posters: s.posters }),
    },
  ),
);
