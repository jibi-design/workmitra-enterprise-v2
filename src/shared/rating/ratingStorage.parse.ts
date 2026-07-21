import type { EmployerToWorkerRating, WorkerToEmployerRating } from "./ratingTypes";
import { bool, isRec, num, str, strArr } from "./ratingStorage.helpers";
import { isRatingDomain, normalizePlannerMeta } from "./plannerRating.helpers";

export function parseERRatings(raw: string | null): EmployerToWorkerRating[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: EmployerToWorkerRating[] = [];
    for (const x of parsed) {
      if (!isRec(x)) continue;
      const id = str(x, "id");
      const domainRaw = str(x, "domain");
      if (!isRatingDomain(domainRaw)) continue;
      const domain = domainRaw;
      const employerMlId = str(x, "employerMlId") ?? str(x, "employerWmId");
      const workerMlId = str(x, "workerMlId") ?? str(x, "workerWmId");
      const jobId = str(x, "jobId");
      const stars = num(x, "stars");
      const createdAt = num(x, "createdAt");
      const hireAgain = bool(x, "hireAgain");
      if (
        !id ||
        !employerMlId ||
        !workerMlId ||
        !jobId ||
        !stars ||
        !createdAt ||
        hireAgain === undefined
      )
        continue;
      if (stars < 1 || stars > 5) continue;

      const meta = domain === "planner" ? normalizePlannerMeta(x["meta"]) : undefined;
      if (domain === "planner" && !meta) continue;

      out.push({
        id,
        domain,
        employerMlId,
        workerMlId,
        jobId,
        stars: stars as 1 | 2 | 3 | 4 | 5,
        tags: strArr(x, "tags") as EmployerToWorkerRating["tags"],
        comment: str(x, "comment"),
        hireAgain,
        createdAt,
        editedAt: num(x, "editedAt") ?? null,
        editCount: num(x, "editCount") ?? 0,
        meta,
      });
    }
    return out.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export function parseWRRatings(raw: string | null): WorkerToEmployerRating[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: WorkerToEmployerRating[] = [];
    for (const x of parsed) {
      if (!isRec(x)) continue;
      const id = str(x, "id");
      const domainRaw = str(x, "domain");
      if (!isRatingDomain(domainRaw)) continue;
      const domain = domainRaw;
      const workerMlId = str(x, "workerMlId") ?? str(x, "workerWmId");
      const employerMlId = str(x, "employerMlId") ?? str(x, "employerWmId");
      const jobId = str(x, "jobId");
      const stars = num(x, "stars");
      const createdAt = num(x, "createdAt");
      const workAgain = bool(x, "workAgain");
      if (
        !id ||
        !workerMlId ||
        !employerMlId ||
        !jobId ||
        !stars ||
        !createdAt ||
        workAgain === undefined
      )
        continue;
      if (stars < 1 || stars > 5) continue;

      const meta = domain === "planner" ? normalizePlannerMeta(x["meta"]) : undefined;
      if (domain === "planner" && !meta) continue;

      out.push({
        id,
        domain,
        workerMlId,
        employerMlId,
        jobId,
        stars: stars as 1 | 2 | 3 | 4 | 5,
        tags: strArr(x, "tags") as WorkerToEmployerRating["tags"],
        comment: str(x, "comment"),
        workAgain,
        createdAt,
        editedAt: num(x, "editedAt") ?? null,
        editCount: num(x, "editCount") ?? 0,
        meta,
      });
    }
    return out.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}
