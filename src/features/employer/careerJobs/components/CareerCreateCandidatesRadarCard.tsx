/** Job Mitra | Blind Career candidate count on create. No codes shown. */

import { useEffect, useState } from "react";
import { AUTH_BACKEND_ENABLED } from "../../../../shared/config/authConfig";
import { fetchCareerCandidatesRadarCount } from "../../../career/services/careerLocationApi";
import { parsePincode } from "../../../shared/location/pincode";

type Props = {
  locationPincode: string;
};

export function CareerCreateCandidatesRadarCard({ locationPincode }: Props) {
  const pin = parsePincode(locationPincode);
  const enabled = AUTH_BACKEND_ENABLED && Boolean(pin);
  const [fetched, setFetched] = useState<{ pin: string; count: number } | null>(null);

  useEffect(() => {
    if (!enabled || !pin) return;
    const requestedPin = pin;
    let cancelled = false;
    void fetchCareerCandidatesRadarCount(requestedPin)
      .then((next) => {
        if (!cancelled) setFetched({ pin: requestedPin, count: next });
      })
      .catch(() => {
        if (!cancelled) setFetched({ pin: requestedPin, count: 0 });
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, pin]);

  const count = enabled && fetched?.pin === pin ? fetched.count : 0;
  const hasMatches = count > 0;
  const label = count === 1 ? "matching candidate" : "matching candidates";

  return (
    <div className="wm-career-candidates-radar" role="status" aria-live="polite">
      <div className="wm-career-candidates-radar__title">Local candidate pool</div>
      {hasMatches ? (
        <p className="wm-career-candidates-radar__copy">
          <strong>{count}</strong> {label} in range.
        </p>
      ) : (
        <p className="wm-career-candidates-radar__copy">
          Matching candidates will show as a number only. No names.
        </p>
      )}
    </div>
  );
}
