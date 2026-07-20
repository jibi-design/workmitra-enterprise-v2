// App name: Job Mitra
// Prominent direct-invite CTA below favorite worker availability.

import type { InviteTarget } from "../../types/employerFavorites.types";

type Props = {
  target: InviteTarget;
  onOpenInvite: (target: InviteTarget) => void;
};

export function FavoriteWorkerInviteButton({ target, onOpenInvite }: Props) {
  return (
    <div style={{ marginTop: 10 }}>
      <button
        type="button"
        className="wm-press-btn wm-outlineBtn"
        data-testid="favorite-invite-to-shift-btn"
        onClick={() => onOpenInvite(target)}
        style={{
          width: "100%",
        }}
      >
        Invite to Shift
      </button>
    </div>
  );
}
