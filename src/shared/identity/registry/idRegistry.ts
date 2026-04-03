// src/shared/identity/registry/idRegistry.ts

import {
  ID_REGISTRY_KEY,
  ID_MAX_COLLISION_RETRIES,
  type IdOwnerRole,
} from "../constants/idConstants";
import type {
  IdRegistry,
  IdRegistryEntry,
  IdGenerationResult,
} from "../types/identityTypes";
import { generateRawId } from "../generators/uniqueIdGenerator";

/**
 * Reads the ID registry from localStorage.
 */
function readRegistry(): IdRegistry {
  try {
    const raw = localStorage.getItem(ID_REGISTRY_KEY);
    if (!raw) return { entries: [] };
    const parsed = JSON.parse(raw) as Partial<IdRegistry>;
    return {
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
    };
  } catch {
    return { entries: [] };
  }
}

/**
 * Writes the ID registry to localStorage.
 */
function writeRegistry(registry: IdRegistry): void {
  localStorage.setItem(ID_REGISTRY_KEY, JSON.stringify(registry));
}

/**
 * Checks if an ID already exists in the registry.
 */
function idExists(id: string): boolean {
  const registry = readRegistry();
  return registry.entries.some((entry) => entry.id === id);
}

/**
 * Generates a collision-free unique ID and registers it.
 *
 * - Attempts up to ID_MAX_COLLISION_RETRIES times.
 * - Each attempt generates a new random ID.
 * - On success, stores the entry in the central registry.
 *
 * @param name - Name to embed (employee name or company name).
 * @param role - "employee" or "employer".
 * @returns IdGenerationResult with the new ID or a failure reason.
 */
export function generateAndRegisterId(
  name: string,
  role: IdOwnerRole,
): IdGenerationResult {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return { success: false, reason: "Name is required to generate an ID." };
  }

  for (let attempt = 0; attempt < ID_MAX_COLLISION_RETRIES; attempt++) {
    const id = generateRawId(trimmedName);

    if (!idExists(id)) {
      const entry: IdRegistryEntry = {
        id,
        role,
        name: trimmedName,
        createdAt: Date.now(),
      };

      const registry = readRegistry();
      registry.entries.push(entry);
      writeRegistry(registry);

      return { success: true, id };
    }
  }

  return {
    success: false,
    reason: "Could not generate a unique ID after maximum retries. Please try again.",
  };
}

/**
 * Looks up a registry entry by ID.
 */
export function lookupById(id: string): IdRegistryEntry | null {
  const registry = readRegistry();
  return registry.entries.find((e) => e.id === id) ?? null;
}

/**
 * Looks up all entries for a given role.
 */
export function lookupByRole(role: IdOwnerRole): IdRegistryEntry[] {
  const registry = readRegistry();
  return registry.entries.filter((e) => e.role === role);
}

/**
 * Removes an ID from the registry (admin use / reset).
 */
export function removeFromRegistry(id: string): boolean {
  const registry = readRegistry();
  const before = registry.entries.length;
  registry.entries = registry.entries.filter((e) => e.id !== id);

  if (registry.entries.length < before) {
    writeRegistry(registry);
    return true;
  }
  return false;
}

/**
 * Clears the entire registry (full reset).
 */
export function clearRegistry(): void {
  localStorage.removeItem(ID_REGISTRY_KEY);
}