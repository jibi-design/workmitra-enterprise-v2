/** Job Mitra | ShiftHomeConfirmWaitingBanner.tsx */

import type { ConfirmWaitingPost } from "../helpers/shiftHomeHelpers";

type Props = {
  readonly waiting: ConfirmWaitingPost;
  readonly onOpen: () => void;
};

export function ShiftHomeConfirmWaitingBanner({ waiting, onOpen }: Props) {
  const n = waiting.shortlisted;
  return (
    <section
      className="wm-er-card"
      data-testid="shift-home-confirm-waiting"
      style={{ padding: "12px 14px" }}
    >
      <div style={{ fontSize: 13, fontWeight: 950, color: "var(--wm-er-text)" }}>
        Confirm {n} waiting
      </div>
      <div style={{ marginTop: 4, fontSize: 12, fontWeight: 700, color: "var(--wm-er-muted)" }}>
        {waiting.jobName}: shortlisted workers still need Confirm Worker to fill the vacancy.
      </div>
      <button type="button" className="wm-primarybtn" onClick={onOpen} style={{ marginTop: 10 }}>
        Open Shortlist
      </button>
    </section>
  );
}
