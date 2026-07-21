/** Job Mitra | EnterpriseToastHost.tsx | Shell-mounted glass toast host */

import { useEffect, useState } from "react";
import { GlobalToast } from "../feedback/GlobalToast";
import {
  dismissEnterpriseToast,
  subscribeEnterpriseToast,
  type EnterpriseToastPayload,
} from "./enterpriseToast";

export function EnterpriseToastHost() {
  const [toast, setToast] = useState<EnterpriseToastPayload | null>(null);

  useEffect(() => subscribeEnterpriseToast(setToast), []);

  useEffect(() => {
    if (!toast) return;
    const duration = toast.durationMs ?? 3200;
    const timer = window.setTimeout(() => {
      dismissEnterpriseToast();
    }, duration);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <GlobalToast
      message={toast?.message ?? ""}
      tone={toast?.tone ?? "info"}
      visible={Boolean(toast)}
      onClose={dismissEnterpriseToast}
      className="wm-globalToast--enterprise"
      testId="wm-ent-toast"
    />
  );
}
