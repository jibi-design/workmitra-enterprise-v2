// App name: Job Mitra
// File name: CareerCandidateSnapshotCard.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\candidateReview\CareerCandidateSnapshotCard.tsx

import type { CareerApplicationProfileSnapshot } from "../../types/careerTypes";
import { InfoBox, ReviewCard, SkillChips } from "./careerCandidateReviewUi";

export function CareerCandidateSnapshotCard({
  profile,
}: {
  profile?: CareerApplicationProfileSnapshot;
}) {
  return (
    <ReviewCard
      title="Candidate snapshot"
      subtitle="Profile information submitted with this application."
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <InfoBox label="Location" value={profile?.city || "Not specified"} />
        <InfoBox label="Experience" value={profile?.experience || "Not specified"} />
      </div>

      <div style={{ marginTop: 8 }}>
        <InfoBox
          label="Languages"
          value={profile?.languages?.length ? profile.languages.join(", ") : "Not specified"}
        />
      </div>

      <SkillChips skills={profile?.skills ?? []} />
    </ReviewCard>
  );
}
