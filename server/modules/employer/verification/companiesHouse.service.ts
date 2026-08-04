/**
 * UK Companies House CRN lookup — mockable production hook.
 *
 * Modes (COMPANIES_HOUSE_MODE):
 * - mock (default): deterministic in-memory registry — no network
 * - live: Companies House REST API when COMPANIES_HOUSE_API_KEY is set
 *
 * Automated submit validation:
 * - live: always validate CRN is found + active
 * - mock: validate when COMPANIES_HOUSE_VALIDATE_ON_SUBMIT=1, or when CRN hits mock registry
 */

export type CompaniesHouseLookupStatus =
  "active" | "dissolved" | "liquidation" | "not_found" | "error" | "other";

export type CompaniesHouseCompany = {
  readonly companyNumber: string;
  readonly companyName: string;
  readonly companyStatus: CompaniesHouseLookupStatus;
  readonly registeredOfficeAddress?: string;
  readonly dateOfCreation?: string;
  readonly source: "mock" | "live";
};

export type CompaniesHouseLookupResult =
  | { ok: true; company: CompaniesHouseCompany }
  | { ok: false; code: string; message: string; httpStatus: number };

export type CompaniesHouseValidateResult =
  | { ok: true; company: CompaniesHouseCompany; enforced: boolean }
  | { ok: false; code: string; message: string; httpStatus: number };

type FetchLike = (
  input: string,
  init?: { method?: string; headers?: Record<string, string> },
) => Promise<{
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}>;

const CH_API_BASE =
  process.env.COMPANIES_HOUSE_API_BASE?.trim() || "https://api.company-information.service.gov.uk";

/** Injectable fetch for unit tests / CI — defaults to global fetch. */
let fetchImpl: FetchLike = globalThis.fetch.bind(globalThis) as FetchLike;

export function setCompaniesHouseFetch(next: FetchLike | null): void {
  fetchImpl = next ?? (globalThis.fetch.bind(globalThis) as FetchLike);
}

