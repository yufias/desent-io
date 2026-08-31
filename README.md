# desent-io

Next.js + Tailwind CSS starter.

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS v4 · TypeScript · ESLint

## Getting started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Layout

```
src/app/
  layout.tsx    Root layout — fonts + metadata
  page.tsx      Home page
  globals.css   Tailwind import + theme tokens
public/         Static assets
```

Tailwind v4 is configured through CSS, not a JS config file — customize theme tokens in the
`@theme inline` block in `src/app/globals.css`. The `@/*` import alias maps to `src/*`.
