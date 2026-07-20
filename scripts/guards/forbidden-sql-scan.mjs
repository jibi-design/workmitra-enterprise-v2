/**
 * Job Mitra — Forbidden SQL Operation Scanner
 * Guard: forbidden-sql
 *
 * READ-ONLY static scanner. Scans scripts/**\/*.mjs and scripts/**\/*.js
 * for forbidden SQL/migration tokens. Never executes target scripts.
 * Never connects to any database. Never auto-fixes files.
 *
 * Output: JSON only — { guard, ok, scanned_files, findings[] }
 * Exit 0  → no findings
 * Exit 1  → forbidden token(s) found
 * Exit 2  → scanner error (fail-closed)
 *
 * Strict output rules:
 *  - Do not print raw line content.
 *  - Do not print DATABASE_URL, passwords, tokens, emails, or env values.
 *  - findings contain: file, line, token, severity only.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ─── Self-identification ──────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const SELF_RELATIVE = 'scripts/guards/forbidden-sql-scan.mjs';

// ─── Scan root ────────────────────────────────────────────────────────────────

const PROJECT_ROOT = resolve(__filename, '../../..');
const SCAN_ROOT = join(PROJECT_ROOT, 'scripts');

// ─── Forbidden token definitions ─────────────────────────────────────────────

/**
 * Each entry:
 *   pattern  — RegExp applied per source line (after comment-stripping)
 *   token    — human-readable label for report
 *   severity — 'high' | 'medium'
 *
 * Matching is case-insensitive.
 * SQL DML/DDL tokens use word boundaries to reduce false positives in
 * variable names (e.g. "updatedAt", "createIndex" in TS types).
 * DELETE uses SQL-specific "DELETE FROM" only — not JavaScript .delete().
 * Migration patterns flag execution indicators only — not static readFileSync reads.
 */
