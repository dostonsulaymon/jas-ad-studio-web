import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  exportFilename,
  formatSeconds,
  isTerminal,
  MAX_POLLS,
  pollDelayMs,
  pollUntilDone,
  toPlainText,
  type AdPackage,
  type GenerationDetailDto,
} from './generation.ts';

const LABELS = {
  concept: 'Gʻoya',
  hook: 'Ilk jumla',
  cta: 'Chaqiriq',
  shots: 'Kadrlar rejasi',
  prompt: 'Prompt',
  madeWith: 'Videoni Google Flow tayyorlaydi.',
};

function pkg(overrides: Partial<AdPackage['result']> = {}): AdPackage {
  return {
    generationId: '00000000-0000-4000-8000-000000000000',
    promptEn: 'Use the supplied product reference as the sole visual source of truth.',
    createdAt: '2026-09-12T18:30:00.000Z',
    result: {
      status: 'ready',
      questionsUz: [],
      messageUz: null,
      product: {
        category: 'Krossovka',
        observedDetails: [],
        confirmedClaims: [],
        unknownDetails: [],
        referenceConflicts: [],
        fidelityConstraints: ['Taglik rangi saqlansin'],
      },
      concept: {
        titleUz: 'Yengil qadam',
        rationaleUz: 'Yengillikni harakat orqali koʻrsatadi.',
        formatId: 'product-film',
        hookUz: 'Yengillikni his qiling',
        ctaUz: 'Buyurtma bering',
      },
      target: { targetId: 'google-flow', durationSeconds: 10, aspectRatio: '9:16' },
      shots: [
        { startSeconds: 0, endSeconds: 6.5, descriptionUz: 'Aylanadi.', cameraUz: 'Push-in' },
        { startSeconds: 6.5, endSeconds: 10, descriptionUz: 'Taglik.', cameraUz: 'Tilt' },
      ],
      promptEn: 'Use the supplied product reference as the sole visual source of truth.',
      assumptionsUz: [],
      reviewNotesUz: [],
      ...overrides,
    },
  } as AdPackage;
}

test('only the four terminal states end a poll', () => {
  assert.equal(isTerminal('queued'), false);
  assert.equal(isTerminal('running'), false);
  for (const status of ['ready', 'needs_input', 'refused', 'failed'] as const) {
    assert.equal(isTerminal(status), true);
  }
});

test('polling backs off instead of hammering a 60-second job', () => {
  // A fixed 1s poll would make ~60 requests for one measured generation (D-082).
  assert.equal(pollDelayMs(0), 1_000);
  assert.equal(pollDelayMs(5), 2_000);
  assert.equal(pollDelayMs(30), 3_000);

  let total = 0;
  for (let i = 0; i < MAX_POLLS; i += 1) total += pollDelayMs(i);
  // Long enough for a slow run plus a repair, not so long the tab waits for ever.
  assert.ok(total > 120_000, `gives up after ${String(total)}ms, too soon`);
  assert.ok(total < 300_000, `gives up after ${String(total)}ms, too late`);
});

test('the export carries the Uzbek plan and the English prompt verbatim', () => {
  const text = toPlainText(pkg(), LABELS);

  assert.match(text, /Gʻoya: Yengil qadam/);
  assert.match(text, /Ilk jumla: Yengillikni his qiling/);
  // 6.5 keeps its decimal; 10 does not gain one.
  assert.match(text, /0–6\.5s/);
  assert.match(text, /6\.5–10s/);
  assert.ok(text.includes(pkg().promptEn), 'the prompt must appear exactly as sent to Flow');
  // The product rule travels with the file.
  assert.match(text, /Google Flow tayyorlaydi/);
});

test('an export still works when the model returned no concept', () => {
  // needs_input and refused results have concept: null, and a seller can still have
  // asked to export whatever did come back.
  const text = toPlainText(pkg({ concept: null }), LABELS);
  assert.doesNotMatch(text, /Gʻoya:/);
  assert.ok(text.includes('Prompt:'));
});

test('seconds are formatted the way a shot list reads', () => {
  assert.equal(formatSeconds(0), '0');
  assert.equal(formatSeconds(10), '10');
  assert.equal(formatSeconds(6.5), '6.5');
});

test('the export filename is safe and findable', () => {
  assert.equal(
    exportFilename('Nam salfetkalar, 120 dona', '2026-09-12T18:30:00.000Z'),
    'nam-salfetkalar-120-dona-2026-09-12.txt',
  );
  // Uzbek or Cyrillic only: no empty name, and nothing a filesystem will mangle.
  assert.equal(exportFilename('Мажлис', '2026-09-12T00:00:00.000Z'), 'jas-prompt-2026-09-12.txt');
});

/** A fake fetch sequence for the poll loop. */
function detail(status: GenerationDetailDto['status']): GenerationDetailDto {
  return {
    id: '00000000-0000-4000-8000-000000000000',
    projectId: '00000000-0000-4000-8000-000000000001',
    status,
    questionsUz: [],
    messageUz: null,
    errorCode: null,
    createdAt: '2026-09-12T18:30:00.000Z',
    finishedAt: status === 'queued' || status === 'running' ? null : '2026-09-12T18:31:00.000Z',
    package: null,
  };
}

test('a poll survives a transient failure rather than declaring the job lost', async (context) => {
  const answers: (GenerationDetailDto | Error)[] = [
    detail('queued'),
    new Error('network blip'),
    detail('running'),
    detail('ready'),
  ];
  let call = 0;

  context.mock.method(globalThis, 'fetch', () => {
    const answer = answers[call];
    call += 1;
    if (answer instanceof Error) return Promise.reject(answer);
    return Promise.resolve(
      new Response(JSON.stringify(answer), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  });

  const seen: string[] = [];
  const done = await pollUntilDone('00000000-0000-4000-8000-000000000000', {
    onStatus: (status) => seen.push(status),
    wait: () => Promise.resolve(),
  });

  // The credit is already spent: one bad poll must not become a failed generation.
  assert.equal(done.status, 'ready');
  assert.deepEqual(seen, ['queued', 'running', 'ready']);
});

test('a poll gives up on a run of failures', async (context) => {
  context.mock.method(globalThis, 'fetch', () => Promise.reject(new Error('down')));

  await assert.rejects(
    pollUntilDone('00000000-0000-4000-8000-000000000000', { wait: () => Promise.resolve() }),
  );
});

test('a poll stops at once when the job is gone', async (context) => {
  let calls = 0;
  context.mock.method(globalThis, 'fetch', () => {
    calls += 1;
    return Promise.resolve(
      new Response(JSON.stringify({ code: 'GENERATION_NOT_FOUND' }), { status: 404 }),
    );
  });

  await assert.rejects(
    pollUntilDone('00000000-0000-4000-8000-000000000000', { wait: () => Promise.resolve() }),
  );
  // A 404 will not fix itself, so retrying it is only noise.
  assert.equal(calls, 1);
});
