import { describe, expect, it } from "vitest";
import { isCvDocumentName, isVaultCvDocument } from "./profileCvVault.helpers";
import type { VaultDocument } from "../../workVault/types/vaultTypes";

function doc(name: string): VaultDocument {
  return {
    id: "d1",
    folderId: "f1",
    name,
    fileType: "pdf",
    base64Data: "",
    thumbnailBase64: "",
    expiryDate: null,
    uploadedAt: 1,
  };
}

describe("profileCvVault helpers", () => {
  it("detects CV and resume names", () => {
    expect(isCvDocumentName("CV")).toBe(true);
    expect(isCvDocumentName("My Resume 2026")).toBe(true);
    expect(isCvDocumentName("curriculum vitae")).toBe(true);
    expect(isCvDocumentName("Work certificate")).toBe(false);
  });

  it("flags vault documents by name only", () => {
    expect(isVaultCvDocument(doc("Employee CV"))).toBe(true);
    expect(isVaultCvDocument(doc("Degree scan"))).toBe(false);
  });
});
