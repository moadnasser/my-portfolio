# Portfolio — Moad Almshirem

Bilingual (English / Arabic), light + dark personal portfolio. Static, data-driven, no backend.

**Stack:** React 19 · TypeScript · Vite · Tailwind CSS v4 · Framer Motion · three.js (react-three-fiber + drei) · Lucide icons.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # typecheck + production build into dist/
npm run preview   # serve the production build
npm run lint      # oxlint
```

## Where things live

| What | Where |
|---|---|
| Personal details (name, email, CV, photo, WhatsApp, socials) | `src/data/profile.ts` |
| Projects shown in *Selected Work* | `src/data/projects.ts` + images in `public/projects/` |
| Technology strip | `src/data/technologies.ts` |
| Services (icons only; copy is in the locale files) | `src/data/services.ts` |
| All UI text, English / Arabic | `src/i18n/en.json`, `src/i18n/ar.json` |
| Colour, radius and font tokens (light + dark) | `src/styles/index.css` (`:root` / `[data-theme="dark"]`) |
| Theme + language persistence, no-flash bootstrap | `index.html` (inline script), `src/theme/`, `src/i18n/` |

## Adding a project

1. Put the cover and any extra screenshots in `public/projects/` (WebP, ~1600px wide for landscape, ~800px for portrait).
2. Append an entry to `src/data/projects.ts`. `coverOrientation` controls the grid framing (`landscape` spans two columns on desktop, `portrait` / `square` span one).
3. Only add `liveUrl` / `sourceUrl` when they are real and public — cards and the details panel hide the buttons otherwise.
4. Optional `screens` places real screenshots in device frames on cards: two phones for mobile apps, a browser plus phone for web apps. Without it the plain cover is used.

## Supplying personal assets

- **CV:** drop a PDF in `public/cv/` and set `cvFile: '/cv/your-file.pdf'` in `profile.ts`. The header button appears automatically.
- **Portrait:** drop a square image in `public/` and set `photo: '/profile.jpg'`. Hero and About pick it up; the monogram fallback disappears.
- **WhatsApp:** set `whatsapp: '+218...'` to enable the contact button.
- **LinkedIn / Dribbble:** add `{ id: 'linkedin', label: 'LinkedIn', url: '...' }` to `socials`.

## Colour rule

Cool hues only: graphite backgrounds, Telegram blue accent (#2AABEE / #0088CC via `--accent`, `--accent-2`, `--accent-deep`).
No purple, no warm colours. All colours are CSS variables in `src/styles/index.css`;
the three.js scene mirrors them in `src/components/three/palette.ts` (three needs plain hex).

## Pages

- `/` — home: hero, tech ticker, three featured projects, services, about, contact.
- `/projects` — full catalogue with filters; `/projects/<id>` expands that project's details inline and scrolls to it (shareable link). Unknown ids fall back to `/projects`, unknown paths to `/`.
- Routing is `react-router` (`src/App.tsx`); pages live in `src/pages/`.

## Live demos

Four projects ship an interactive demo at `/projects/<id>/demo`: simplified rebuilds of the real apps with the same flows and rules, sample data, and nothing sent to a server.

- Each demo lives in `src/demos/<id>/` with its own `en.json` / `ar.json` and loads as a separate chunk. `src/demos/registry.ts` lists them; cards, rows and the details panel show "Try live demo" only for registered ids.
- Phone apps render in a true-size iPhone frame scaled to fit on large screens; web apps render in a browser window. Below 768×640 the demo takes over the screen with its own mobile layout.
- Web demos use container queries (`@container`, `@4xl:`), so the same app shows its desktop layout inside the frame and its mobile layout on a phone.
- Each demo defines a short "Try this" checklist that ticks itself as the visitor uses the app.
- Playground thumbnails in `public/demos/thumbs/` are screenshots of the demos, one per theme. Recapture them after visual changes to a demo.

## 3D and motion

- `src/components/sections/HeroPortrait.tsx` — hero portrait: a cut-out photo (`public/portrait.webp`, subject lifted locally with macOS Vision) in front of a lit portal, turning light ring, tilted orbit and glass chips. Each layer has its own pointer depth on desktop; still on touch and under `prefers-reduced-motion`.
- `src/components/three/HeroScene.tsx` — lazy react-three-fiber particle field behind the hero, paused when scrolled out of view, skipped when WebGL is unavailable.
- `src/components/ui/TiltCard.tsx` — pointer-following perspective tilt with glare (project and service cards). Off on touch devices and under reduced motion.
- `src/components/ui/Magnetic.tsx` — magnetic pull for the two focal CTAs (hero, contact).
- Tech ticker (`TechStrip.tsx`) is a CSS 3D plane with two counter-scrolling rows; the About visual (`About.tsx`) is a CSS 3D stack of floating plates. Both render static under reduced motion.

## Deploying to cPanel

The host has no Node, so GitHub builds the site. On every push to `main`, `.github/workflows/deploy.yml`
runs `npm ci && npm run build` and publishes the contents of `dist/` (plus a tiny `.cpanel.yml`) to the
`deploy` branch. cPanel is pointed at that branch and only copies files.

One-time cPanel setup: Git Version Control » Create » clone `https://github.com/moadnasser/my-portfolio.git`,
branch `deploy`, into a folder outside `public_html` (for example `repositories/my-portfolio`).
Then, after each green Actions run: Manage » Pull or Deploy » Update from Remote » Deploy HEAD Commit.

- `public/.htaccess` ships with the build: long cache for hashed assets, no-cache for `index.html`, gzip.
- `public/.htaccess` also rewrites unknown paths to `index.html`: the site has client-side routes (`/projects`, `/projects/<id>`).
- `public_html` should be empty (or hold only files you no longer need) before the first deploy.
