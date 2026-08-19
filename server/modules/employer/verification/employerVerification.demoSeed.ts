/**
 * Lab-only: bind DB demo employer UUIDs into the in-memory verification store.
 * Memory auth ids are seeded in employerVerification.store.ts.
 */

import { isDbAuthEnabled, isProduction } from "../../auth/env.js";
import { authRepository } from "../../auth/auth.repository.js";
import {
  DEMO_EMPLOYER_EMAILS,
  markLabDemoEmployerVerified,
} from "./employerVerification.store.js";

export async function seedLabDemoEmployerVerificationFromDb(): Promise<void> {
  if (isProduction() || !isDbAuthEnabled()) return;
  for (const email of DEMO_EMPLOYER_EMAILS) {
    try {
      const row = await authRepository.findUserByEmail(email);
      if (row?.id) markLabDemoEmployerVerified(row.id, email);
    } catch {
      /* pool may not be ready at first import */
    }
  }
}
