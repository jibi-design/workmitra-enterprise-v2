/**
 * Defense Layer 6 — verify Vite build output integrity (chunks exist, no empty assets).
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

function fail(message) {
  console.error(`[FATAL:build-integrity] ${message}`);
  process.exit(1);
}

const dist = resolve(process.cwd(), "dist");
if (!existsSync(dist)) {
  fail("dist/ missing after vite build");
}

const indexHtml = join(dist, "index.html");
if (!existsSync(indexHtml)) {
  fail("dist/index.html missing");
}

const html = readFileSync(indexHtml, "utf8");
if (!html.includes("<script") && !html.includes('type="module"')) {
  fail("dist/index.html has no module script tags — broken build");
}

const assetsDir = join(dist, "assets");
if (!existsSync(assetsDir)) {
  fail("dist/assets/ missing");
}

const assets = readdirSync(assetsDir);
const jsChunks = assets.filter((f) => f.endsWith(".js"));
if (jsChunks.length === 0) {
  fail("No JS chunks in dist/assets/");
}

for (const file of jsChunks) {
  const size = statSync(join(assetsDir, file)).size;
  if (size < 32) {
    fail(`Chunk too small / empty: ${file} (${size} bytes)`);
  }
}

// Ensure production build did not leave GodMode debug symbol in chunks
const godModeMarker = "GodModePanelInner";
for (const file of jsChunks) {
  const body = readFileSync(join(assetsDir, file), "utf8");
  if (body.includes(godModeMarker)) {
    fail(`Debug marker "${godModeMarker}" found in production chunk ${file}`);
  }
}

console.log(
  `[build-integrity] OK — ${jsChunks.length} JS chunk(s), index.html present.`,
);
