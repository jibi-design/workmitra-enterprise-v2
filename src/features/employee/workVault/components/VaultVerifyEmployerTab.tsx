/** Job Mitra | VaultVerifyEmployerTab.tsx | C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\components\VaultVerifyEmployerTab.tsx */

import { useCallback, useState } from "react";
import {
  getEmployerPublicProfile,
  getEmployerReviews,
  type EmployerPublicProfile,
  type EmployerReview,
} from "../../../../shared/employerProfile/employerPublicProfileService";
import { ProfileCard, StatsCard, TagsCard, ReviewsCard } from "./VaultEmployerProfileCards";

export function VaultVerifyEmployerTab() {
  const [jmInput, setJmInput] = useState("");
  const [profile, setProfile] = useState<EmployerPublicProfile | null>(null);
  const [reviews, setReviews] = useState<EmployerReview[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = useCallback(() => {
    const trimmed = jmInput.trim();
    if (!trimmed) {
      setError("Please enter a Mitra Labs ID");
      return;
    }

    setError("");
    const result = getEmployerPublicProfile(trimmed);
    setProfile(result);
    setReviews(result ? getEmployerReviews(trimmed) : []);
    setSearched(true);
  }, [jmInput]);

  const handleClear = useCallback(() => {
    setJmInput("");
    setProfile(null);
    setReviews([]);
    setSearched(false);
    setError("");
  }, []);

  return (
    <div style={{ marginTop: 12 }}>
      <div className="wm-ee-card">
        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--wm-emp-text, #111827)" }}>
          Verify employer
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--wm-emp-muted, #6b7280)",
            marginTop: 4,
            lineHeight: 1.5,
          }}
        >
          Enter an employer Mitra Labs ID to check their rating and track record before applying.
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <input
            className="wm-input"
            value={jmInput}
            onChange={(e) => setJmInput(e.target.value.toUpperCase())}
            placeholder="Enter Mitra Labs ID"
            maxLength={20}
            style={{ flex: 1, fontFamily: "monospace", letterSpacing: 0.5, fontSize: 13 }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            className="wm-primarybtn"
            type="button"
            onClick={handleSearch}
            style={{ background: "var(--wm-er-accent-hr, #7c3aed)", flexShrink: 0 }}
          >
            Search
          </button>
        </div>

        {error && (
          <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-error, #ef4444)" }}>
            {error}
          </div>
        )}
      </div>

      {searched && !profile && (
        <div
          className="wm-ee-card"
          style={{ marginTop: 12, textAlign: "center", padding: "24px 16px" }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-emp-text, #111827)" }}>
            No employer found
          </div>
          <div style={{ fontSize: 12, color: "var(--wm-emp-muted, #6b7280)", marginTop: 4 }}>
            Check the Mitra Labs ID and try again.
          </div>
          <button
            className="wm-outlineBtn"
            type="button"
            onClick={handleClear}
            style={{ marginTop: 12, fontSize: 12 }}
          >
            Clear Search
          </button>
        </div>
      )}

      {profile && (
        <>
          <ProfileCard profile={profile} />
          <StatsCard profile={profile} />
          <TagsCard profile={profile} />
          {reviews.length > 0 && <ReviewsCard reviews={reviews} />}
          <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
            <button
              className="wm-outlineBtn"
              type="button"
              onClick={handleClear}
              style={{ fontSize: 12 }}
            >
              Search Another
            </button>
          </div>
        </>
      )}
    </div>
  );
}
