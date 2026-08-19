/** Phase 4 — Guest explore hub. */

import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { guestStorage } from "../../../shared/guest/guestStorage";
import { useSoftAuth } from "../../../shared/guest/useSoftAuth";
import { useSyncExternalStore, useState } from "react";

function EmployerDraftTeaser() {
  const { requireAuthForAction } = useSoftAuth();

  function onCreateDraft() {
    guestStorage.upsertDraft({
      kind: "employer_post",
      targetId: "local_draft",
      payload: { source: "guest_explore" },
    });
    requireAuthForAction({
      action: "create_shift",
      targetId: "local_draft",
      returnPath: ROUTE_PATHS.explore,
      roleHint: "employer",
      payload: { phase: "enter", source: "guest_explore" },
    });
  }

  return (
    <section className="wm-ee-card" style={{ marginTop: 14, padding: 16 }}>
      <div style={{ fontWeight: 900, fontSize: 15 }}>Hiring? Start a draft</div>
      <p style={{ marginTop: 4, fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.45 }}>
        Build a post on this device. Publishing live still requires sign-in and verification
        maturity.
      </p>
      <button
        type="button"
        className="wm-outlineBtn"
        style={{ marginTop: 10 }}
        onClick={onCreateDraft}
      >
        Create draft
      </button>
    </section>
  );
}

export function GuestExplorePage() {
  const shadow = useSyncExternalStore(
    guestStorage.subscribe,
    () => guestStorage.getShadowProfile(),
    () => guestStorage.getShadowProfile(),
  );
  const [city, setCity] = useState(shadow.preferredCity);
  const [radius, setRadius] = useState(String(shadow.searchRadiusKm));
  const [skills, setSkills] = useState(shadow.skills.join(", "));

  function saveShadow() {
    guestStorage.saveShadowProfile({
      preferredCity: city.trim(),
      searchRadiusKm: Math.max(1, Number(radius) || 25),
      skills: skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
  }

  return (
    <div data-testid="guest-explore-page" style={{ paddingTop: 16 }}>
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: "#0f172a" }}>Explore work</h1>
      <p style={{ marginTop: 8, color: "var(--wm-er-muted)", lineHeight: 1.5, fontSize: 14 }}>
        Browse shifts and careers without signing in. Apply or save when you are ready — we will
        continue right where you left off.
      </p>

      <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
        <Link
          to={ROUTE_PATHS.guestShifts}
          className="wm-ee-card"
          style={{ padding: 16, textDecoration: "none", color: "inherit" }}
        >
          <div style={{ fontWeight: 900, fontSize: 16 }}>Open shifts</div>
          <div style={{ marginTop: 4, fontSize: 12, color: "var(--wm-er-muted)" }}>
            Day work near you — trust badges included
          </div>
        </Link>
        <Link
          to={ROUTE_PATHS.guestCareers}
          className="wm-ee-card"
          style={{ padding: 16, textDecoration: "none", color: "inherit" }}
        >
          <div style={{ fontWeight: 900, fontSize: 16 }}>Career roles</div>
          <div style={{ marginTop: 4, fontSize: 12, color: "var(--wm-er-muted)" }}>
            Longer-term jobs — browse first, apply later
          </div>
        </Link>
      </div>

      <EmployerDraftTeaser />

      <section
        className="wm-ee-card"
        style={{ marginTop: 18, padding: 16 }}
        data-testid="guest-shadow-profile"
      >
        <div style={{ fontWeight: 900, fontSize: 15 }}>Your preferences (this device)</div>
        <p style={{ marginTop: 4, fontSize: 12, color: "var(--wm-er-muted)" }}>
          Saved locally as guest data — syncs into your profile after sign-in.
        </p>
        <label style={{ display: "grid", gap: 4, marginTop: 12, fontSize: 12, fontWeight: 700 }}>
          Preferred city
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{ padding: 8, borderRadius: 8, border: "1px solid #e2e8f0" }}
          />
        </label>
        <label style={{ display: "grid", gap: 4, marginTop: 10, fontSize: 12, fontWeight: 700 }}>
          Search radius (km)
          <input
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            inputMode="numeric"
            style={{ padding: 8, borderRadius: 8, border: "1px solid #e2e8f0" }}
          />
        </label>
        <label style={{ display: "grid", gap: 4, marginTop: 10, fontSize: 12, fontWeight: 700 }}>
          Skills (comma-separated)
          <input
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            style={{ padding: 8, borderRadius: 8, border: "1px solid #e2e8f0" }}
          />
        </label>
        <button
          type="button"
          className="wm-primarybtn"
          style={{ marginTop: 12 }}
          onClick={saveShadow}
        >
          Save preferences
        </button>
      </section>
    </div>
  );
}
