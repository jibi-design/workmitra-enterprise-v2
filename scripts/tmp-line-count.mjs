import fs from 'fs';
import path from 'path';

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.tsx?$/.test(e.name)) acc.push(p);
  }
  return acc;
}

const files = walk('src');
const results = [];
for (const f of files) {
  const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/).length;
  if (lines > 300) results.push({ f: f.replace(/\\/g, '/'), lines });
}
results.sort((a, b) => b.lines - a.lines);
for (const r of results) console.log(`${r.lines}\t${r.f}`);
console.log('TOTAL:', results.length);
