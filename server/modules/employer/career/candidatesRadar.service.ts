/** Job Mitra API | Blind Career candidate count. No names. No dates. */

import { isDbAuthEnabled } from "../../auth/env.js";
import { countCandidatesCoveringJobSite } from "../../career/candidatesRadar.match.js";
import { careerLocationRepository } from "../../location/careerLocation.repository.js";
import { parsePincode } from "../../location/pincode.js";

export async function countCareerCandidatesRadar(
  jobPincode: string | null | undefined,
): Promise<{ count: number }> {
  const pin = parsePincode(jobPincode);
  if (!pin || !isDbAuthEnabled()) return { count: 0 };

  let profiles: Awaited<ReturnType<typeof careerLocationRepository.listWithBase>> = [];
  try {
    profiles = await careerLocationRepository.listWithBase();
  } catch {
    return { count: 0 };
  }

  return {
    count: countCandidatesCoveringJobSite({ profiles, jobPincode: pin }),
  };
}
