# Gladiators Website

Official React + Vite landing page for **Gladiators / Battle Arena**, styled to match the existing game repo.

## Design Tokens Reused From The Game

- Display font: `Showcard Gothic`
- UI font: `Segoe UI`
- Primary background: `#1A140F`
- Secondary background: `#2A1810`
- Surface tones: `#2C1F14`, `#3D2817`, `#5C4033`
- Borders and metallic trim: `#7C5A24`, `#8B7355`
- Primary gold: `#D4A017`
- Bright gold highlight: `#FFD700`
- Main text: `#F5E6D3`
- Soft text: `#EFDDAA`, `#CBB68A`
- Blood red accents: `#8B0000`, `#A50000`, `#BC1A1A`

## Included Pages

- `Home`
- `Leaderboard`
- `Team Progress`

## Features

- React 18 + Vite + JavaScript
- React Router v6 data router
- Tailwind CSS v3 with Gladiators branding tokens
- Framer Motion page and component animations
- Lucide React icons
- LocalStorage-backed team todo board
- Responsive dark-only interface
- Real character art copied from the main Gladiators repo

## Getting Started

```bash
npm install
npm run dev
```

## Build For Production

```bash
npm run build
npm run preview
```

## Vercel Leaderboard Backend

The deployed site now expects real Vercel API routes under `/api/*`.

For a live leaderboard on Vercel:

1. Connect a hosted Postgres database to the Vercel project.
2. Set `DATABASE_URL` in the Vercel project environment.
3. Optionally set `GAME_UPLOAD_API_KEY` if you want desktop uploads protected.
4. Redeploy the site.

The game client can then post battle results to:

```text
https://your-site.vercel.app/api/game-results
```

In the desktop game, point:

- `GLADIATORS_WEB_API_URL` to `https://your-site.vercel.app`
- `GLADIATORS_WEB_API_KEY` to the same secret value as `GAME_UPLOAD_API_KEY` if upload protection is enabled

The leaderboard and recent-battles pages will read from the same deployment:

```text
https://your-site.vercel.app/api/leaderboard
https://your-site.vercel.app/api/matches/recent
```

## Lint

```bash
npm run lint
```

## Notes

- Routing uses `createHashRouter` so the site can deploy cleanly to static hosts like GitHub Pages without extra rewrite setup.
- Replace the placeholder trailer embed ID in `src/pages/Home.jsx`.
- Swap the placeholder game section with the live game embed when ready.
