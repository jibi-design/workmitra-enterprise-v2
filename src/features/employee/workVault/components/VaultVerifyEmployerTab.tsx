/** Job Mitra | VaultVerifyEmployerTab.tsx | C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\components\VaultVerifyEmployerTab.tsx */

import { useCallback, useEffect, useRef, useState } from "react";
import { EnterpriseEmpty } from "../../../../shared/components/enterprise/EnterpriseEmpty";
import { EnterpriseSkeleton } from "../../../../shared/components/enterprise/EnterpriseSkeleton";
import { StatusBadge } from "../../../../shared/components/enterprise/StatusBadge";
import { TrustStrip } from "../../../../shared/components/enterprise/TrustStrip";
import {
  getEmployerPublicProfile,
  getEmployerReviews,
  type EmployerPublicProfile,
  type EmployerReview,
} from "../../../../shared/employerProfile/employerPublicProfileService";
import { ProfileCard, StatsCard, TagsCard, ReviewsCard } from "./VaultEmployerProfileCards";

const ML_ID_HINT = "Letters and numbers, e.g. ML-ER-…";

function normalizeMlId(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

function isPlausibleMlId(value: string): boolean {
  return value.length >= 4 && /^[A-Z0-9][A-Z0-9\-_.]*$/i.test(value);
}

export function VaultVerifyEmployerTab() {
  const [jmInput, setJmInput] = useState("");
  const [profile, setProfile] = useState<EmployerPublicProfile | null>(null);
  const [reviews, setReviews] = useState<EmployerReview[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSearch = useCallback(() => {
    const trimmed = normalizeMlId(jmInput);
    if (!trimmed) {
      setError("Please enter a Mitra Labs ID");
      setSearched(false);
      setProfile(null);
      setReviews([]);
      return;
    }

    if (!isPlausibleMlId(trimmed)) {
      setError("ID format looks incomplete. Use the employer Mitra Labs ID exactly.");
      setSearched(false);
      setProfile(null);
      setReviews([]);
      return;
    }

    setError("");
    setLoading(true);
    setSearched(false);
    setProfile(null);
    setReviews([]);
    setJmInput(trimmed);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const result = getEmployerPublicProfile(trimmed);
      setProfile(result);
      setReviews(result ? getEmployerReviews(trimmed) : []);
      setSearched(true);
      setLoading(false);
    }, 220);
  }, [jmInput]);

  const handleClear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setJmInput("");
    setProfile(null);
    setReviews([]);
    setSearched(false);
    setError("");
    setLoading(false);
  }, []);

  const inputLooksReady = isPlausibleMlId(normalizeMlId(jmInput));

  return (
    <div className="wm-vault-verify" data-testid="vault-verify-employer-tab">
      <TrustStrip
        kind="info"
        tone="neutral"
        title="Verify before you apply"
        message="Look up an employer Mitra Labs ID to review trust level, ratings, and hiring activity."
        badgeLabel="Trust check"
      />

      <div className="wm-vault-verify-search wm-ent-cmd-panel" data-testid="vault-verify-search">
        <div className="wm-ent-cmd-header">
          <div className="wm-ent-cmd-title">Smart employer lookup</div>
          <StatusBadge
            label={inputLooksReady ? "Ready" : "Enter ID"}
            tone={inputLooksReady ? "active" : "neutral"}
          />
        </div>

        <div className="wm-ent-cmd-search">
          <label className="wm-ent-cmd-search-label" htmlFor="vault-verify-ml-id">
            Mitra Labs ID
          </label>
          <div className="wm-vault-verify-search__row">
            <input
              id="vault-verify-ml-id"
              className="wm-ent-cmd-input wm-vault-verify-input"
              value={jmInput}
              onChange={(e) => {
                setJmInput(e.target.value.toUpperCase());
                if (error) setError("");
              }}
              placeholder="ML-…"
              maxLength={24}
              autoComplete="off"
              spellCheck={false}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch();
                }
              }}
            />
            <button
              className="wm-vault-verify-search-btn"
              type="button"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? "Searching…" : "Search"}
            </button>
          </div>
          <div className="wm-vault-verify-hint">{ML_ID_HINT}</div>
          {error ? (
            <div className="wm-vault-verify-error" role="alert">
              {error}
            </div>
          ) : null}
        </div>
      </div>

      {loading ? (
        <div className="wm-vault-verify-loading">
          <EnterpriseSkeleton count={2} domain="career" testId="vault-verify-skeleton" />
        </div>
      ) : null}

      {!loading && searched && !profile ? (
        <div className="wm-vault-verify-empty">
          <EnterpriseEmpty
            title="No employer found"
            subtitle="Check the Mitra Labs ID and try again. Ask the employer for the ID on their company profile."
            primaryLabel="Clear search"
            onPrimary={handleClear}
            domain="career"
          />
        </div>
      ) : null}

      {!loading && profile ? (
        <div className="wm-vault-verify-results wm-vault-verify-results--in">
          <ProfileCard profile={profile} />
          <StatsCard profile={profile} />
          <TagsCard profile={profile} />
          {reviews.length > 0 ? <ReviewsCard reviews={reviews} /> : null}
          <div className="wm-vault-verify-results__footer">
            <button className="wm-vault-verify-clear-btn" type="button" onClick={handleClear}>
              Search Another
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
