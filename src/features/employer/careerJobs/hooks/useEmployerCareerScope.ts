/**
 * B-P1-4 — Employer Career tenant scope for UI guards.
 * Ready only when org/company id resolves to a valid scoped tenant key.
 */

import { useMemo, useSyncExternalStore } from "react";
import {
  CAREER_EMPLOYER_SCOPE_CHANGED_EVENT,
  peekCareerEmployerScopeId,
  type CareerEmployerScopeDenyReason,
} from "../../shared/career/careerEmployerScope";
import { employerSettingsStorage } from "../company/storage/employerSettings.storage";

export type EmployerCareerScopeState =
  | { ready: true; scopeId: string; reason: null }
  | { ready: false; scopeId: null; reason: CareerEmployerScopeDenyReason };

function subscribeCareerEmployerScope(onStoreChange: () => void): () => void {
  const unsubProfile = employerSettingsStorage.subscribe(onStoreChange);
  window.addEventListener(CAREER_EMPLOYER_SCOPE_CHANGED_EVENT, onStoreChange);
  return () => {
    unsubProfile();
    window.removeEventListener(CAREER_EMPLOYER_SCOPE_CHANGED_EVENT, onStoreChange);
  };
}

function getCareerEmployerScopeSnapshot(): string {
  const peek = peekCareerEmployerScopeId();
  return peek.ok ? `ok:${peek.scopeId}` : `err:${peek.reason}`;
}

export function useEmployerCareerScope(): EmployerCareerScopeState {
  const snapshot = useSyncExternalStore(
    subscribeCareerEmployerScope,
    getCareerEmployerScopeSnapshot,
    getCareerEmployerScopeSnapshot,
  );

  return useMemo((): EmployerCareerScopeState => {
    void snapshot;
    const peek = peekCareerEmployerScopeId();
    if (peek.ok) {
      return { ready: true, scopeId: peek.scopeId, reason: null };
    }
    return { ready: false, scopeId: null, reason: peek.reason };
  }, [snapshot]);
}
