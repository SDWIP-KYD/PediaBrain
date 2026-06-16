# PediaBrain

Medical knowledge management system untuk dokter anak.

## Tech Stack
- **Next.js 16** (App Router) + React 19
- **Drizzle ORM** + PostgreSQL (Neon)
- **Tailwind CSS 4** + Shadcn UI
- Deployment: **Vercel**

## Commands
- `npm run dev` — development server
- `npm run build` — production build
- `npm run lint` — ESLint check
- `npx tsc --noEmit` — TypeScript check
- `npx knip` — unused exports check

## Key Env Vars
- `AUTH_PASSWORD` + `SESSION_SECRET` — single-password auth
- `AI_API_KEY` + `AI_BASE_URL` + `AI_MODEL` — AI integration
- `TIANYUAI_API_KEY` + `TIANYUAI_BASE_URL` — legacy AI (chat, lab-extract)
- `DATABASE_URL` — Neon PostgreSQL

## Multi-Agent Rules
Lihat @AGENTS.md
