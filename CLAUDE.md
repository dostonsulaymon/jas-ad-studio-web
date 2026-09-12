# CLAUDE.md — jas-ad-studio-web

**Starting a new session:** read `../jas-ad-studio-api/docs/PROGRESS.md` → **Resume here** first. Then read `../jas-ad-studio-api/CLAUDE.md`. All planning docs live in the api repo: the brief, decisions, plan, progress, open questions, and the owner's source documents. Never copy them here; link to them.

---

## What this is

The Next.js frontend of **JAS Ad Studio**: the one-page studio. It has a hero, the 3-step wizard, the inline result, the example gallery, the FAQ, a project-history drawer, and the credit and order screens. There is also a small owner-only `/admin` panel for orders, grants and settings (D-037).

**It renders pages and UI only.** Every business rule (credits, AI, ownership, validation that matters) lives in the API (D-002, D-006).

## Status

**Planning. There is no code yet.** Nothing gets built before its phase plan in `../jas-ad-studio-api/docs/superpowers/plans/` is approved.

## How work proceeds

The same protocol as the api repo: one question at a time, a plan before code, one part at a time, and a stop for review after each part. Record decisions in `../jas-ad-studio-api/DECISIONS.md`.

## Stack (proposed)

| | |
|---|---|
| Framework | Next.js 16, App Router, React 19, TypeScript |
| Styling | Tailwind v4 via `@tailwindcss/postcss`, the same as kitobnarx-web (D-035) |
| API client | Generated from `../jas-ad-studio-api/openapi.json` with one command. Never hand-write API types (D-031) |
| Tests | Playwright for flows at 390 px and desktop |

## Design direction (source 01 §5, §38–§40)

- **Palette:** background `#F6F5F1` · ink `#17211D` · muted `#56625C` · primary evergreen `#163D32` with white text · accent citron `#D9F36A`, used sparingly with dark text · border `#DEDFD7`.
- **Type:** Manrope or an equivalent that supports o‘ and g‘. Restrained type scale, generous line spacing.
- **Shape:** rounded corners 12–18 px. Not everything is a pill-shaped card.
- **Avoid:** purple AI gradients, glowing orbs, glassmorphism, sparkles, fake charts, rows of six identical feature cards, and national decoration everywhere.
- **Motion:** 160–280 ms, purposeful, with `prefers-reduced-motion` respected. No scroll hijacking, no custom cursor, no heavy WebGL.
- **Mobile:** fully usable at 360 px, comfortable at 390 px. Tap targets 44 px or more, form controls 16 px or more, no horizontal page overflow.
- **Accessibility:** semantic HTML, visible focus, real buttons, labelled icon buttons, screen-reader status announcements, and dialogs that manage focus.

## UI rules that must never be broken

- Uzbek Latin with the correct `o‘` and `g‘`. Prefer "tayyorlash" over "yaratish".
- Never imply the app makes videos. The main action is **"Reklama promptini tayyorlash"**, never "Video tayyorlash".
- **Copy** puts only the clean prompt on the clipboard: no headings, JSON, credit counts or notes. If the clipboard fails, show a selectable text box.
- The gallery and copying its prompts work signed out and never cost credits (D-007).
- Show no prices until the owner configures real packs. No fake testimonials, numbers or examples.
- Render all text from the API as plain text, never as raw HTML.

## Commands

None yet. Phase 0 adds them.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
