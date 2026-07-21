export const MIN_REVIEWS_FOR_VISIBLE_SCORE = 3;

export function getMainRatingLabel(rating: number | null, totalReviews: number): string {
  if (totalReviews === 0 || rating === null) return "No work rating yet";
  if (totalReviews < MIN_REVIEWS_FOR_VISIBLE_SCORE) return "Rating building";
  return `${rating.toFixed(1)} / 5`;
}

export function getConfidenceLabel(totalReviews: number): string {
  if (totalReviews === 0) return "No rating yet";
  if (totalReviews < 3) return "Early rating";
  if (totalReviews <= 5) return "Building reputation";
  if (totalReviews <= 10) return "Trusted record";
  return "Strong work reputation";
}

export function getConfidenceBody(rating: number | null, totalReviews: number): string {
  if (totalReviews === 0 || rating === null) {
    return "Completed work ratings will appear here after eligible completed assignments are reviewed.";
  }

  if (totalReviews < MIN_REVIEWS_FOR_VISIBLE_SCORE) {
    return `${rating.toFixed(1)} / 5 from ${totalReviews} completed work review${
      totalReviews === 1 ? "" : "s"
    }. More completed reviews are needed before showing this as a strong reputation score.`;
  }

  if (totalReviews <= 5) {
    return `Based on ${totalReviews} completed work reviews. This rating is still building reputation.`;
  }

  if (totalReviews <= 10) {
    return `Based on ${totalReviews} completed work reviews. This is a stronger but still growing work record.`;
  }

  return `Based on ${totalReviews} completed work reviews with stronger reputation confidence.`;
}

export function getTips(
  rating: number | null,
  totalReviews: number,
): { primary: string[]; secondary: string[] } {
  const primary: string[] = [];
  const secondary: string[] = [];

  if (totalReviews === 0 || rating === null) {
    primary.push("Complete your first eligible assignment and collect a completed work review.");
    primary.push("Your work reputation will start building after employers rate completed work.");
  } else if (totalReviews < MIN_REVIEWS_FOR_VISIBLE_SCORE) {
    primary.push(
      "Your rating is still building. More completed work reviews are needed before it becomes a strong reputation signal.",
    );
    primary.push("Keep collecting ratings from eligible completed assignments.");
  } else if (rating < 3) {
    primary.push("More completed work reviews can help balance your rating over time.");
    primary.push("Focus on punctuality, clear communication, and completing assigned work.");
  } else if (rating < 4) {
    primary.push(
      "You are building a useful work record. Keep collecting reviews from completed work.",
    );
    primary.push(
      "Consistent positive ratings from different completed assignments strengthen your profile.",
    );
  } else {
    primary.push("Good work rating. Keep building it through repeated completed work reviews.");
    primary.push("A strong reputation needs enough positive reviews and completed work history.");
  }

  secondary.push("One review should not create or destroy your full reputation.");
  secondary.push(
    "Employers can use review count and confidence level to understand your rating fairly.",
  );

  return { primary, secondary };
}