function normalizeCrn(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export function isValidCrnShape(crn: string): boolean {
  // UK company numbers: 8 digits, or 2 letters + 6 digits (e.g. SC123456).
  return /^(\d{8}|[A-Z]{2}\d{6})$/.test(crn);
}

/** Deterministic mock registry for lab / CI — never hits the network. */
const MOCK_REGISTRY: Record<string, Omit<CompaniesHouseCompany, "source" | "companyNumber">> = {
  "01234567": {
    companyName: "Mitra Labs Demo Holdings Ltd",
    companyStatus: "active",
    registeredOfficeAddress: "1 Demo Street, London, EC1A 1BB",
    dateOfCreation: "2018-04-01",
  },
  "09876543": {
    companyName: "Trade Kitchen Catering Ltd",
    companyStatus: "active",
    registeredOfficeAddress: "12 Market Row, Manchester, M1 2AB",
    dateOfCreation: "2020-11-12",
  },
  SC123456: {
    companyName: "Highland Contract Services Ltd",
    companyStatus: "active",
    registeredOfficeAddress: "4 Castle Wynd, Edinburgh, EH1 2NG",
    dateOfCreation: "2015-06-20",
  },
  "00000000": {
    companyName: "Dissolved Example Co Ltd",
    companyStatus: "dissolved",
    registeredOfficeAddress: "Retired Road, Leeds, LS1 1AA",
    dateOfCreation: "2001-01-01",
  },
};

export function resolveCompaniesHouseMode(): "mock" | "live" {
  const mode = (process.env.COMPANIES_HOUSE_MODE ?? "").trim().toLowerCase();
  if (mode === "live") return "live";
  if (mode === "mock") return "mock";
  return process.env.COMPANIES_HOUSE_API_KEY?.trim() ? "live" : "mock";
}

function shouldEnforceValidationOnSubmit(): boolean {
  if (resolveCompaniesHouseMode() === "live") return true;
  const flag = (process.env.COMPANIES_HOUSE_VALIDATE_ON_SUBMIT ?? "").trim().toLowerCase();
  return flag === "1" || flag === "true" || flag === "yes";
}

function mapCompanyStatus(raw: string | undefined): CompaniesHouseLookupStatus {
  const s = (raw ?? "").trim().toLowerCase();
  if (s === "active") return "active";
  if (s === "dissolved") return "dissolved";
  if (s.includes("liquidat")) return "liquidation";
  if (!s) return "other";
  return "other";
}

function formatRegisteredAddress(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const a = value as Record<string, unknown>;
  const parts = [a.address_line_1, a.address_line_2, a.locality, a.region, a.postal_code, a.country]
    .filter((p): p is string => typeof p === "string" && p.trim().length > 0)
    .map((p) => p.trim());
  return parts.length > 0 ? parts.join(", ") : undefined;
}

function lookupMock(crn: string): CompaniesHouseLookupResult {
  const hit = MOCK_REGISTRY[crn];
  if (!hit) {
    return {
      ok: false,
      code: "COMPANY_NOT_FOUND",
      message: `No mock Companies House record for CRN ${crn}.`,
      httpStatus: 404,
    };
  }
  return {
    ok: true,
    company: {
      companyNumber: crn,
      companyName: hit.companyName,
      companyStatus: hit.companyStatus,
      registeredOfficeAddress: hit.registeredOfficeAddress,
      dateOfCreation: hit.dateOfCreation,
      source: "mock",
    },
  };
}

async function lookupLive(crn: string): Promise<CompaniesHouseLookupResult> {
  const apiKey = process.env.COMPANIES_HOUSE_API_KEY?.trim();
  if (!apiKey) {
    return {
      ok: false,
      code: "COMPANIES_HOUSE_NOT_CONFIGURED",
      message: "Companies House live mode requires COMPANIES_HOUSE_API_KEY.",
      httpStatus: 503,
    };
  }

  const auth = Buffer.from(`${apiKey}:`, "utf8").toString("base64");
  const url = `${CH_API_BASE.replace(/\/$/, "")}/company/${encodeURIComponent(crn)}`;

  try {
    const response = await fetchImpl(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${auth}`,
      },
    });

    if (response.status === 404) {
      return {
        ok: false,
        code: "COMPANY_NOT_FOUND",
        message: `No Companies House company found for CRN ${crn}.`,
        httpStatus: 404,
      };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        ok: false,
        code: "COMPANIES_HOUSE_AUTH_FAILED",
        message: "Companies House API rejected the configured API key.",
        httpStatus: 502,
      };
    }

    if (!response.ok) {
      return {
        ok: false,
        code: "COMPANIES_HOUSE_UPSTREAM_ERROR",
        message: `Companies House API returned HTTP ${response.status}.`,
        httpStatus: 502,
      };
    }

    const body = (await response.json()) as Record<string, unknown>;
    const companyNumber =
      typeof body.company_number === "string" ? normalizeCrn(body.company_number) : crn;
    const companyName =
      typeof body.company_name === "string" && body.company_name.trim()
        ? body.company_name.trim()
        : "Unknown company";
    const companyStatus = mapCompanyStatus(
      typeof body.company_status === "string" ? body.company_status : undefined,
    );

    return {
      ok: true,
      company: {
        companyNumber,
        companyName,
        companyStatus,
        registeredOfficeAddress: formatRegisteredAddress(body.registered_office_address),
        dateOfCreation:
          typeof body.date_of_creation === "string" ? body.date_of_creation : undefined,
        source: "live",
      },
    };
  } catch (err) {
    return {
      ok: false,
      code: "COMPANIES_HOUSE_NETWORK_ERROR",
      message: err instanceof Error ? err.message : "Companies House network request failed.",
      httpStatus: 502,
    };
  }
}

export const companiesHouseService = {
  async lookupByCrn(rawCrn: string): Promise<CompaniesHouseLookupResult> {
    const crn = normalizeCrn(rawCrn);
    if (!crn) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "Companies House CRN is required.",
        httpStatus: 400,
      };
    }
    if (!isValidCrnShape(crn)) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "CRN must be 8 digits or 2 letters + 6 digits (e.g. 01234567 or SC123456).",
        httpStatus: 400,
      };
    }

    const mode = resolveCompaniesHouseMode();
    if (mode === "live") return lookupLive(crn);
    return lookupMock(crn);
  },

  /**
   * Automated CRN gate for Enterprise track submit.
   * Live production always enforces active company.
   * Mock: soft-pass unknown CRNs unless VALIDATE_ON_SUBMIT is set; reject dissolved hits.
   */
  async validateCrnForEnterpriseSubmit(rawCrn: string): Promise<CompaniesHouseValidateResult> {
    const enforced = shouldEnforceValidationOnSubmit();
    const lookup = await companiesHouseService.lookupByCrn(rawCrn);

    if (!lookup.ok) {
      if (!enforced && lookup.code === "COMPANY_NOT_FOUND") {
        // Lab: allow arbitrary CRN shape when not in mock registry.
        return {
          ok: true,
          enforced: false,
          company: {
            companyNumber: normalizeCrn(rawCrn),
            companyName: "",
            companyStatus: "other",
            source: "mock",
          },
        };
      }
      return {
        ok: false,
        code: lookup.code,
        message: lookup.message,
        httpStatus: lookup.httpStatus,
      };
    }

    if (lookup.company.companyStatus !== "active") {
      return {
        ok: false,
        code: "COMPANY_NOT_ACTIVE",
        message: `Companies House status for ${lookup.company.companyNumber} is "${lookup.company.companyStatus}" (active required).`,
        httpStatus: 400,
      };
    }

    return { ok: true, company: lookup.company, enforced };
  },

  listMockCrns(): readonly string[] {
    return Object.keys(MOCK_REGISTRY);
  },
};
