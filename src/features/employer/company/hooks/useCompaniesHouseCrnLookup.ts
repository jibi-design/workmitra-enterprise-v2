/**
 * React hook — mockable Companies House CRN lookup for Enterprise Track UI.
 */

import { useCallback, useState } from "react";
import {
  lookupCompaniesHouseCrn,
  type CompaniesHouseCompanyDto,
} from "../services/companiesHouseLookup.service";

export type CompaniesHouseLookupState = {
  readonly loading: boolean;
  readonly company: CompaniesHouseCompanyDto | null;
  readonly error: string | null;
};

export function useCompaniesHouseCrnLookup() {
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState<CompaniesHouseCompanyDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setLoading(false);
    setCompany(null);
    setError(null);
  }, []);

  const lookup = useCallback(async (crn: string): Promise<CompaniesHouseCompanyDto | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await lookupCompaniesHouseCrn(crn);
      setCompany(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Company registration lookup failed.";
      setCompany(null);
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    lookup,
    reset,
    loading,
    company,
    error,
  } satisfies CompaniesHouseLookupState & {
    lookup: (crn: string) => Promise<CompaniesHouseCompanyDto | null>;
    reset: () => void;
  };
}
