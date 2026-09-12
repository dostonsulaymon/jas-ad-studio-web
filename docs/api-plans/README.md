# API phase plans, copied from `jas-ad-studio-api`

**These are copies. The originals live in `../jas-ad-studio-api/docs/superpowers/plans/` and that repo is the source of truth.** If a plan here disagrees with the one there, the api repo wins — and the copy is stale, so re-copy it rather than editing this one.

They are here because the api repo's phase plans decide this repo's world: every route, request body, response shape and error code the studio UI talks to is settled in them before it is built.

| plan | what it gives the web app |
|---|---|
| `2026-09-12-phase-3-credits-orders.md` | **Built and merged.** `GET /api/packs`, `GET /api/settings/public`, `GET /api/credits/balance`, `POST /api/orders`, `GET /api/orders`, `POST /api/orders/:id/cancel`, and the whole `/api/owner/*` tree the `/admin` panel calls (D-037). |
| `2026-09-12-phase-4-generation-pipeline.md` | **Built and merged.** `POST /api/projects/:id/generations` (needs an `Idempotency-Key` header, answers **202**) and `GET /api/generations/:id` for polling. |

## What matters most for the UI

- **Prices.** `GET /api/packs` returns **only** packs the owner has priced and activated, so **today it is an empty array**. Addendum A §A8 forbids showing a price before the owner configures one, and the UI must render an empty list as "not yet on sale", never as an error or a placeholder price (D-072).
- **Payment instructions** come from `GET /api/settings/public`, which works signed out. `POST /api/orders` returns **409 `PAYMENT_NOT_CONFIGURED`** when the owner has not set a card or a Payme/Click link, so the buy button needs that state.
- **An order is never "paid" until the owner confirms it.** It is created `pending` and the seller waits (D-008). Never show a payment as successful before the status says `paid`.
- **Generation is a poll, not a request/response.** `POST` answers 202 with a `generationId`; the client polls `GET /api/generations/:id` until `ready`, `needs_input`, `refused` or `failed`. **This is what makes a success survive a reload** — do not hold the result only in client state.
- **`Idempotency-Key` is required** on `POST .../generations`, and the same key returns the same job. That is the double-click guard; generate a key per attempt and reuse it on retry, never a fresh one.
- **Errors are `{ code, messageKey, details?, requestId }`.** Map `messageKey` to Uzbek in this repo; the API never sends a user-facing sentence, and a raw provider message never reaches a seller.

## The client is generated, not written

`openapi.json` in the api repo generates `src/lib/api/generated/schema.ts` here (D-031), and `pnpm api:check` fails when the two drift. Never hand-edit the generated file.

**Two contract bugs were found by regenerating and reading the output**, which is worth knowing because nothing on the api side could have caught either — it has no client:

- **D-083:** the ad package was typed `unknown`, so the concept, shot plan and prompt arrived as `any` — the whole payload the result screen renders.
- **D-084:** every **nullable** field was published as an array of its own type. `payerReference` and `rejectionReason` were `string[]` from P3 until 2026-09-12.

Both are fixed and guarded by a test in the api repo. The lesson for this side: after `pnpm api:generate`, **read the diff**. A green `api:check` only means the client matches the contract, not that the contract is right.
