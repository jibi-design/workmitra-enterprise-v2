/** In-app leave guard for Career Job create — no window.confirm / beforeunload. */

import { useRef } from "react";
import { useBlocker, useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import type { ConfirmData } from "../../../../shared/components/ConfirmModal";

export const CAREER_CREATE_LEAVE_CONFIRM: ConfirmData = {
  title: "Discard Unsaved Job Post?",
  message: "You have unsaved changes. Are you sure you want to leave without saving?",
  tone: "warn",
  confirmLabel: "Discard Changes",
  cancelLabel: "Keep Editing",
};

type Params = {
  readonly when: boolean;
  readonly discardAndReset: () => void;
};

export function useCareerCreateUnsavedLeave({ when, discardAndReset }: Params) {
  const nav = useNavigate();
  const bypassRef = useRef(false);

  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    if (bypassRef.current) return false;
    if (
      currentLocation.pathname === nextLocation.pathname &&
      currentLocation.search === nextLocation.search &&
      currentLocation.hash === nextLocation.hash
    ) {
      return false;
    }
    return when;
  });

  const confirmData = blocker.state === "blocked" ? CAREER_CREATE_LEAVE_CONFIRM : null;

  function handleCancel() {
    nav(ROUTE_PATHS.employerCareerHome);
  }

  function clearConfirm() {
    if (blocker.state === "blocked") blocker.reset();
  }

  function confirmLeave() {
    discardAndReset();
    bypassRef.current = true;
    if (blocker.state === "blocked") {
      blocker.proceed();
      return;
    }
    nav(ROUTE_PATHS.employerCareerHome);
  }

  function setBypass(next: boolean) {
    bypassRef.current = next;
  }

  return { confirmData, handleCancel, clearConfirm, confirmLeave, setBypass };
}
