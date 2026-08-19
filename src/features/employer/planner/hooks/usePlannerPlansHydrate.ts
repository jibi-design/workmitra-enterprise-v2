import { useEffect } from "react";
import { hydratePlannerPlansFromServer } from "../services/plannerDbTruth.service";

/** Employer Planner screens: pull /v1/jobmitra/employer/planner/plans into LS cache. */
export function usePlannerPlansHydrate(): void {
  useEffect(() => {
    void hydratePlannerPlansFromServer();
  }, []);
}
