# Design Your Workspace — monis.rent

An interactive workspace builder for [monis.rent](https://www.monis.rent), who rent office
equipment to digital nomads and startups in Bali. Instead of scrolling a product catalogue,
you assemble a desk setup piece by piece, watch it come together in a live drawing, and rent
the whole thing by the week.

Built for the Desent Solutions developer challenge.

## What it does

- **Pick a desk and a chair** — each changes the drawing: the wooden desk gets a crank and
  tapered legs, chairs vary in back height, headrest and mesh.
- **Add up to three screens** — they lay themselves out side by side, and the desk grows to a
  wider size rather than shrinking the screens into toys.
- **Add the rest** — computers, desk gear, lighting, comfort (coffee, air, Starlink) and
  play (PS5, walking pad, padel). Everything you add appears in the room.
- **Free styling** — a plant, rug, wall print, shelf, surfboard. No charge; they just make the
  room look like somewhere you'd sit.
- **Sit / stand** — the electric desk rises and everything on it rises with it, while the chair
  rolls aside.
- **Live pricing** — weekly USD totals, a bundle discount that deepens as the setup grows, a
  rental-length slider, and a refundable deposit.
- **Checkout** — a summary view with the scene, itemised lines, totals and a delivery form.
- **Share & resume** — "Share" copies a link that encodes the whole setup; your build is also
  saved to this browser between visits.

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
```

```bash
npm run build && npm start   # production
npm run lint
```

## How the scene works

The preview is hand-drawn SVG, not sprites, so it recomposes for any combination.

Every piece in [`src/components/scene/art.tsx`](src/components/scene/art.tsx) draws in local
coordinates with its origin at **bottom-centre**, so placing one is just
`translate(x, groundY)`. [`WorkspaceScene.tsx`](src/components/scene/WorkspaceScene.tsx) then:

1. Reserves space at the desk edges for a lamp, laptop, mic and mini PC.
2. Sizes the desk to fit its contents (up to a maximum), then lays the screens into what's left.
3. Packs floor items outward from both desk edges so they never overlap.
4. Measures the whole composition and applies one fit transform, so no combination — three
   screens, a spin bike and a surfboard included — ever falls off stage.

Because the fit is a `transform`, it animates; the desk rising is a CSS transition, not a redraw.

## Product data

`src/data/catalog.ts` is generated from monis.rent's public product pages (their JSON-LD
structured data). Product names, weekly USD prices, categories, ratings, descriptions and
photography are Monis's own — 39 real products across Furniture, Monitors, Computers, Office
Accessories, Smart Home, Audio & Video, Gaming and Health & Fitness.

The `blurb`, `slot` and `art` fields are this app's own curation: which builder category a
product belongs to and which drawing represents it.

Two things are deliberately *not* real, and are labelled as such in the UI:

- **Styling items** (`src/data/decor.ts`) — plant, rug, print, shelf, surfboard. Not Monis
  products, priced at nothing.
- **The bundle discount tiers** (`src/lib/pricing.ts`) — Monis discount their real curated
  bundles by 20%; the sliding 5/10/15/20% scale here is this app's interpretation of that idea.

Checkout is a demo: nothing is charged and no order is sent anywhere.

## Layout

```
src/
  app/            layout, page, theme tokens in globals.css
  components/
    Designer.tsx        composition root + state provider
    Picker.tsx          category rail and product grids
    SummaryPanel.tsx    running total, discount tiers, rental length
    CheckoutSheet.tsx   review, delivery form, confirmation
    StageControls.tsx   sit/stand, surprise me, share, reset
    scene/
      art.tsx            every drawable piece
      WorkspaceScene.tsx composition, layout and auto-fit
  data/           catalog.ts (generated), decor.ts
  lib/            types, pricing, build-store (reducer + share links)
```

State lives in one reducer in `src/lib/build-store.tsx`. Share links and restored
localStorage are both run through `sanitize()`, so a stale link referencing a product that no
longer exists degrades instead of crashing the scene.

Light and dark themes both ship; the page follows the viewer's system setting.
