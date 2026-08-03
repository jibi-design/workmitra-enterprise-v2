/** Sprint 3 — subscribe to Super Admin runtime ops flags. */

import { useEffect, useState } from "react";
import {
  getRuntimeOpsFlags,
  subscribeRuntimeOpsFlags,
  type RuntimeOpsFlags,
} from "./runtimeOpsFlags";

export function useRuntimeOpsFlags(): RuntimeOpsFlags {
  const [flags, setFlags] = useState(getRuntimeOpsFlags);
  useEffect(() => subscribeRuntimeOpsFlags(setFlags), []);
  return flags;
}
