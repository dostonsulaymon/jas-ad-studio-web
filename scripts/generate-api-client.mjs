#!/usr/bin/env node
/**
 * Generates the typed API client from the api repo's OpenAPI contract.
 *
 * The contract is read from `main`, never from the api repo's working tree (W-002).
 * `main` is a line of closed phases (D-070), so pinning there means this app only ever
 * compiles against contracts that passed a phase exit check. This is not theoretical:
 * on 2026-09-12 the api working tree carried uncommitted P3 routes (/api/packs,
 * /api/credits/balance, /api/orders, seven /api/owner/*) whose shapes can still change.
 *
 *   node scripts/generate-api-client.mjs                 write the client from main
 *   node scripts/generate-api-client.mjs --check         fail if the committed file drifted
 *   node scripts/generate-api-client.mjs --from-worktree read the unmerged working tree
 *
 * --from-worktree exists for testing against an unmerged branch locally. Its output
 * must never be committed; --check is what enforces that.
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import openapiTS, { astToString } from 'openapi-typescript';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const API_REPO = resolve(ROOT, '..', 'jas-ad-studio-api');
const OUT = resolve(ROOT, 'src/lib/api/generated/schema.ts');
const REF = 'main';

const args = new Set(process.argv.slice(2));
const check = args.has('--check');
const fromWorktree = args.has('--from-worktree');

function git(...a) {
  return execFileSync('git', ['-C', API_REPO, ...a], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

function readContract() {
  if (fromWorktree) {
    console.warn(
      '\n  !!  Reading the api repo WORKING TREE, not %s.\n' +
        '      These shapes are unmerged and can still change. Do not commit this output.\n',
      REF,
    );
    return { json: readFileSync(resolve(API_REPO, 'openapi.json'), 'utf8'), sha: 'WORKTREE' };
  }
  return {
    json: git('show', `${REF}:openapi.json`),
    sha: git('rev-parse', '--short', REF).trim(),
  };
}

const { json, sha } = readContract();
const doc = JSON.parse(json);
const paths = Object.keys(doc.paths ?? {});

const ast = await openapiTS(doc, { alphabetize: true });
const body = astToString(ast);

const header = [
  '/**',
  ' * GENERATED FILE. DO NOT EDIT BY HAND (D-031).',
  ' *',
  ` * Source: jas-ad-studio-api openapi.json @ ${REF} (${sha})`,
  ` * Paths:  ${paths.length}`,
  ' *',
  ' * Regenerate with `pnpm api:generate`. `pnpm api:check` fails if this drifted.',
  ' */',
  '',
].join('\n');

const next = header + body;

if (check) {
  let current;
  try {
    current = readFileSync(OUT, 'utf8');
  } catch {
    console.error('  The generated client is missing. Run `pnpm api:generate`.');
    process.exit(1);
  }
  // The SHA line moves whenever main moves, even with an identical contract, so the
  // comparison ignores it and compares the types that actually matter.
  const strip = (s) => s.replace(/^ \* Source:.*$/m, '');
  if (strip(current) !== strip(next)) {
    console.error(
      '  The generated client is out of date with %s.\n  Run `pnpm api:generate` and commit the result.',
      REF,
    );
    process.exit(1);
  }
  console.log('  api:check  the generated client matches %s (%s), %d paths', REF, sha, paths.length);
  process.exit(0);
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, next);
const origin = fromWorktree ? 'the api WORKING TREE' : REF;
console.log('  Wrote %s\n  from %s (%s), %d paths:', 'src/lib/api/generated/schema.ts', origin, sha, paths.length);
for (const p of paths) console.log('    %s', p);
