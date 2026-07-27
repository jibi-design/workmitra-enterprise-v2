/**
 * STEP 4 helper: extract inline CSSProperties style blocks from oversized TSX files.
 * Usage: node scripts/step4-extract-styles.mjs [--dry-run] [file...]
 */
import fs from "fs";
import path from "path";

const dryRun = process.argv.includes("--dry-run");
const explicitFiles = process.argv.slice(2).filter((a) => !a.startsWith("--"));

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!e.name.includes("__tests__")) walk(p, acc);
    } else if (/\.tsx$/.test(e.name) && !e.name.includes(".test.")) {
      acc.push(p);
    }
  }
  return acc;
}

function lineCount(content) {
  return content.split(/\r?\n/).length;
}

function extractStyles(content) {
  const styleStartMarkers = [
    /^\/\/ ULTRA-PREMIUM STYLES/,
    /^\/\/ ── Styles/,
    /^\/\/ Styles/,
    /^const CARD_STYLE: CSSProperties/,
    /^const \w+_STYLE: CSSProperties = \{/,
  ];

  const lines = content.split(/\r?\n/);
  let startIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    if (styleStartMarkers.some((re) => re.test(lines[i]))) {
      startIdx = i;
      break;
    }
  }

  if (startIdx === -1) {
    // fallback: first const X_STYLE: CSSProperties after last export/function closing
    for (let i = lines.length - 1; i >= 0; i--) {
      if (/^const \w+_STYLE: CSSProperties/.test(lines[i])) {
        // walk back to find block start (skip blank/comment lines)
        startIdx = i;
        while (startIdx > 0 && (/^const \w+_STYLE|^const \w+ =|^\/\//.test(lines[startIdx - 1]) || lines[startIdx - 1].trim() === "")) {
          if (/^const \w+_STYLE: CSSProperties/.test(lines[startIdx - 1])) startIdx--;
          else if (/^\/\//.test(lines[startIdx - 1]) || lines[startIdx - 1].trim() === "") startIdx--;
          else break;
        }
        break;
      }
    }
  }

  if (startIdx === -1) return null;

  const styleLines = lines.slice(startIdx);
  const mainLines = lines.slice(0, startIdx).filter((l, idx, arr) => {
    // remove trailing blank lines
    if (idx === arr.length - 1 && l.trim() === "") return false;
    return true;
  });

  // Collect style names
  const styleNames = [];
  for (const line of styleLines) {
    const m = line.match(/^const (\w+): CSSProperties/);
    if (m) styleNames.push(m[1]);
    const m2 = line.match(/^export const (\w+): CSSProperties/);
    if (m2) styleNames.push(m2[1]);
  }

  if (styleNames.length < 3) return null;

  const baseName = path.basename(content.includes(".tsx") ? "x.tsx" : "x.tsx");
  return { startIdx, styleLines, mainLines, styleNames };
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  if (lineCount(content) <= 300) return { skipped: true, reason: "under 300" };

  const extracted = extractStyles(content);
  if (!extracted) return { skipped: true, reason: "no style block" };

  const rel = filePath.replace(/\\/g, "/");
  const dir = path.dirname(filePath);
  const base = path.basename(filePath, ".tsx");
  const stylesPath = path.join(dir, `${base}.styles.ts`);

  if (fs.existsSync(stylesPath)) return { skipped: true, reason: "styles exist" };

  const { styleLines, mainLines, styleNames } = extracted;

  // Build styles file
  const hasCssImport = content.includes('import type { CSSProperties }');
  const stylesContent = [
    hasCssImport ? 'import type { CSSProperties } from "react";' : "",
    "",
    ...styleLines.map((l) => {
      if (/^const (\w+): CSSProperties/.test(l)) return l.replace(/^const /, "export const ");
      return l;
    }),
    "",
  ]
    .filter(Boolean)
    .join("\n");

  // Build updated main file
  let mainContent = mainLines.join("\n");
  if (!mainContent.includes('import type { CSSProperties }') && mainContent.includes("CSSProperties")) {
    // keep as-is if inline usage remains
  }

  const importLine = `import {\n  ${styleNames.join(",\n  ")},\n} from "./${base}.styles";`;

  // Insert import after last import
  const mainLinesArr = mainContent.split(/\r?\n/);
  let lastImportIdx = -1;
  for (let i = 0; i < mainLinesArr.length; i++) {
    if (/^import /.test(mainLinesArr[i])) lastImportIdx = i;
  }
  if (lastImportIdx >= 0) {
    mainLinesArr.splice(lastImportIdx + 1, 0, importLine);
  } else {
    mainLinesArr.unshift(importLine);
  }

  // Remove unused CSSProperties import if no longer needed
  mainContent = mainLinesArr.join("\n");
  if (!mainContent.match(/CSSProperties(?!.*from)/) && mainContent.includes('import type { CSSProperties }')) {
    mainContent = mainContent.replace(/^import type \{ CSSProperties \} from "react";\n?/m, "");
  }

  if (!dryRun) {
    fs.writeFileSync(stylesPath, stylesContent);
    fs.writeFileSync(filePath, mainContent);
  }

  return {
    skipped: false,
    before: lineCount(content),
    after: lineCount(mainContent),
    stylesLines: lineCount(stylesContent),
    stylesPath: stylesPath.replace(/\\/g, "/"),
  };
}

const files =
  explicitFiles.length > 0
    ? explicitFiles
    : walk("src").filter((f) => lineCount(fs.readFileSync(f, "utf8")) > 300);

let processed = 0;
let skipped = 0;

for (const f of files) {
  const result = processFile(f);
  if (result.skipped) {
    skipped++;
    if (explicitFiles.length) console.log(`SKIP ${f}: ${result.reason}`);
  } else {
    processed++;
    console.log(`OK ${f}: ${result.before} -> ${result.after} (+ ${result.stylesLines} styles)`);
  }
}

console.log(`\nProcessed: ${processed}, Skipped: ${skipped}`);
