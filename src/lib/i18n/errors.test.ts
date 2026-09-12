import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { errorCopy, hasErrorCopy, knownMessageKeys } from './index.ts';
import { uzLatn } from './uz-Latn.ts';
import { codeForStatus, messageKeyFor } from '../api/errors.ts';

const API_REPO = resolve(import.meta.dirname, '../../../../jas-ad-studio-api');

/**
 * The API's contract does not document its error codes: openapi.json carries request and
 * response schemas but no error responses, so the generated client cannot give us the
 * union. Until it does, the codes are read out of the api repo's `main` at test time
 * rather than copied into a list here that would quietly go stale.
 *
 * Reading main, not the working tree, for the same reason the client is pinned there
 * (W-002): an unmerged branch's codes are not ours to translate yet.
 */
function codesOnApiMain(): string[] {
  let files: string;
  try {
    files = execFileSync('git', ['-C', API_REPO, 'ls-tree', '-r', 'main', '--name-only'], {
      encoding: 'utf8',
    });
  } catch {
    return [];
  }

  const found = new Set<string>();
  for (const file of files.split('\n')) {
    if (!file.endsWith('.ts') || file.includes('.spec.')) continue;
    let source: string;
    try {
      source = execFileSync('git', ['-C', API_REPO, 'show', `main:${file}`], {
        encoding: 'utf8',
        maxBuffer: 8 * 1024 * 1024,
      });
    } catch {
      continue;
    }
    for (const match of source.matchAll(/(?:readonly )?code(?::| =) '([A-Z_]{4,})'/g)) {
      found.add(match[1]);
    }
  }
  return [...found].sort();
}

/**
 * Codes the API raises that are internal to the AI pipeline. They are logged, never
 * returned to a seller, so they need no Uzbek copy. Listed explicitly so that a new
 * code cannot be waved through by accident.
 */
const NOT_SELLER_FACING = new Set(['AI_REPAIR_CHANGED_STATUS', 'AI_VALIDATION_FAILED']);

test('every seller-facing code on the api main branch has Uzbek copy', () => {
  const codes = codesOnApiMain();

  // If the api repo is not beside this one, the check cannot run. Fail loudly rather
  // than pass silently: a green run has to mean the check actually happened.
  assert.ok(codes.length > 0, 'could not read error codes from the api repo main branch');

  const missing = codes.filter((code) => !NOT_SELLER_FACING.has(code) && !hasErrorCopy(code));
  assert.deepEqual(missing, [], `these API codes have no Uzbek message: ${missing.join(', ')}`);
});

test('every code the client raises itself has copy too', () => {
  // These never come from the API, so the extraction above cannot see them.
  for (const code of ['NETWORK_OFFLINE', 'INTERNAL_ERROR']) {
    assert.ok(hasErrorCopy(code), `${code} has no Uzbek message`);
  }
});

test('every status the wrapper maps without a body has copy', () => {
  // codeForStatus turns a bodyless 413 into UPLOAD_TOO_LARGE. If that code had no
  // copy, the seller would get the fallback instead of "Rasm juda katta".
  for (const status of [401, 403, 404, 413, 415, 429, 500, 502]) {
    const code = codeForStatus(status);
    assert.ok(hasErrorCopy(code), `HTTP ${status} maps to ${code}, which has no Uzbek message`);
  }
});

test('every spec §9 code has copy, including the ones P3 and P4 will raise', () => {
  // Listed in the design spec §9. Wiring them now means P3 and P4 inherit a complete
  // error map instead of shipping English or a shrug.
  const spec = [
    'UPLOAD_TYPE',
    'UPLOAD_TOO_LARGE',
    'UPLOAD_DAMAGED',
    'SESSION_EXPIRED',
    'NO_CREDITS',
    'ORDER_PENDING',
    'AI_TIMEOUT',
    'AI_REFUSED',
    'AI_MALFORMED',
    'AI_TRUNCATED',
    'REFERENCE_CONFLICT',
    'RATE_LIMITED',
    'SPEND_CAP_REACHED',
    'CONFIG_MISSING',
  ];
  const missing = spec.filter((code) => !hasErrorCopy(code));
  assert.deepEqual(missing, [], `spec §9 codes with no Uzbek message: ${missing.join(', ')}`);
});

test('no error entry is a bare apology: every one offers an action', () => {
  // Source 01 §47: never show only "Something went wrong". This is the rule as a test.
  for (const [code, copy] of Object.entries(uzLatn.errors)) {
    assert.ok(copy.message.trim().length > 0, `${code} has no message`);
    assert.ok(copy.action.trim().length > 0, `${code} has a message but no recovery action`);
    assert.ok(!copy.message.includes('...'), `${code} reads like a placeholder`);
  }
});

test('ownership refusal is worded exactly like not-found, so it leaks nothing', () => {
  // The API returns 404 for another user's project, never 403, because a 403 would
  // confirm the id exists. The copy has to keep that promise.
  assert.equal(
    errorCopy('PROJECT_OWNERSHIP').message,
    errorCopy('PROJECT_NOT_FOUND').message,
    'a different message here would tell an attacker the project exists',
  );
});

test('an unknown code still produces a usable screen', () => {
  const copy = errorCopy('SOMETHING_WE_HAVE_NEVER_SEEN');
  assert.equal(copy.message, uzLatn.errors.internal_error.message);
  assert.ok(copy.action.length > 0);
});

test('message keys are built the way the API builds them', () => {
  assert.equal(messageKeyFor('SESSION_EXPIRED'), 'errors.session_expired');
  assert.ok(knownMessageKeys().includes('errors.upload_too_large'));
});
