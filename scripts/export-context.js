/**
 * Job Mitra | scripts/export-context.js
 * Exports the src/ folder tree and all Zustand store names to ai-context.txt.
 * Usage: node scripts/export-context.js
 *
 * Designed for rapid AI context bootstrapping — paste ai-context.txt at the
 * start of a new chat session to give any AI agent instant codebase awareness.
 */

import { readdirSync, statSync, writeFileSync, readFileSync } from "fs";
import { join, relative, extname } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src");
const OUTPUT = join(ROOT, "ai-context.txt");

const IGNORE_DIRS = new Set(["node_modules", "dist", ".git", "android", "ios", "__snapshots__"]);
const IGNORE_EXTS = new Set([".png", ".jpg", ".jpeg", ".svg", ".webp", ".gif", ".ico", ".woff", ".woff2", ".mp4", ".map"]);

/* ------------------------------------------------ */
/* Folder tree walker                               */
/* ------------------------------------------------ */
function walk(dir, depth = 0) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const lines = [];
  const indent = "  ".repeat(depth);

  // Sort: directories first, then files
  const sorted = [...entries].sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (!a.isDirectory() && b.isDirectory()) return 1;
    return a.name.localeCompare(b.name);
  });

  for (const entry of sorted) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    if (entry.name.startsWith(".")) continue;

    if (entry.isDirectory()) {
      lines.push(`${indent}📁 ${entry.name}/`);
      lines.push(...walk(join(dir, entry.name), depth + 1));
    } else {
      const ext = extname(entry.name).toLowerCase();
      if (IGNORE_EXTS.has(ext)) continue;
      lines.push(`${indent}📄 ${entry.name}`);
    }
  }

  return lines;
}

/* ------------------------------------------------ */
/* Zustand store detector                           */
/* ------------------------------------------------ */
function findZustandStores(dir) {
  const found = [];

  function scan(currentDir) {
    let entries;
    try {
      entries = readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      const fullPath = join(currentDir, entry.name);

      if (entry.isDirectory()) {
        scan(fullPath);
      } else if ([".ts", ".tsx"].includes(extname(entry.name))) {
        try {
          const content = readFileSync(fullPath, "utf-8");
          // Match: export const useSomethingStore = create<...>(
          const matches = [...content.matchAll(/export const (\w*[Ss]tore)\s*=\s*create/g)];
          if (matches.length > 0) {
            const relPath = relative(SRC, fullPath).replace(/\\/g, "/");
            found.push({
              file: relPath,
              stores: matches.map((m) => m[1]),
            });
          }
        } catch {
          /* skip unreadable files */
        }
      }
    }
  }

  scan(dir);
  return found;
}

/* ------------------------------------------------ */
/* Key architectural rules (manual — update as needed) */
/* ------------------------------------------------ */
const DOMAIN_RULES = [
  "DOMAIN SEPARATION: Employee (/employee/*) and Employer (/employer/*) must NEVER share Zustand slices, components, or routes.",
  "PULSE SYSTEM: Breathing Light navigation. Cards = left-edge LED only. Buttons = outer halo only. Nesting rule: only the innermost element glows.",
  "PULSE STORE: src/features/pulse/pulseStore.ts — central state for all pulse chains.",
  "PULSE NAV STORE: src/features/pulse/pulseNavStore.ts — enabled/disabled flag. Guards block activation when disabled.",
  "IDENTITY vs CONTROL: Profile pages (/*/profile) = identity. Settings pages (/*/settings) = control/behaviour. Never mix.",
  "ACCOUNT MENU: src/shared/components/AccountMenuSheet/ — single source of truth for account navigation.",
];

/* ------------------------------------------------ */
/* Build output                                     */
/* ------------------------------------------------ */
const now = new Date().toISOString();
const treeLines = walk(SRC);
const stores = findZustandStores(SRC);

const output = [
  "╔══════════════════════════════════════════════════════════════╗",
  "║   JOB MITRA / WORKMITRA ENTERPRISE — AI CONTEXT EXPORT      ║",
  "╚══════════════════════════════════════════════════════════════╝",
  `Generated : ${now}`,
  `Source    : src/ (${treeLines.filter((l) => l.includes("📄")).length} files, ${treeLines.filter((l) => l.includes("📁")).length} folders)`,
  "",
  "═══ TECH STACK ════════════════════════════════════════════════",
  "  React 19 + TypeScript 5 + Vite 7 + Zustand 5",
  "  React Router DOM 7 (HashRouter)",
  "  Capacitor 8 (Android/iOS)",
  "  Inline styles + CSS custom properties (no Tailwind)",
  "  PWA enabled (vite-plugin-pwa)",
  "",
  "═══ DOMAIN ARCHITECTURE RULES ═════════════════════════════════",
  ...DOMAIN_RULES.map((r) => `  • ${r}`),
  "",
  "═══ PROJECT STRUCTURE (src/) ═══════════════════════════════════",
  ...treeLines,
  "",
  "═══ ZUSTAND STORES DETECTED ════════════════════════════════════",
];

if (stores.length === 0) {
  output.push("  (none found)");
} else {
  for (const { file, stores: storeNames } of stores) {
    output.push(`  📦 ${file}`);
    for (const name of storeNames) {
      output.push(`      → ${name}`);
    }
  }
}

output.push("");
output.push("═══ END OF CONTEXT ═════════════════════════════════════════════");

writeFileSync(OUTPUT, output.join("\n"), "utf-8");

console.log(`✅ ai-context.txt written`);
console.log(`   ${treeLines.filter((l) => l.includes("📄")).length} source files · ${stores.length} store files · ${output.length} total lines`);
console.log(`   → ${OUTPUT}`);
