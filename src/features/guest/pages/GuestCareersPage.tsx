/** Phase 4 — Guest career browse. */

import { useMemo, useSyncExternalStore } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import {
  getCareerSearchSnapshot,
  getDiscoverableCareerPosts,
  subscribeCareerSearch,
} from "../../employee/careerJobs/helpers/careerSearchHelpers";
import { EmployerTrustBadge } from "../../../shared/employerProfile/EmployerTrustBadge";
import { guestStorage } from "../../../shared/guest/guestStorage";
import { toGuestPublicPlace } from "../../../shared/guest/security/guestSensitiveMask";

export function GuestCareersPage() {
  const nav = useNavigate();
  const posts = useSyncExternalStore(
    subscribeCareerSearch,
    getCareerSearchSnapshot,
    getCareerSearchSnapshot,
  );
  const list = useMemo(() => getDiscoverableCareerPosts(posts), [posts]);
  const shortlist = useSyncExternalStore(
    guestStorage.subscribe,
    () => guestStorage.getShortlistedCareerIds(),
    () => guestStorage.getShortlistedCareerIds(),
  );

  function onSave(postId: string) {
    guestStorage.toggleShortlistCareer(postId);
  }

  return (
    <div data-testid="guest-careers-page" style={{ paddingTop: 14 }}>
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>Career roles</h1>
      <p style={{ marginTop: 6, fontSize: 13, color: "var(--wm-er-muted)" }}>
        Browse without signing in. Apply when ready.
      </p>

      {list.length === 0 ? (
        <div className="wm-ee-card" style={{ marginTop: 16, padding: 16 }}>
          No career posts available on this device yet.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
          {list.map((post) => {
            const saved = shortlist.includes(post.id);
            return (
              <article key={post.id} className="wm-ee-card" style={{ padding: 14 }}>
                <div style={{ fontWeight: 900, fontSize: 15 }}>{post.jobTitle}</div>
                <div style={{ marginTop: 4, fontSize: 12, color: "var(--wm-er-muted)" }}>
                  {post.companyName}
                  {post.location ? ` · ${toGuestPublicPlace(post.location)}` : ""}
                </div>
                <EmployerTrustBadge variant="compact" />
                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="wm-primarybtn"
                    onClick={() => nav(ROUTE_PATHS.guestCareerDetails.replace(":postId", post.id))}
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
