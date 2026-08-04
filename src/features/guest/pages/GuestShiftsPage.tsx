/** Phase 4 — Guest shift browse (public value). */

import { useMemo, useSyncExternalStore } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import {
  getShiftSearchPostsSnapshot,
  subscribeShiftSearchPosts,
} from "../../employee/shiftJobs/storage/shiftSearch.storage";
import { isShiftOpenForDiscovery } from "../../employee/shiftJobs/helpers/shiftSearchViewHelpers";
import { EmployerTrustBadge } from "../../../shared/employerProfile/EmployerTrustBadge";
import { guestStorage } from "../../../shared/guest/guestStorage";
import { useSoftAuth } from "../../../shared/guest/useSoftAuth";

export function GuestShiftsPage() {
  const nav = useNavigate();
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

  const openPosts = useMemo(() => posts.filter((p) => isShiftOpenForDiscovery(p)), [posts]);

  function onSave(postId: string) {
    const returnPath = ROUTE_PATHS.guestShifts;
    const allowed = requireAuthForAction({
      action: "save_shift",
      targetId: postId,
      returnPath,
      roleHint: "employee",
    });
    // Always shortlist locally for guest utility (Wave 2).
    guestStorage.toggleShortlistShift(postId);
    if (!allowed) return;
  }

  return (
    <div data-testid="guest-shifts-page" style={{ paddingTop: 14 }}>
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>Open shifts</h1>
      <p style={{ marginTop: 6, fontSize: 13, color: "var(--wm-er-muted)" }}>
        Browse freely. Saving or applying may ask you to sign in — then we resume here.
      </p>

      {openPosts.length === 0 ? (
        <div className="wm-ee-card" style={{ marginTop: 16, padding: 16 }}>
          No open shifts on this device yet. Sign in as an employer to publish, or check back soon.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
          {openPosts.map((post) => {
            const saved = shortlist.includes(post.id);
            return (
              <article key={post.id} className="wm-ee-card" style={{ padding: 14 }}>
                <div style={{ fontWeight: 900, fontSize: 15 }}>{post.jobName}</div>
                <div style={{ marginTop: 4, fontSize: 12, color: "var(--wm-er-muted)" }}>
                  {post.companyName} · {post.locationName}
                </div>
                <EmployerTrustBadge variant="compact" />
                <div style={{ marginTop: 8, fontSize: 14, fontWeight: 850, color: "#16a34a" }}>
                  £{post.payPerDay} / day
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="wm-primarybtn"
                    onClick={() => nav(ROUTE_PATHS.guestShiftDetails.replace(":postId", post.id))}
                  >
                    View details
                  </button>
                  <button type="button" className="wm-outlineBtn" onClick={() => onSave(post.id)}>
                    {saved ? "Saved" : "Save"}
                  </button>
                  <Link to={ROUTE_PATHS.explore} style={{ fontSize: 12, alignSelf: "center" }}>
                    Explore hub
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
