#!/usr/bin/env node
/**
 * TypeScript types for the API, generated from the api repo's contract. Never hand-write API shapes.
 *
 *   node scripts/generate-api-types.mjs          write src/lib/api/schema.ts
 *   node scripts/generate-api-types.mjs --check  fail if the committed file drifted
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import openapiTS, { astToString } from 'openapi-typescript';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CONTRACT = resolve(ROOT, '..', 'jas-ad-studio-api', 'openapi.json');
const OUT = resolve(ROOT, 'src/lib/api/schema.ts');

const doc = JSON.parse(readFileSync(CONTRACT, 'utf8'));
const paths = Object.keys(doc.paths ?? {});
const body = astToString(await openapiTS(doc, { alphabetize: true }));
const next = `/**\n * GENERATED from jas-ad-studio-api/openapi.json (${paths.length} paths). Do not edit.\n * Regenerate with \`pnpm api:generate\`.\n */\n\n${body}`;

if (process.argv.includes('--check')) {
  let current = '';
  try {
    current = readFileSync(OUT, 'utf8');
  } catch {
    /* missing counts as drift */
  }
  if (current !== next) {
    console.error('src/lib/api/schema.ts is out of date. Run `pnpm api:generate`.');
    process.exit(1);
  }
  console.log(`api:check ok, ${paths.length} paths`);
} else {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, next);
  console.log(`wrote src/lib/api/schema.ts, ${paths.length} paths`);
}
