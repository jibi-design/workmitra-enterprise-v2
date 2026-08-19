/** Gate PIN folder list from issued passes and generated QR posters. */

import { useMemo } from "react";
import { listGatePinFolders, type GatePinFolderCard } from "./eventDayGatePinFolders.helpers";
import { useMitraLabsStore } from "../storage/mitraLabs.storage";
import { useQrPosterStore } from "../storage/qrPoster.storage";

export function readGatePinFolders(issuerId: string): GatePinFolderCard[] {
  const passes = useMitraLabsStore.getState().passes;
  const posters = useQrPosterStore.getState().posters;
  return listGatePinFolders(issuerId, [...passes, ...posters]);
}

export function useGatePinFolders(issuerId: string) {
  const passes = useMitraLabsStore((s) => s.passes);
  const posters = useQrPosterStore((s) => s.posters);
  return useMemo(
    () => listGatePinFolders(issuerId, [...passes, ...posters]),
    [issuerId, passes, posters],
  );
}
