// App name: Job Mitra
// File name: shiftWorkspacePage.helpers.ts

export function getSafeExternalMapsUrl(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();

  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
    return trimmed;
  }

  return undefined;
}
