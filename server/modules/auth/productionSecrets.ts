/**
 * Defense Layer 1 — production secrets / insecure-default hard-fail.
 * Implementation lives in failCloseEnv.ts (Layer 6 unified validator).
 */

export {
  assertProductionSecrets,
  assertFailCloseEnvironment,
  resolveSessionPepper,
} from "./failCloseEnv.js";
