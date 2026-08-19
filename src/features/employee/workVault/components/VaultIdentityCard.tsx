// src/features/employee/workVault/components/VaultIdentityCard.tsx

import { StatusBadge } from "../../../../shared/components/enterprise/StatusBadge";

type Props = {
  fullName: string;
  city: string;
  uniqueId: string;
  photoDataUrl: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  showContactVerification?: boolean;
};

export function VaultIdentityCard({
  fullName,
  city,
  uniqueId,
  photoDataUrl,
  phoneVerified,
  emailVerified,
  showContactVerification = true,
}: Props) {
  const initials = (fullName || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="wm-vault-identity-hero" data-testid="vault-identity-hero">
      <div className="wm-vault-identity-hero__avatar" aria-hidden={!photoDataUrl}>
        {photoDataUrl ? (
          <img src={photoDataUrl} alt="" className="wm-vault-identity-hero__photo" />
        ) : (
          <span className="wm-vault-identity-hero__initials">{initials || "WM"}</span>
        )}
      </div>

      <div className="wm-vault-identity-hero__copy">
        <div className="wm-vault-identity-hero__name">{fullName || "Name not set"}</div>
        <div className="wm-vault-identity-hero__city">{city || "City not set"}</div>
        {uniqueId ? <div className="wm-vault-identity-hero__id">{uniqueId}</div> : null}

        {showContactVerification ? (
        <div className="wm-vault-identity-hero__badges">
          <StatusBadge
            label={phoneVerified ? "Phone verified" : "Phone pending"}
            tone={phoneVerified ? "active" : "warning"}
          />
          <StatusBadge
            label={emailVerified ? "Email verified" : "Email pending"}
            tone={emailVerified ? "active" : "warning"}
          />
        </div>
        ) : null}
      </div>
    </div>
  );
}
