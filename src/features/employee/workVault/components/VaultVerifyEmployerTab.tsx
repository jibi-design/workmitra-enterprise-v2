// src/features/employee/workVault/components/VaultVerifyEmployerTab.tsx
//
// Vault "Verify Employer" tab — search employer by WM ID.
// Shows: public profile, rating breakdown, worker reviews.

import { useCallback, useState } from "react";
import {
  getEmployerPublicProfile,
  getEmployerReviews,
  type EmployerPublicProfile,
  type EmployerReview,
} from "../../../../shared/employerProfile/employerPublicProfileService";
import { ProfileCard, StatsCard, TagsCard, ReviewsCard } from "./VaultEmployerProfileCards";

/* ── Component ─────────────────────────────────── */

export function VaultVerifyEmployerTab() {
  const [wmInput, setWmInput] = useState("");
  const [profile, setProfile] = useState<EmployerPublicProfile | null>(null);
  const [reviews, setReviews] = useState<EmployerReview[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = useCallback(() => {
    const trimmed = wmInput.trim();
    if (!trimmed) { setError("Please enter a WorkMitra ID"); return; }
    setError("");
    const result = getEmployerPublicProfile(trimmed);
    setProfile(result);
    setReviews(result ? getEmployerReviews(trimmed) : []);
    setSearched(true);
  }, [wmInput]);

  const handleClear = useCallback(() => {
    setWmInput(""); setProfile(null); setReviews([]); setSearched(false); setError("");
  }, []);

  return (
    <div style={{ marginTop: 12 }}>
      {/* Search */}
      <div className="wm-ee-card">
        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--wm-emp-text, #111827)" }}>
          Verify employer
        </div>
        <div style={{ fontSize: 12, color: "var(--wm-emp-muted, #6b7280)", marginTop: 4, lineHeight: 1.5 }}>
          Enter an employer WorkMitra ID to check their rating and track record before applying.
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <input
            className="wm-input" value={wmInput}
            onChange={(e) => setWmInput(e.target.value.toUpperCase())}
            placeholder="Enter WorkMitra ID" maxLength={20}
            style={{ flex: 1, fontFamily: "monospace", letterSpacing: 0.5, fontSize: 13 }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="wm-primarybtn" type="button" onClick={handleSearch}
            style={{ background: "var(--wm-er-accent-hr, #7c3aed)", flexShrink: 0 }}>
            Search
          </button>
        </div>
        {error && <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-error, #ef4444)" }}>{error}</div>}
      </div>

      {/* Not found */}
      {searched && !profile && (
        <div className="wm-ee-card" style={{ marginTop: 12, textAlign: "center", padding: "24px 16px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-emp-text, #111827)" }}>
            No employer found
          </div>
          <div style={{ fontSize: 12, color: "var(--wm-emp-muted, #6b7280)", marginTop: 4 }}>
            Check the WorkMitra ID and try again.
          </div>
          <button className="wm-outlineBtn" type="button" onClick={handleClear} style={{ marginTop: 12, fontSize: 12 }}>
            Clear Search
          </button>
        </div>
      )}

      {/* Profile found */}
      {profile && (
        <>
          <ProfileCard profile={profile} />
          <StatsCard profile={profile} />
          <TagsCard profile={profile} />
          {reviews.length > 0 && <ReviewsCard reviews={reviews} />}
          <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
            <button className="wm-outlineBtn" type="button" onClick={handleClear} style={{ fontSize: 12 }}>
              Search Another
            </button>
          </div>
        </>
      )}
    </div>
  );
}