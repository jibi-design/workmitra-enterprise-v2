/** Job Mitra | UnifiedWorkplaceHubPortal.tsx | Company Work Log + Vault portal (z50 / scroll lock) */

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { DOMAIN_BY_KEY, getDomainCopy } from "../../../../shared/config/domainRegistry";
import { parseEmploymentSnapshot, readEmploymentSnapshot } from "./CurrentEmploymentCard.helpers";
import { employmentLifecycleStorage } from "../../employment/storage/employmentLifecycle.storage";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function UnifiedWorkplaceHubPortal({ open, onClose }: Props) {
  const nav = useNavigate();

  const subscribeEmployment = useCallback((cb: () => void) => {
    return employmentLifecycleStorage.subscribe(cb);
  }, []);

  const rawEmployment = useSyncExternalStore(
    subscribeEmployment,
    readEmploymentSnapshot,
    readEmploymentSnapshot,
  );
  const employment = useMemo(() => parseEmploymentSnapshot(rawEmployment), [rawEmployment]);

  useEffect(() => {
    if (!open) return;

    document.body.classList.add("wm-homeHubPortal-open");
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.classList.remove("wm-homeHubPortal-open");
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const openDiary = useCallback(() => {
    onClose();
    if (employment) {
      nav(ROUTE_PATHS.employeeEmploymentDetail.replace(":employmentId", employment.id));
      return;
    }
    nav(ROUTE_PATHS.employeeCareerHome);
  }, [employment, nav, onClose]);

  const openVault = useCallback(() => {
    onClose();
    nav(ROUTE_PATHS.employeeVaultHome);
  }, [nav, onClose]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  const vaultDomain = DOMAIN_BY_KEY.vault;
  const diarySubtitle = employment
    ? `${employment.jobTitle} · ${employment.companyName}`
    : "Open when employment is active";
  const diaryCta = employment ? "Open Company Work Log" : "Start from Career";

  return createPortal(
    <div
      className="wm-homeHubPortal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wm-home-hub-portal-title"
      data-testid="unified-workplace-hub-portal"
    >
      <button
        type="button"
        className="wm-homeHubPortal__backdrop"
        aria-label="Close Workplace Hub"
        onClick={onClose}
      />
      <div className="wm-homeHubPortal__sheet">
        <div className="wm-homeHubPortal__head">
          <div>
            <h2 id="wm-home-hub-portal-title" className="wm-homeHubPortal__title">
              Workplace Hub
            </h2>
            <p className="wm-homeHubPortal__sub">
              Company Work Log and Work Vault stay separate modules
            </p>
          </div>
          <button
            type="button"
            className="wm-homeHubPortal__close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="wm-homeHubPortal__cards">
          <button
            type="button"
            className="wm-homeHubPortalCard wm-homeHubPortalCard--diary wm-press-card"
            onClick={openDiary}
            data-testid="hub-portal-diary"
            aria-label={`Company Work Log. ${diarySubtitle}`}
          >
            <div className="wm-homeHubPortalCard__title">Company Work Log</div>
            <div className="wm-homeHubPortalCard__sub">{diarySubtitle}</div>
            <div className="wm-homeHubPortalCard__cta">{diaryCta}</div>
          </button>

          <button
            type="button"
            className="wm-homeHubPortalCard wm-homeHubPortalCard--vault wm-press-card"
            onClick={openVault}
            data-testid="hub-portal-vault"
            aria-label={`Open ${vaultDomain.title}`}
          >
            <div className="wm-homeHubPortalCard__title">{vaultDomain.title}</div>
            <div className="wm-homeHubPortalCard__sub">{getDomainCopy("vault", "employee")}</div>
            <div className="wm-homeHubPortalCard__cta">Open Vault</div>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
