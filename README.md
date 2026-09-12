# JAS Ad Studio — Web

The Next.js frontend for **JAS Ad Studio**: the one-page studio where Uzbek sellers upload a product photo, get a ready video prompt for Google Flow, and browse the example gallery.

**Status: P5's studio is built (2026-09-12).** The hero and tray, the three-step wizard, photo uploads, the projects drawer, the `/admin` owner panel, and the generation flow — generate, poll, the inline result, copy-with-fallback, TXT export and the Google Flow handoff.

Two things are outstanding, and neither is blocked by the API: a visual pass on the two generation panels, and an end-to-end test of the signed-in flow, which needs a sign-in fixture. See `HANDOFF-P5-generation.md`.

The credits and order screens are not built, and cannot be finished yet: `GET /api/packs` returns an empty list until an owner prices a pack, and the price itself is an open question — see **Q-17** and **D-082** in the api repo.

The backend and all planning docs live in `../jas-ad-studio-api`. Start with its `README.md` and `CLAUDE.md`.

## Getting started

Needs Node 24 and pnpm. The api must be running for anything past the landing page: the
dev server proxies `/api` to it (D-032), so sign-in, uploads and generation all go through
the real backend rather than a mock.

```bash
nvm use
pnpm install
pnpm api:generate       # regenerate the typed client from ../jas-ad-studio-api/openapi.json
pnpm dev                # http://localhost:3042
```

In another shell, from the api repo: `pnpm infra:up && pnpm dev` and `pnpm dev:worker`.
**The worker matters** — without it a generation stays queued for ever, which on screen is
indistinguishable from a slow one.

## Checks

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
pnpm api:check          # fails if the generated client drifted from the api's main
pnpm test:e2e           # Playwright at 360, 390 and 1440 (needs `pnpm build && pnpm start`)
```

`pnpm api:check` is the one that catches a stale client. It compares against the api's
committed `openapi.json`, so it fails the moment the contract moves and the client has not
been regenerated (D-031).
