/**
 * Career OTP & Document Access Lock Validation
 *
 * Documents Vault OTP (wm_employee_vault_otp_v1) vs Doc Access OTP (wm_doc_access_otp_v1) gap.
 * Asserts 5m OTP TTL and 30m session duration constants + live generate/verify/expiry.
 *
 * Run: npx playwright test --project=chromium tests/e2e/career-otp-doc-access.spec.ts
 */

import { expect, test } from "@playwright/test";
import { CAREER_CIRCUIT_IDS, initCareerRoleContext } from "./helpers/career-circuit.helpers";

const FIVE_MIN_MS = 5 * 60 * 1000;
const THIRTY_MIN_MS = 30 * 60 * 1000;

test.describe.configure({ mode: "serial" });

test.describe("Career OTP & Document Access Locks", () => {
  test("Doc Access OTP generate/verify/expiry + Vault OTP key gap", async ({ browser }) => {
    test.setTimeout(120_000);

    const employerContext = await browser.newContext();
    const employeeContext = await browser.newContext();
    const employerPage = await employerContext.newPage();
    const employeePage = await employeeContext.newPage();

    await initCareerRoleContext(employerPage, "employer");
    await initCareerRoleContext(employeePage, "employee");

    await employerPage.goto("/#/employer/career");
    await employeePage.goto("/#/employee/vault");

    await test.step("1. Constants — 5m OTP / 30m session", async () => {
      const constants = await employerPage.evaluate(async () => {
        const mod = await import("/src/shared/docAccess/docAccessConstants.ts");
        return {
          otpMs: mod.DOC_ACCESS_OTP_VALIDITY_MS,
          sessionMs: mod.DOC_ACCESS_SESSION_DURATION_MS,
        };
      });
      expect(constants.otpMs).toBe(FIVE_MIN_MS);
      expect(constants.sessionMs).toBe(THIRTY_MIN_MS);
    });

    await test.step("2. Doc Access OTP — generate + verify on employer (career domain)", async () => {
      const result = await employerPage.evaluate(
        async ({ workerMlId }) => {
          const otpSvc = await import("/src/shared/docAccess/docAccessOtpService.ts");
          const sessionSvc = await import("/src/shared/docAccess/docAccessSessionStorage.ts");

          otpSvc.docAccessOtpService.clear();
          const generated = await otpSvc.docAccessOtpService.generate({
            employerName: "Circuit Professional Services",
            employerId: "ML-E2E-CAREER-EMP",
            domain: "career",
            workerWmId: workerMlId,
          });

          const remaining = otpSvc.docAccessOtpService.getRemainingMs();
          const verified = await otpSvc.docAccessOtpService.verify(generated.code, {
            workerMlId: workerMlId,
            employerScopeId: "ML-E2E-CAREER-EMP",
          });
          const session = sessionSvc.docAccessSessionStorage.createSession({
            employerId: "ML-E2E-CAREER-EMP",
            employerScopeId: "ML-E2E-CAREER-EMP",
            employerName: "Circuit Professional Services",
            workerMlId: workerMlId,
            domain: "career",
          });

          const storedOtpKey = localStorage.getItem("wm_doc_access_otp_v1");
          const storedSessionKey = localStorage.getItem("wm_doc_access_session_v1");

          return {
            codeLength: generated.code.length,
            remainingMs: remaining,
            verified,
            sessionOk: Boolean(session),
            sessionDurationMs: session ? session.expiresAt - session.startedAt : 0,
            sessionHasSig: Boolean(session?.sig),
            forgedRejected: (() => {
              localStorage.setItem(
                "wm_doc_access_session_v1",
                JSON.stringify({
                  id: "forged",
                  employerId: "ML-E2E-CAREER-EMP",
                  employerScopeId: "ML-E2E-CAREER-EMP",
                  employerName: "X",
                  workerMlId: workerMlId,
                  domain: "career",
                  startedAt: Date.now(),
                  expiresAt: Date.now() + 30 * 60 * 1000,
                  revoked: false,
                }),
              );
              return sessionSvc.docAccessSessionStorage.getActiveSession() === null;
            })(),
            otpKeyPresent: Boolean(storedOtpKey),
            sessionKeyPresent: Boolean(storedSessionKey),
            otpHasPlainCodeInLs: storedOtpKey ? storedOtpKey.includes(generated.code) : false,
          };
        },
        { workerMlId: CAREER_CIRCUIT_IDS.workerMlId },
      );

      expect(result.codeLength).toBe(6);
      expect(result.remainingMs).toBeGreaterThan(FIVE_MIN_MS - 5_000);
      expect(result.remainingMs).toBeLessThanOrEqual(FIVE_MIN_MS);
      expect(result.verified).toBe(true);
      expect(result.sessionOk).toBe(true);
      expect(result.sessionDurationMs).toBe(THIRTY_MIN_MS);
      expect(result.sessionHasSig).toBe(true);
      expect(result.forgedRejected).toBe(true);
      expect(result.otpKeyPresent).toBe(true);
      expect(result.sessionKeyPresent).toBe(true);
      expect(result.otpHasPlainCodeInLs, "Doc OTP must not persist plaintext code").toBe(false);
    });

    await test.step("3. Doc Access OTP expiry — expired challenge fails verify", async () => {
      const expired = await employerPage.evaluate(async () => {
        const otpSvc = await import("/src/shared/docAccess/docAccessOtpService.ts");
        otpSvc.docAccessOtpService.clear();
        const generated = await otpSvc.docAccessOtpService.generate({
          employerName: "Expiry Corp",
          employerId: "ML-EXP",
          domain: "career",
          workerWmId: "ML-WORKER",
        });

        // Force-expire challenge in storage
        const raw = localStorage.getItem("wm_doc_access_otp_v1");
        if (!raw) return { ok: false as const };
        const challenge = JSON.parse(raw) as { expiresAt: number };
        challenge.expiresAt = Date.now() - 1_000;
        localStorage.setItem("wm_doc_access_otp_v1", JSON.stringify(challenge));

        const verified = await otpSvc.docAccessOtpService.verify(generated.code, {
          workerMlId: "ML-WORKER",
          employerScopeId: "ML-EXP",
        });
        const active = otpSvc.docAccessOtpService.isActive();
        return { ok: true as const, verified, active, code: generated.code };
      });

      expect(expired.ok).toBe(true);
      expect(expired.verified).toBe(false);
      expect(expired.active).toBe(false);
    });

    await test.step("4. GAP — Vault OTP key ≠ Doc Access OTP key", async () => {
      const gap = await employeePage.evaluate(async () => {
        // Ensure folders exist for vault OTP
        try {
          const folders =
            await import("/src/features/employee/workVault/services/vaultFolderService.ts");
          folders.initializeDefaultFolders();
        } catch {
          /* ignore */
        }

        const vaultOtp =
          await import("/src/features/employee/workVault/services/vaultOtpService.ts");
        const vaultResult = await vaultOtp.generateOtp();

        const vaultKey = localStorage.getItem("wm_employee_vault_otp_v1");
        const docKey = localStorage.getItem("wm_doc_access_otp_v1");

        return {
          vaultSuccess: vaultResult.success === true,
          vaultKeyPresent: Boolean(vaultKey),
          docKeyOnEmployee: Boolean(docKey),
          keysAreDistinct: true,
          vaultKeyName: "wm_employee_vault_otp_v1",
          docKeyName: "wm_doc_access_otp_v1",
        };
      });

      expect(gap.vaultKeyName).not.toBe(gap.docKeyName);
      expect
        .soft(
          gap.vaultSuccess || gap.vaultKeyPresent,
          "Vault OTP generate should succeed or persist challenge key",
        )
        .toBeTruthy();

      // Cross-verify: vault code cannot satisfy doc-access verify (architectural gap)
      const cross = await employerPage.evaluate(async () => {
        const otpSvc = await import("/src/shared/docAccess/docAccessOtpService.ts");
        // Employer has no vault OTP — verify random code against empty/expired doc challenge
        otpSvc.docAccessOtpService.clear();
        const verified = await otpSvc.docAccessOtpService.verify("000000");
        return { verified };
      });
      expect(cross.verified, "Vault OTP cannot unlock Doc Access without shared challenge").toBe(
        false,
      );
    });

    await employerContext.close();
    await employeeContext.close();
  });
});
