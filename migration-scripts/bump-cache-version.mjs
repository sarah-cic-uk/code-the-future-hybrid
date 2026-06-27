#!/usr/bin/env node

/**
 * Cache-bust local script/stylesheet references
 *
 * Appends (or updates) a ?v=<version> query string on every LOCAL
 * <script src="..."> and <link href="..."> in the site's HTML, so a fresh
 * deploy is never masked by a browser/CDN serving stale JS or CSS.
 *
 * Only relative paths (starting with ./ or ../) are touched — CDN URLs
 * (https://) are left alone.
 *
 * Run this from the repo root BEFORE each deploy:
 *   node migration-scripts/bump-cache-version.mjs              # version = current date-time
 *   node migration-scripts/bump-cache-version.mjs 2026-06-27   # explicit version
 *
 * Re-running with a new version updates every existing ?v=... in place.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const ROOT = 'public';

// Version: explicit arg, else a compact UTC timestamp (changes each run)
function defaultVersion() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}${p(d.getUTCHours())}${p(d.getUTCMinutes())}`;
}
const VERSION = process.argv[2] || defaultVersion();

// Matches src="./x.js" / href="../x.css" (relative only), with optional existing ?v=...
// Group 1: attribute (src|href), Group 2: relative path up to extension, Group 3: .js|.css
const PATTERN = /\b(src|href)="(\.\.?\/[^"?]*?\.(js|css))(?:\?v=[^"]*)?"/g;

let filesChanged = 0;
let refsStamped = 0;

function processFile(path) {
  const original = readFileSync(path, 'utf8');
  let count = 0;
  const updated = original.replace(PATTERN, (_m, attr, relPath) => {
    count++;
    return `${attr}="${relPath}?v=${VERSION}"`;
  });
  if (updated !== original) {
    writeFileSync(path, updated);
    filesChanged++;
    refsStamped += count;
  }
}

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const st = statSync(path);
    if (st.isDirectory()) walk(path);
    else if (path.endsWith('.html')) processFile(path);
  }
}

console.log(`\n🔖 Cache-busting with version: ${VERSION}\n`);
walk(ROOT);
console.log(`Stamped ${refsStamped} references across ${filesChanged} HTML files.`);
console.log(`Commit and deploy — browsers will now refetch updated assets.\n`);
