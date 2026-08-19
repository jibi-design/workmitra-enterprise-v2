/** Candidate Pro — WorkVault quick access. */

import { FileCheck2, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../../app/router/routePaths";
import type { VaultQuickDoc } from "../../helpers/candidateDashboard.helpers";

type Props = {
  readonly docs: readonly VaultQuickDoc[];
};

export function CandidateVaultQuickPanel({ docs }: Props) {
  const nav = useNavigate();

  return (
    <section className="wm-dashWidget" data-testid="candidate-vault-quick">
      <div className="wm-dashWidget__kicker">WorkVault</div>
      <h2 className="wm-dashWidget__title">Verified documents</h2>
      <p className="wm-dashWidget__sub">Quick view and share from your sealed vault.</p>

      {docs.length === 0 ? (
        <div className="wm-candEmpty">
          No documents uploaded yet.{" "}
          <button
            type="button"
            className="wm-linkBtn"
            onClick={() => nav(ROUTE_PATHS.employeeVaultHome)}
          >
            Open WorkVault
          </button>
        </div>
      ) : (
        <ul className="wm-candVaultList">
          {docs.map((doc) => (
            <li key={doc.id} className="wm-candVaultList__item">
              <div className="wm-candVaultList__icon" aria-hidden="true">
                <FileCheck2 size={16} />
              </div>
              <div className="wm-candVaultList__copy">
                <div className="wm-candVaultList__name">{doc.name}</div>
                <div className="wm-candVaultList__meta">{doc.fileType.toUpperCase()}</div>
              </div>
              <button
                type="button"
                className="wm-outlineBtn wm-candVaultList__share"
                aria-label={`Share ${doc.name}`}
                onClick={() =>
                  nav(ROUTE_PATHS.employeeVaultFolder.replace(":folderId", doc.folderId))
                }
              >
                <Share2 size={14} />
                Open
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="wm-candVaultActions">
        <button
          type="button"
          className="wm-primarybtn"
          onClick={() => nav(ROUTE_PATHS.employeeVaultHome)}
        >
          Open WorkVault
        </button>
        <button
          type="button"
          className="wm-outlineBtn"
          onClick={() => nav(ROUTE_PATHS.employeeVaultOtp)}
        >
          Share access OTP
        </button>
      </div>
    </section>
  );
}
