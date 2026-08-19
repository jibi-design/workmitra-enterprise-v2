/** Admin Trust queue — reported Shift and Career postings. */

import { useCallback, useEffect, useState } from "react";
import { ApiRequestError } from "../../../../shared/services/apiService";
import {
  fetchModerationCases,
  submitModerationAction,
  type AdminModerationCase,
} from "../../../moderation/contentReport.api";

export function useAdminModerationPage() {
  const [cases, setCases] = useState<AdminModerationCase[]>([]);
  const [filter, setFilter] = useState("queue");
  const [uiState, setUiState] = useState<"loading" | "empty" | "active" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setUiState("loading");
    setError(null);
    try {
      const status = filter === "queue" ? undefined : filter;
      const rows = await fetchModerationCases(status);
      setCases(rows);
      setUiState(rows.length === 0 ? "empty" : "active");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not load reports.");
      setUiState("error");
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function act(caseId: string, action: "dismiss" | "hide" | "restore" | "remove") {
    setBusyId(caseId);
    setError(null);
    try {
      await submitModerationAction(caseId, action);
      await load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not apply that action.");
    } finally {
      setBusyId(null);
    }
  }

  return { cases, filter, setFilter, uiState, error, busyId, act, retry: load };
}
