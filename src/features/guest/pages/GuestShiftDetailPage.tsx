/** Phase 4 — Guest shift detail + soft-auth apply/save. */

import { useMemo, useSyncExternalStore } from "react";
import { Link, useParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import {
  getShiftSearchPostsSnapshot,
  subscribeShiftSearchPosts,
} from "../../employee/shiftJobs/storage/shiftSearch.storage";
import { EmployerTrustBadge } from "../../../shared/employerProfile/EmployerTrustBadge";
import { guestStorage } from "../../../shared/guest/guestStorage";
import { useSoftAuth } from "../../../shared/guest/useSoftAuth";

export function GuestShiftDetailPage() {
  const { postId = "" } = useParams();
  const { requireAuthForAction } = useSoftAuth();
  const posts = useSyncExternalStore(
    subscribeShiftSearchPosts,
    getShiftSearchPostsSnapshot,
    getShiftSearchPostsSnapshot,
  );
  const shortlist = useSyncExternalStore(
    guestStorage.subscribe,
    () => guestStorage.getShortlistedShiftIds(),
    () => guestStorage.getShortlistedShiftIds(),
  );

  const post = useMemo(() => posts.find((p) => p.id === postId) ?? null, [posts, postId]);
  const returnPath = ROUTE_PATHS.guestShiftDetails.replace(":postId", postId);
  const saved = shortlist.includes(postId);

  function onApply() {
    const allowed = requireAuthForAction({
      action: "apply_shift",
      targetId: postId,
      returnPath,
      roleHint: "employee",
    });
    guestStorage.upsertDraft({
      kind: "shift_apply",
      targetId: postId,
      payload: { source: "guest_shift_detail" },
    });
    if (!allowed) return;
    // Authed guests-in-shell should use employee detail; send them there.
    window.location.hash = `#${ROUTE_PATHS.employeeShiftPostDetails.replace(":postId", postId)}`;
  }

  function onSave() {
    guestStorage.toggleShortlistShift(postId);
    requireAuthForAction({
      action: "save_shift",
      targetId: postId,
      returnPath,
      roleHint: "employee",
    });
  }

  if (!post) {
    return (
      <div style={{ paddingTop: 16 }}>
        <p>Shift not found.</p>
        <Link to={ROUTE_PATHS.guestShifts}>Back to shifts</Link>
      </div>
    );
  }

  return (
    <div data-testid="guest-shift-detail" style={{ paddingTop: 14 }}>
      <Link to={ROUTE_PATHS.guestShifts} style={{ fontSize: 13, fontWeight: 700 }}>
        ← Shifts
      </Link>
      <h1 style={{ margin: "10px 0 0", fontSize: 24, fontWeight: 900 }}>{post.jobName}</h1>
      <div style={{ marginTop: 6, fontSize: 13, color: "var(--wm-er-muted)" }}>
        {post.companyName} · {post.locationName}
      </div>
      <EmployerTrustBadge variant="full" showEmptyHint />
      <div style={{ marginTop: 12, fontSize: 18, fontWeight: 900, color: "#16a34a" }}>
        £{post.payPerDay} / day
      </div>
      <p style={{ marginTop: 12, fontSize: 14, lineHeight: 1.5, color: "#334155" }}>
        Review pay, location, and employer verification before you apply. Signing in keeps your
        progress and returns you to this shift.
      </p>
      <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
        <button type="button" className="wm-primarybtn" onClick={onApply}>
          Apply
        </button>
        <button type="button" className="wm-outlineBtn" onClick={onSave}>
          {saved ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}
