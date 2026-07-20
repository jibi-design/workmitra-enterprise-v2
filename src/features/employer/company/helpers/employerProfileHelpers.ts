// App name: Job Mitra
// File name: employerProfileHelpers.ts

export const MAX_COMPANY_LOGO_BYTES = 2 * 1024 * 1024;

export async function readImageAsDataUrl(file: File): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });
}
