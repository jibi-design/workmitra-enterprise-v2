// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerInviteToShiftModal.tsx
// Way 2 — invite favorite worker to an active shift post (direct invite pipeline).

import { useMemo, useState } from "react";
import { employerShiftStorage } from "../../shiftJobs/storage/employerShift.storage";
import { sendShiftDirectInvite } from "../services/shiftDirectInvite.service";
import type { InviteTarget } from "../types/employerFavorites.types";
import { EmployerInviteFormState } from "./inviteToShift/EmployerInviteFormState";
import { EmployerInviteSentState } from "./inviteToShift/EmployerInviteSentState";
import { EmployerInviteToShiftShell } from "./inviteToShift/EmployerInviteToShiftShell";

type EmployerInviteToShiftModalProps = {
  target: InviteTarget;
  onClose: () => void;
};

export function EmployerInviteToShiftModal({ target, onClose }: EmployerInviteToShiftModalProps) {
  const openPosts = useMemo(
    () =>
      employerShiftStorage
        .getPosts()
        .filter((post) => post.status === "active" && !post.isHiddenFromSearch),
    [],
  );

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState("");

  function handleSend() {
    if (!selectedPostId) return;

    const post = openPosts.find((item) => item.id === selectedPostId);
    if (!post) return;

    const ok = sendShiftDirectInvite({
      postId: post.id,
      workerWmId: target.workerWmId,
      workerName: target.workerName,
    });

    if (!ok) {
      setSendError("Could not send invite. Choose an active shift post and try again.");
      return;
    }

    setSendError("");
    setSent(true);
  }

  return (
    <EmployerInviteToShiftShell onClose={onClose}>
      {sent ? (
        <EmployerInviteSentState workerName={target.workerName} onClose={onClose} />
      ) : (
        <EmployerInviteFormState
          workerName={target.workerName}
          selectedPostId={selectedPostId}
          openPosts={openPosts}
          sendError={sendError}
          onSelectedPostIdChange={(postId) => {
            setSendError("");
            setSelectedPostId(postId);
          }}
          onClose={onClose}
          onSend={handleSend}
        />
      )}
    </EmployerInviteToShiftShell>
  );
}
