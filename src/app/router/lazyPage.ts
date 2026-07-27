/** Job Mitra | lazyPage.ts | Lazy route loader with one-time reload on stale Vite chunks */

import { lazy, type ComponentType, type LazyExoticComponent } from "react";

const CHUNK_RELOAD_KEY = "wm:chunk-reload-attempted";

function isDynamicImportError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  return (
    message.includes("failed to fetch dynamically imported module") ||
    message.includes("importing a module script failed") ||
    message.includes("error loading dynamically imported module")
  );
}

async function loadWithChunkRetry<T extends ComponentType>(
  loader: () => Promise<{ default: T }>,
): Promise<{ default: T }> {
  try {
    const module = await loader();
    sessionStorage.removeItem(CHUNK_RELOAD_KEY);
    return module;
  } catch (error) {
    if (isDynamicImportError(error) && !sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
      sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
      window.location.reload();
      return new Promise(() => {
        /* page reload in progress */
      });
    }

    sessionStorage.removeItem(CHUNK_RELOAD_KEY);
    throw error;
  }
}

export function lazyPage<T extends ComponentType>(
  loader: () => Promise<{ default: T }>,
): LazyExoticComponent<T> {
  return lazy(() => loadWithChunkRetry(loader));
}
