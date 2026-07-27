/**
 * Wave 4 — replace numeric borderRadius with semantic CSS vars in Shift Jobs.
 * Mapping: pill 999; employer≥24; employee 20–22; chip 13–18; button 12; 10/8 ladder.
 */
import fs from "fs";
import path from "path";

const roots = [
  "src/features/employer/shiftJobs",
  "src/features/employee/shiftJobs",
];

function tokenFor(n) {
  if (n >= 999) return "var(--wm-radius-pill)";
  if (n >= 24) return "var(--wm-radius-employer-card)";
  if (n >= 20) return "var(--wm-radius-employee-card)";
  if (n >= 13) return "var(--wm-radius-chip)";
  if (n >= 12) return "var(--wm-radius-button)";
  if (n >= 10) return "var(--wm-radius-10)";
  return "var(--wm-radius-8)";
}

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (/\.(tsx|ts)$/.test(ent.name)) out.push(p);
  }
  return out;
}

let filesChanged = 0;
let replacements = 0;

for (const root of roots) {
  for (const file of walk(root)) {
    const before = fs.readFileSync(file, "utf8");
    const after = before.replace(/borderRadius:\s*(\d+)\b/g, (_m, num) => {
      replacements += 1;
      return `borderRadius: "${tokenFor(Number(num))}"`;
    }).replace(/borderRadius:\s*["'](\d+)px["']/g, (_m, num) => {
      replacements += 1;
      return `borderRadius: "${tokenFor(Number(num))}"`;
    });

    if (after !== before) {
      fs.writeFileSync(file, after);
      filesChanged += 1;
      console.log("updated", file);
    }
  }
}

console.log(JSON.stringify({ filesChanged, replacements }));
