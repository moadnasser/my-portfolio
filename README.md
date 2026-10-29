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
3. Only add `liveUrl` / `sourceUrl` when they are real and public — the card and viewer hide the buttons otherwise.

## Supplying personal assets

- **CV:** drop a PDF in `public/cv/` and set `cvFile: '/cv/your-file.pdf'` in `profile.ts`. The header button appears automatically.
- **Portrait:** drop a square image in `public/` and set `photo: '/profile.jpg'`. Hero and About pick it up; the monogram fallback disappears.
- **WhatsApp:** set `whatsapp: '+218...'` to enable the contact button.
- **LinkedIn / Dribbble:** add `{ id: 'linkedin', label: 'LinkedIn', url: '...' }` to `socials`.

## Colour rule

Cool hues only: graphite backgrounds, teal / mint signal accent (`--accent`, `--accent-2`, `--accent-deep`).
No blue, no purple, no warm colours. All colours are CSS variables in `src/styles/index.css`;
the three.js scene mirrors them in `src/components/three/palette.ts` (three needs plain hex).

## 3D and motion

- `src/components/three/HeroScene.tsx` — react-three-fiber scene (liquid core, wireframe shell, orbit rings, 1800-particle halo). Lazy-loaded into its own chunk, pointer parallax over the whole hero, paused when scrolled out of view, single still frame under `prefers-reduced-motion`, skipped entirely when WebGL is unavailable.
- `src/components/ui/TiltCard.tsx` — pointer-following perspective tilt with glare (project and service cards). Off on touch devices and under reduced motion.
- `src/components/ui/Magnetic.tsx` — magnetic pull for the two focal CTAs (hero, contact).
- Tech ticker (`TechStrip.tsx`) is a CSS 3D plane with two counter-scrolling rows; the About visual (`About.tsx`) is a CSS 3D stack of floating plates. Both render static under reduced motion.
