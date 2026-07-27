import fs from "fs";
import path from "path";

const srcRoot = path.resolve("src/features");

function walk(dir, acc = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p, acc);
    else if (/\.(ts|tsx)$/.test(f.name)) acc.push(p);
  }
  return acc;
}

function countDirectCross(fromRole, toRole) {
  const hits = [];
  const root = path.join(srcRoot, fromRole);
  const re = new RegExp(`from\\s+["'](?:\\.\\./)+${toRole}/`, "g");
  for (const file of walk(root)) {
    const txt = fs.readFileSync(file, "utf8");
    const m = txt.match(re);
    if (m) hits.push({ file: path.relative(srcRoot, file), count: m.length });
  }
  return hits;
}

const e2e = countDirectCross("employee", "employer");
const e2emp = countDirectCross("employer", "employee");
console.log("employee->employer files:", e2e.length, "imports:", e2e.reduce((s, h) => s + h.count, 0));
if (e2e.length) e2e.forEach((h) => console.log(" ", h.file, h.count));
console.log("employer->employee files:", e2emp.length, "imports:", e2emp.reduce((s, h) => s + h.count, 0));
if (e2emp.length) e2emp.forEach((h) => console.log(" ", h.file, h.count));

function largeFiles() {
  const out = [];
  function scan(d) {
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, f.name);
      if (f.isDirectory()) scan(p);
      else if (/\.(ts|tsx)$/.test(f.name)) {
        const n = fs.readFileSync(p, "utf8").split("\n").length;
        if (n > 300) out.push([n, path.relative(path.resolve("src"), p)]);
      }
    }
  }
  scan(path.resolve("src"));
  return out.sort((a, b) => b[0] - a[0]);
}

const large = largeFiles();
console.log("FILES_OVER_300:", large.length);
for (const [n, p] of large.slice(0, 40)) console.log(`${n}\t${p}`);
if (large.length > 40) console.log(`... and ${large.length - 40} more`);
