/** Overflow control for reporting a Shift or Career posting from details. */

import { useEffect, useState } from "react";
import { AUTH_BACKEND_ENABLED } from "../../shared/config/authConfig";
import { fetchHasReported } from "./contentReport.api";
import { ReportPostingModal } from "./ReportPostingModal";
import type { ContentReportDomain } from "./contentReport.types";

type Props = {
  readonly domain: ContentReportDomain;
  readonly postId: string;
  readonly title: string;
  readonly companyName: string;
  readonly employerId?: string;
};

export function ReportPostingControl({
  domain,
  postId,
  title,
  companyName,
  employerId,
}: Props) {
  const [open, setOpen] = useState(false);
  const [reported, setReported] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!AUTH_BACKEND_ENABLED || !postId) return;
    void fetchHasReported(domain, postId)
      .then((value) => {
        if (!cancelled) setReported(value);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [domain, postId]);

  return (
    <div style={{ display: "flex", justifyContent: "flex-end", padding: "4px 2px 0" }}>
      <button
        type="button"
        className="wm-outlineBtn"
        data-testid={`report-posting-${domain}`}
        disabled={reported}
        onClick={() => setOpen(true)}
      >
        {reported ? "Reported" : "Report this posting"}
      </button>
      <ReportPostingModal
        open={open}
        domain={domain}
        postId={postId}
        title={title}
        companyName={companyName}
        employerId={employerId}
        onClose={() => setOpen(false)}
        onReported={() => setReported(true)}
      />
    </div>
  );
}
