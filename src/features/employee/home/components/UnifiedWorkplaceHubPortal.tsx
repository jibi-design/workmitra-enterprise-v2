/** Job Mitra | UnifiedWorkplaceHubPortal.tsx | Work Vault portal (z50 / scroll lock) */

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { DOMAIN_BY_KEY, getDomainCopy } from "../../../../shared/config/domainRegistry";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function UnifiedWorkplaceHubPortal({ open, onClose }: Props) {
  const nav = useNavigate();

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

  if (!open || typeof document === "undefined") {
    return null;
  }

  const vaultDomain = DOMAIN_BY_KEY.vault;

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
            <p className="wm-homeHubPortal__sub">Work Vault</p>
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
            className="wm-homeHubPortalCard wm-homeHubPortalCard--vault wm-press-card"
            onClick={() => {
              onClose();
              nav(ROUTE_PATHS.employeeVaultHome);
            }}
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