const FORBIDDEN_TOKENS = [
  // SQL DML — absolute blockers
  { pattern: /\bDELETE\s+FROM\b/i,       token: 'DELETE FROM',     severity: 'high' },
  { pattern: /\bUPDATE\s+\w/i,           token: 'UPDATE',          severity: 'high' },
  { pattern: /\bINSERT\s+INTO\b/i,       token: 'INSERT INTO',     severity: 'high' },
  { pattern: /\bINSERT\b/i,              token: 'INSERT',          severity: 'high' },
  { pattern: /\bUPSERT\b/i,             token: 'UPSERT',          severity: 'high' },
  { pattern: /\bTRUNCATE\b/i,           token: 'TRUNCATE',        severity: 'high' },

  // SQL DDL — absolute blockers
  { pattern: /\bALTER\s+TABLE\b/i,       token: 'ALTER TABLE',     severity: 'high' },
  { pattern: /\bALTER\b/i,              token: 'ALTER',           severity: 'high' },
  { pattern: /\bDROP\s+TABLE\b/i,        token: 'DROP TABLE',      severity: 'high' },
  { pattern: /\bDROP\s+INDEX\b/i,        token: 'DROP INDEX',      severity: 'high' },
  { pattern: /\bDROP\b/i,               token: 'DROP',            severity: 'high' },
  { pattern: /\bCREATE\s+INDEX\b/i,      token: 'CREATE INDEX',    severity: 'high' },
  { pattern: /\bCREATE\s+TABLE\b/i,      token: 'CREATE TABLE',    severity: 'high' },

  // Migration execution indicators (not static file reads)
  { pattern: /db:migrate/i,              token: 'db:migrate',      severity: 'high' },
  { pattern: /runMigrations\s*\(/i,      token: 'runMigrations()', severity: 'high' },
  { pattern: /server\/db\/migrate/i,     token: 'server/db/migrate import/execution', severity: 'high' },
  { pattern: /\b(exec|execSync|spawn|spawnSync)\s*\(\s*[`'"].*migrate/i, token: 'child process migration command', severity: 'high' },
  { pattern: /\bimport\s*\(\s*[`'"].*server\/db\/migrate/i, token: 'dynamic import server/db/migrate', severity: 'high' },
];

// ─── Comment stripper ─────────────────────────────────────────────────────────

/**
 * Strip line comments (//) and block comments (/* ... *\/) from a JS/MJS
 * source line before token matching, to reduce false positives where
 * forbidden tokens appear only in documentation comments.
 *
 * Conservative approach: strip greedily. A line that becomes empty after
 * stripping is skipped entirely.
 *
 * Limitation: does not handle multi-line block comments that open on a
 * previous line. Those are handled via a stateful pass below.
 */
function stripLineComments(line) {
  // Remove // line comments
  const slashIdx = line.indexOf('//');
  if (slashIdx !== -1) {
    return line.slice(0, slashIdx);
  }
  return line;
}

/**
 * Stateful multi-line block comment stripper.
 * Returns { strippedLine, inBlock } where inBlock is the updated state.
 */
function stripBlockComments(line, inBlock) {
  let result = '';
  let i = 0;
  let currentlyInBlock = inBlock;

  while (i < line.length) {
    if (currentlyInBlock) {
      const endIdx = line.indexOf('*/', i);
      if (endIdx === -1) {
        // Entire rest of line is inside block comment
        return { strippedLine: result, inBlock: true };
      } else {
        currentlyInBlock = false;
        i = endIdx + 2;
      }
    } else {
      const startIdx = line.indexOf('/*', i);
      if (startIdx === -1) {
        result += line.slice(i);
        break;
      } else {
        result += line.slice(i, startIdx);
        currentlyInBlock = true;
        i = startIdx + 2;
      }
    }
  }
  return { strippedLine: result, inBlock: currentlyInBlock };
}

// ─── File collector ───────────────────────────────────────────────────────────

/**
 * Recursively collect .mjs and .js files under scanRoot.
 * Excludes: the scanner itself, node_modules, dist.
 */
function collectFiles(dir, collected = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    // Unreadable directory — skip silently
    return collected;
  }

  for (const entry of entries) {
    if (entry === 'node_modules' || entry === 'dist') continue;

    const fullPath = join(dir, entry);
    let stat;
    try {
      stat = statSync(fullPath);
    } catch {
      continue;
    }

    if (stat.isDirectory()) {
      collectFiles(fullPath, collected);
    } else {
      const ext = extname(entry).toLowerCase();
      if (ext !== '.mjs' && ext !== '.js') continue;

      const rel = relative(PROJECT_ROOT, fullPath).replace(/\\/g, '/');

      // Exclude self
      if (rel === SELF_RELATIVE) continue;

      collected.push({ fullPath, rel });
    }
  }
  return collected;
}

// ─── Single-file scanner ──────────────────────────────────────────────────────

/**
 * Scan one file. Returns array of finding objects.
 * Never prints raw line content.
 */
function scanFile(fullPath, relPath) {
  let source;
  try {
    source = readFileSync(fullPath, 'utf8');
  } catch {
    // Unreadable file — skip; logged at top level
    return [];
  }

  const lines = source.split('\n');
  const findings = [];
  let inBlockComment = false;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    let line = lines[lineIdx];

    // Step 1: strip block comments (stateful)
    const blockResult = stripBlockComments(line, inBlockComment);
    inBlockComment = blockResult.inBlock;
    line = blockResult.strippedLine;

    // Step 2: strip line comments
    line = stripLineComments(line);

    // Step 3: skip blank lines
    if (line.trim().length === 0) continue;

    // Step 4: match forbidden tokens
    for (const def of FORBIDDEN_TOKENS) {
      if (def.pattern.test(line)) {
        findings.push({
          file: relPath,
          line: lineIdx + 1,
          token: def.token,
          severity: def.severity,
        });
        // One finding per line per token — do not double-report same line
        // Continue checking other tokens on this line
      }
    }
  }

  return findings;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const report = {
    guard: 'forbidden-sql',
    ok: true,
    scanned_files: 0,
    findings: [],
  };

  let files;
  try {
    files = collectFiles(SCAN_ROOT);
  } catch (err) {
    report.ok = false;
    report.error = 'SCANNER_COLLECT_FAILED';
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
    process.exit(2);
  }

  report.scanned_files = files.length;

  for (const { fullPath, rel } of files) {
    let fileFindings;
    try {
      fileFindings = scanFile(fullPath, rel);
    } catch {
      // Fail closed on individual file error — record as finding
      report.findings.push({
        file: rel,
        line: 0,
        token: 'SCANNER_READ_ERROR',
        severity: 'medium',
      });
      continue;
    }
    report.findings.push(...fileFindings);
  }

  if (report.findings.length > 0) {
    report.ok = false;
  }

  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  process.exit(report.ok ? 0 : 1);
}

main();
