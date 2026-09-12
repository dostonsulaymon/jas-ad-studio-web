# P5's generation slice — what the api session built, and what is left for you

Written by **Session A** (the api repo) on 2026-09-12, because Doston asked it to finish
P5 with one condition: *"designing parts should be done by the second one not by you."*

**The reasoning is recorded as D-085 in `../jas-ad-studio-api/DECISIONS.md`**, as this
repo's `CLAUDE.md` instructs. Read that before changing any of it — several choices look
arbitrary and are not.

Nothing here is committed. It is on `p5-studio-ui` as working-tree changes, for you to
review, reshape and commit as your own.

## New files

| file | what it is |
|---|---|
| `src/lib/generation.ts` | All the logic: start, poll with backoff, TXT export, copy-with-fallback, the Flow URL. Pure and testable — no React. |
| `src/lib/generation.test.ts` | 9 tests, including the poll surviving a transient failure and giving up on a run of them. |
| `src/components/studio/result.tsx` | The ready state: concept, shot plan, prompt, and the three actions. |
| `src/components/studio/generation-progress.tsx` | Every other state: queued, running, needs_input, refused, failed. |

## Changed files

- `src/lib/api/client.ts` — one named `idempotencyKey` option. Deliberately not a generic headers bag.
- `src/lib/i18n/uz-Latn.ts` — a `generate` section, `review.generate` / `review.generationCost`, and the five P4 error codes **your own `errors.test.ts` caught me missing**.
- `src/components/studio/studio.tsx` — the generate state machine and the attempt key.
- `src/components/studio/workbench.tsx` — step 3 renders the result in place of the review once a package exists.
- `src/components/studio/step-review.tsx` — a real generate button, and the cost stated before the press.

## The design is yours

`result.tsx` and `generation-progress.tsx` are **structure and behaviour only**. They reuse
the tokens and control sizes already in the studio and invent no new visual language,
because that is your direction to set. Reshape them freely.

**Three things must survive any redesign**, because they are product rules and not taste:

1. **Only the prompt goes on the clipboard** (source 01 §48). Not the concept, not the shot plan.
2. **The app never claims to make the video.** The Flow control is a link out, and `t.generate.flowNote` says who makes what (D-050).
3. **The prompt block stays selectable and never truncated.** When the Clipboard API is missing — common in in-app browsers — that block *is* the copy mechanism.

## What is left

- **An e2e test of the flow.** It needs a signed-in seller holding a credit, and there is
  no sign-in fixture here. That is real infrastructure and it is yours; your 18 layout
  checks pass at 360/390/1440 against this build, but nothing exercises the gated path.
- **The visual pass** on both new panels.
- **The credits and order screens** are still unbuilt, and `GET /api/packs` returns `[]`
  until Jakhongir prices a pack — see **D-082**: a real generation costs about 4,414 som
  against the 1,100 som the pricing assumed, so the numbers are likely to move.

## Verified before handing over

```
pnpm lint       → clean          pnpm build     → compiled, 3 routes
pnpm typecheck  → clean          pnpm test:e2e  → 18 passed (360, 390, 1440)
pnpm test       → 53 passed      pnpm api:check → matches main (956d354), 26 paths
```
