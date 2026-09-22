# CLAUDE.md — jas-ad-studio-web

The rebuilt frontend of **Promptly**, designed from motionsites.ai (the feel) and Jakhongir's build (the structure). It replaced v1, which was archived to `~/projects/_archive/jas-ad-studio-web-v1` on 2026-09-22. This directory was called `jas-ad-studio-web-v2` until then; older notes that say `-v2` mean here. Planning docs live in the api repo: brief `../jas-ad-studio-api/docs/prompts/2026-09-13-frontend-rebuild.md`, design spec `../jas-ad-studio-api/docs/superpowers/specs/2026-09-13-web-v2-design.md`.

**Never edit, build or restart v1 or the api from here.** v2 is a client of the unchanged API.

## Routes

| Route | What |
|---|---|
| `/` | Hero + search, gallery (chips, play on demand, prompt sheet), how it works, Moslashtirish (7 owner photos), FAQ, CTA band |
| `/studiya` | 3 steps → generation → result with versions. `?loyiha=<id>` opens a saved project |
| `/admin` | Owner panel, 7 tabs, open tab in the URL hash |
| `/maxfiylik` | Interim privacy text |

Drawers (projects, credits) and the session live in `src/components/session.tsx`, mounted once in the root layout.

## Stack

Next.js 16.3 App Router · React 19 · TypeScript · Tailwind v4 (`@tailwindcss/postcss`) · `@phosphor-icons/react` (server components import `/ssr`) · Onest via `next/font` · `node --test` unit tests · Playwright at 1440/390/360. No animation library: CSS transitions only.

- **API types are generated**: `pnpm api:generate` reads `../jas-ad-studio-api/openapi.json` into `src/lib/api/schema.ts`; aliases in `src/lib/api/types.ts`. Never hand-write API shapes.
- **`src/lib/api/client.ts` is the only module that calls fetch or XHR** (same-origin `/api`, `credentials: 'include'`, `X-Requested-With` on writes, `Idempotency-Key`, `uploadWithProgress`).
- **All copy is in `src/lib/i18n/uz.ts`.** `uzbek-source.test.ts` fails on a quotation mark in `oʻ`/`gʻ` and on any em dash.

## Design system (tokens in `src/app/globals.css`)

- Monochrome dark, one theme: `bg #0F0F0F`, `raised #171717`, `raised-2 #1F1F1F`, `line #292929`, `line-strong #3D3D3D`, `ink #FAFAFA`, `muted #A1A1A1`. **No hue accent.** `danger`/`success` only for error/success states.
- `cta-gradient` (`#FAFAFA→#CFDEF6`) only on the one main action of a screen: hero "Videolarni koʻrish", studio "Reklama promptini tayyorlash", credits "Buyurtma berish".
- Buttons via `button({ variant, size })` in `src/components/ui/button.ts`: `primary | solid | outline | ghost | danger`, every size ≥ 44 px.
- Shape: pills for buttons/chips, `rounded-card` 20px for cards/panels/sheets, `rounded-input` 12px for inputs/thumbnails.
- Type: Onest only. Headlines 900/800 sentence case with −0.035 to −0.045em tracking; the hero badge is the only uppercase.
- One dialog primitive: `Sheet` (right panel ≥640px, bottom sheet below; focus trap/return, Escape).

## Commands

`nvm use` first (Node 24.19).

| | |
|---|---|
| `pnpm dev` | dev server on **3042**, rewrites `/api/*` to 3040. This is what pm2 `jas-web` runs and the public site serves |
| `pnpm lint` · `pnpm typecheck` · `pnpm test` | checks |
| `pnpm test:e2e` | Playwright ×3 widths against the running dev server on 3042 |
| `pnpm api:generate` / `api:check` | regenerate / verify API types |

The gallery e2e tests use the real API (published examples); every signed-in screen uses stubs from `tests/fixtures.ts`.

## Gotchas found building v2

- **Sora, Manrope, Geist, Golos, Figtree and Archivo have no U+02BB**; Onest, Inter and Inter Tight do. `document.fonts.check()` returns true even when the glyph is missing, so only a rendered, zoomed screenshot proves it.
- **Since 2026-09-13 this is the live site.** pm2 `jas-web` runs `pnpm dev` here on 3042 with `DEV_ALLOWED_ORIGINS=jas.kitobnarxi.uz`, and the `jas-ad-studio` tunnel serves it at https://jas.kitobnarxi.uz. v1 is archived and no longer in pm2. **Every saved edit here reaches real visitors on the next hot reload.** Run `pm2 save` (pm2 lives under Node 22: `~/.nvm/versions/node/v22.17.1/bin/pm2`) after changing the process.
- The API accepts writes only from `https://jas.kitobnarxi.uz` and `localhost:3042`. Google sign-in always returns to the public host, so Playwright tests signed-in screens on stubs.
- **`GET /api/packs` returns only priced packs**, and there is no owner list endpoint, so the admin cannot set a *first* price from the UI. That is an API gap, not a UI bug.
- **Hero photo slots are v1's indices (0–6)**, so the owner's saved `heroPhotos` overrides land on the same pictures (`src/lib/content.ts`).
- React 19's lint rule `react-hooks/set-state-in-effect` rejects synchronous setState in effects: key a component instead of syncing props, and take one-shot requests in a microtask with a ref guard (see `studio.tsx`).
- The studio's phone action bar is `sticky bottom-0` inside the form column, never `fixed`; `html` gets `scroll-padding-bottom` below 640px so focused fields clear it.
- Full-page Playwright screenshots show `loading="lazy"` images blank and sticky bars mid-page unless the script scrolls first; neither is a real bug.
- `getByRole('button', { name: 'Prompt' })` also matches "Prompt limiti" in the header: use `exact: true`.
- Never run `next build` while the dev server serves this directory.
