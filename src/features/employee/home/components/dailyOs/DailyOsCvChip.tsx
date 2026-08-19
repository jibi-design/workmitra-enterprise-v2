/** Candidate Pro Daily OS — missing-CV nudge to Profile upload. */

import { useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { FileUp } from "lucide-react";
import { ROUTE_PATHS } from "../../../../../app/router/routePaths";
import {
  hasVaultCvDocument,
  subscribeVaultCv,
} from "../../../profile/helpers/profileCvVault.helpers";

export function DailyOsCvChip() {
  const nav = useNavigate();
  const hasCv = useSyncExternalStore(subscribeVaultCv, hasVaultCvDocument, () => false);
  if (hasCv) return null;

  return (
    <button
      type="button"
      className="wm-dailyOsCvChip"
      data-testid="daily-os-cv-chip"
      onClick={() => nav({ pathname: ROUTE_PATHS.employeeProfile, search: "?uploadCv=1" })}
    >
      <FileUp size={14} strokeWidth={2.25} aria-hidden="true" />
      Upload CV in Profile (+20%)
    </button>
  );
}
