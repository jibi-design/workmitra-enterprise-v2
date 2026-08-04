/** Phase 4 — Guest career detail + soft-auth apply/save. */

import { useMemo, useSyncExternalStore } from "react";
import { Link, useParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import {
  getCareerSearchSnapshot,
  getDiscoverableCareerPosts,
  subscribeCareerSearch,
} from "../../employee/careerJobs/helpers/careerSearchHelpers";
import { EmployerTrustBadge } from "../../../shared/employerProfile/EmployerTrustBadge";
import { guestStorage } from "../../../shared/guest/guestStorage";
import { useSoftAuth } from "../../../shared/guest/useSoftAuth";

export function GuestCareerDetailPage() {
  const { postId = "" } = useParams();
  const { requireAuthForAction } = useSoftAuth();
  const allPosts = useSyncExternalStore(
    subscribeCareerSearch,
    getCareerSearchSnapshot,
    getCareerSearchSnapshot,
  );
  const posts = useMemo(() => getDiscoverableCareerPosts(allPosts), [allPosts]);
  const shortlist = useSyncExternalStore(
    guestStorage.subscribe,
    () => guestStorage.getShortlistedCareerIds(),
    () => guestStorage.getShortlistedCareerIds(),
  );

  const post = useMemo(() => posts.find((p) => p.id === postId) ?? null, [posts, postId]);
  const returnPath = ROUTE_PATHS.guestCareerDetails.replace(":postId", postId);
  const saved = shortlist.includes(postId);

  function onApply() {
    guestStorage.upsertDraft({
      kind: "career_apply",
      targetId: postId,
      payload: { source: "guest_career_detail" },
    });
    const allowed = requireAuthForAction({
      action: "apply_career",
      targetId: postId,
      returnPath,
      roleHint: "employee",
    });
    if (!allowed) return;
    window.location.hash = `#${ROUTE_PATHS.employeeCareerPostDetails.replace(":postId", postId)}`;
  }

  function onSave() {
    guestStorage.toggleShortlistCareer(postId);
    requireAuthForAction({
      action: "save_career",
      targetId: postId,
      returnPath,
      roleHint: "employee",
    });
  }

  if (!post) {
    return (
      <div style={{ paddingTop: 16 }}>
        <p>Role not found.</p>
        <Link to={ROUTE_PATHS.guestCareers}>Back to careers</Link>
      </div>
    );
  }

  return (
    <div data-testid="guest-career-detail" style={{ paddingTop: 14 }}>
      <Link to={ROUTE_PATHS.guestCareers} style={{ fontSize: 13, fontWeight: 700 }}>
        ← Careers
      </Link>
      <h1 style={{ margin: "10px 0 0", fontSize: 24, fontWeight: 900 }}>{post.jobTitle}</h1>
      <div style={{ marginTop: 6, fontSize: 13, color: "var(--wm-er-muted)" }}>
        {post.companyName}
        {post.location ? ` · ${post.location}` : ""}
      </div>
      <EmployerTrustBadge variant="full" showEmptyHint />
      <p style={{ marginTop: 12, fontSize: 14, lineHeight: 1.5, color: "#334155" }}>
        {post.description?.trim() || "Review this role and employer verification before applying."}
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
