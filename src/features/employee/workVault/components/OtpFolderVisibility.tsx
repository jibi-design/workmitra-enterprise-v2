// src/features/employee/workVault/components/OtpFolderVisibility.tsx

import type { VaultFolder } from "../types/vaultTypes";

type OtpFolderVisibilityProps = {
  folders: VaultFolder[];
  visibleCount: number;
  hiddenCount: number;
  onToggleFolder: (folderId: string) => void;
  onBulkVisibility: (visibility: "visible" | "hidden") => void;
};

export function OtpFolderVisibility({
  folders,
  visibleCount,
  hiddenCount,
  onToggleFolder,
  onBulkVisibility,
}: OtpFolderVisibilityProps) {
  const sorted = [...folders].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <section className="wm-vault-otp-folders" data-testid="vault-otp-folders">
      <div className="wm-vault-otp-folders__head">
        <div>
          <div className="wm-vault-acl-card__title">Access grant folders</div>
          <div className="wm-vault-acl-card__sub">
            {visibleCount} granted · {hiddenCount} locked from OTP share
          </div>
        </div>
        <div className="wm-vault-otp-folders__actions">
          <button
            type="button"
            className="wm-vault-docs-chip-btn wm-vault-docs-chip-btn--show"
            onClick={() => onBulkVisibility("visible")}
          >
            Grant All
          </button>
          <button
            type="button"
            className="wm-vault-docs-chip-btn wm-vault-docs-chip-btn--hide"
            onClick={() => onBulkVisibility("hidden")}
          >
            Lock All
          </button>
        </div>
      </div>

      <div className="wm-vault-acl-card__counters">
        <div className="wm-vault-acl-counter">
          <div className="wm-vault-acl-counter__value">{visibleCount}</div>
          <div className="wm-vault-acl-counter__label">Visible</div>
        </div>
        <div className="wm-vault-acl-counter">
          <div className="wm-vault-acl-counter__value">{hiddenCount}</div>
          <div className="wm-vault-acl-counter__label">Locked</div>
        </div>
      </div>

      <div className="wm-vault-otp-folders__list">
        {sorted.map((folder) => {
          const isVisible = folder.visibility === "visible";
          return (
            <div key={folder.id} className="wm-vault-otp-folder-row">
              <div className="wm-vault-otp-folder-row__name">{folder.name}</div>
              <button
                type="button"
                className={`wm-vault-otp-folder-toggle${
                  isVisible ? " wm-vault-otp-folder-toggle--on" : " wm-vault-otp-folder-toggle--off"
                }`}
                onClick={() => onToggleFolder(folder.id)}
              >
                {isVisible ? "Granted" : "Locked"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
