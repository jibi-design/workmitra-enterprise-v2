/** Client Companies House CRN lookup — talks to mockable server stub. */

import { AUTH_BACKEND_ENABLED } from "../../../../shared/config/authConfig";
import { apiService } from "../../../../shared/services/apiService";
import { companiesHouseMockEnabled } from "../../../../shared/config/featureFlags";

export type CompaniesHouseCompanyDto = {
  readonly companyNumber: string;
  readonly companyName: string;
  readonly companyStatus: string;
  readonly registeredOfficeAddress?: string;
  readonly dateOfCreation?: string;
  readonly source: "mock" | "live";
};

type Envelope<T> = { data: T; meta?: { requestId?: string } };

const LOOKUP_PATH = "/v1/jobmitra/employer/verification/companies-house";

/** Lab-only offline mock when AUTH backend is off. */
const OFFLINE_MOCK: Record<string, CompaniesHouseCompanyDto> = {
  "01234567": {
    companyNumber: "01234567",
    companyName: "Mitra Labs Demo Holdings Ltd",
    companyStatus: "active",
    registeredOfficeAddress: "1 Demo Street, London, EC1A 1BB",
    dateOfCreation: "2018-04-01",
    source: "mock",
  },
  "09876543": {
    companyNumber: "09876543",
    companyName: "Trade Kitchen Catering Ltd",
    companyStatus: "active",
    registeredOfficeAddress: "12 Market Row, Manchester, M1 2AB",
    dateOfCreation: "2020-11-12",
    source: "mock",
  },
  SC123456: {
    companyNumber: "SC123456",
    companyName: "Highland Contract Services Ltd",
    companyStatus: "active",
    registeredOfficeAddress: "4 Castle Wynd, Edinburgh, EH1 2NG",
    dateOfCreation: "2015-06-20",
    source: "mock",
  },
};

function normalizeCrn(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export async function lookupCompaniesHouseCrn(rawCrn: string): Promise<CompaniesHouseCompanyDto> {
  const crn = normalizeCrn(rawCrn);
  if (!crn) {
    throw new Error("Enter a Companies House CRN first.");
  }

  if (!AUTH_BACKEND_ENABLED) {
    if (!companiesHouseMockEnabled) {
      throw new Error("Companies House lookup requires auth backend or mock mode.");
    }
    const hit = OFFLINE_MOCK[crn];
    if (!hit) {
      throw new Error(`No mock record for CRN ${crn}. Try 01234567 or SC123456.`);
    }
    return hit;
  }

  const res = await apiService.get<Envelope<{ company: CompaniesHouseCompanyDto }>>(
    `${LOOKUP_PATH}/${encodeURIComponent(crn)}`,
  );
  return res.data.company;
}

/**
 * Production integration notes (server):
 * - COMPANIES_HOUSE_MODE=mock|live
 * - COMPANIES_HOUSE_API_KEY=<key>  (Basic auth username for api.company-information.service.gov.uk)
 * - COMPANIES_HOUSE_API_BASE=https://api.company-information.service.gov.uk (optional override)
 * - COMPANIES_HOUSE_VALIDATE_ON_SUBMIT=1  (force mock-mode submit validation)
 */
export const COMPANIES_HOUSE_ENV_HINTS = [
  "COMPANIES_HOUSE_MODE",
  "COMPANIES_HOUSE_API_KEY",
  "COMPANIES_HOUSE_API_BASE",
  "COMPANIES_HOUSE_VALIDATE_ON_SUBMIT",
] as const;
