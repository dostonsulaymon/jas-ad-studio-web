# Design — direction A, "Ish stoli"

Chosen by Doston on 2026-09-12 from three directions. This is the source of truth for the
P5 studio UI: layout, spacing, Uzbek copy and the two structural ideas.

Open `direction-a.html` in a browser. It is a static artboard file with no framework and no
build step. Nine artboards: hero, step 1 and the upload-in-progress state, each at desktop
1440 and at 390 px.

**The two ideas that must survive implementation:**

1. **The hero's main visual is a tray of product photos bleeding off both edges, with one
   empty slot cut into it.** The slot is the file input. The seller's photo is the missing
   piece of the tray, not a button under a headline.
2. **The studio is a two-pane workbench: controls left, the seller's product pinned right.**
   The product stays visible for all three steps. On a phone the right pane becomes a sticky
   strip under the step bar, never a hidden pane.

## Files

| | |
|---|---|
| `direction-a.html` | The chosen direction. Nine artboards. |
| `font-finding.html` | Why the face changed from Manrope to Inter. Open it in a browser; the evidence only exists rendered. |
| `board.css` | Shared tokens and primitives for both artboard files. The palette here is the locked one from `../../CLAUDE.md`. |
| `prepare-photos.py` | Regenerates `img/` from the api repo's `out/pack`. |
| `img/` | Prepared product plates. **Git-ignored** — regenerate them, see below. |

All three directions, plus the font evidence, are also published at
<https://claude.ai/code/artifact/e9fd63e1-2529-479e-87ca-4563f0cb1e7a> with the photos baked in,
which is the one place to look if you cannot regenerate `img/`.

## Regenerating the photos

`img/` is git-ignored because the source photos are the owner's and live only in
`../jas-ad-studio-api/out/pack`, which is itself git-ignored.

```bash
python3 -m venv /tmp/jas-design && /tmp/jas-design/bin/pip install -q pillow
/tmp/jas-design/bin/python docs/design/prepare-photos.py docs/design
```

The script takes the first positional argument as the output root and writes to `<root>/img`.

## Two things about the photos, both real

- They are **stock cut-outs on white**, not seller phone photos. That is honest to the
  context — an Uzum or OLX listing looks exactly like this — so every cut-out sits on a
  plate derived from the palette rather than floating on the page ground. Keep that.
- **`phones.jpg` is a Google Pixel press photo with visible G logos.** It is kept out of
  every hero on purpose and used only inside the studio, where it reads as a seller's own
  upload. Putting a competitor's branded press photo in JAS's own marketing surface is a
  brand and licensing risk. Ask Doston before changing that.

## What the artboards deliberately do not show

Steps 2 and 3, the result, credits, orders and `/admin`. Step 2 needs Uzbek labels for the
contract's `goal` and `formatId` enums, which do not exist yet in either repo; the rest needs
P3 and P4. The plan at
`../../../jas-ad-studio-api/docs/superpowers/plans/2026-09-12-phase-5-studio-ui.md`
lists every blocked item with the phase that unblocks it.
