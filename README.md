# JAS Ad Studio — Web

The Next.js frontend for **JAS Ad Studio**: the one-page studio where Uzbek sellers upload a product photo, get a ready video prompt for Google Flow, and browse the example gallery.

**Status: P5 closed (2026-09-12, D-086).** The hero and tray, the three-step wizard, photo upload, the projects drawer with reopen and delete, the generation flow (generate, poll, the inline result, copy-with-fallback, TXT export, the Google Flow handoff), the seller's credit and order screens, and the `/admin` owner panel including generations and daily spend.

The whole path has been walked by hand against a running stack: sign in, upload, brief, spend a credit, get the prompt back. That found three defects in the api repo and five in this one, all fixed.

**The credit screens are built but nothing can be bought yet.** `GET /api/packs` returns packs with no price until an owner sets one, and the app never invents a number — see **D-082** in the api repo, which also notes that a real generation costs about 4,414 soʻm against the 1,100 the pricing assumed.

**P6, the example gallery, is next** and has no plan yet.

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
