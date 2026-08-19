/** Job Mitra | EmployerShiftWorkspaceArchiveControl.tsx | Close / Archive Group */

import { useState } from "react";
import { ConfirmModal, type ConfirmData } from "../../../../shared/components/ConfirmModal";
import { getEmployerShiftPost, updateEmployerShiftPost } from "../storage/employerShift.postActions.crud";
import { buildShiftOpsGroupDisplayName } from "../helpers/shiftOpsGroupDisplayName";
import {
  ensureShiftOpsSiteForPost,
  resolveShiftOpsSiteIdForPost,
} from "../../../shared/shiftOps/shiftJobsMembershipBridge";
import { archiveShiftOpsGroup } from "../../../shift/services/archiveShiftOpsGroup";
import { expandShiftPostIdAliases } from "../../../shift/utils/shiftIdBridge";

type Props = {
  postId: string;
  workerMlId: string;
  enabled: boolean;
};

export function EmployerShiftWorkspaceArchiveControl({ postId, workerMlId, enabled }: Props) {
  const [confirm, setConfirm] = useState<ConfirmData | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (!enabled && !done) return null;

  function requestArchive() {
    setConfirm({
      title: "Close / Archive Group?",
      message:
        "This archives the Shift Ops group so it leaves active messaging lists. Reviews stay on the work wall.",
      tone: "warn",
      confirmLabel: "Close / Archive Group",
      cancelLabel: "Keep open",
    });
  }

  async function runArchive() {
    setConfirm(null);
    setBusy(true);
    const post = getEmployerShiftPost(postId);
    let siteId = resolveShiftOpsSiteIdForPost(post ?? {}) ?? "";
    if (!siteId && post) {
      const ensured = await ensureShiftOpsSiteForPost({
        postId,
        displayName: buildShiftOpsGroupDisplayName(post),
        existingSiteId: post.siteId,
        planId: post.planId,
        persistSiteId: (nextId) => {
          updateEmployerShiftPost(postId, { siteId: nextId });
        },
      });
      if (ensured.ok) siteId = ensured.siteId;
    }
    const result = await archiveShiftOpsGroup({
      siteId,
      workerMlId,
      jobPostKeys: expandShiftPostIdAliases(postId),
    });
    setBusy(false);
    if (result.ok) setDone(true);
  }

  if (done) {
    return (
      <div style={{ marginTop: 12, fontSize: 12, fontWeight: 800, color: "var(--wm-er-muted)" }}>
        Group archived. It is no longer in active messaging lists.
      </div>
    );
  }

  return (
    <>
      <ConfirmModal confirm={confirm} onConfirm={() => void runArchive()} onCancel={() => setConfirm(null)} />
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 850, color: "var(--wm-er-muted)", marginBottom: 8 }}>
          Shift Completed · Ready to Close
        </div>
        <button
          type="button"
          className="wm-outlineBtn"
          data-testid="shift-ops-archive-group"
          disabled={busy}
          onClick={requestArchive}
        >
          Close / Archive Group
        </button>
      </div>
    </>
  );
}
