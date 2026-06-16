# PediaBrain — Multi-Agent Development Rules

This document defines how multiple AI agents (OpenCode, Hermes Laptop, Hermes HP) collaborate on this project.

---

## 🤖 Agent Roles

| Agent | Device | Primary Role | Filescope |
|---|---|---|---|
| **OpenCode** | MacBook | Frontend: UI, UX, features, design | `src/app/*`, `src/components/*`, `src/lib/*` (UI-related) |
| **Hermes Laptop (Kayden)** | Windows/WSL | Backend: API logic, Vercel deploy, AI integration, DevOps | `src/app/api/*`, `src/lib/ai/*`, `scripts/*`, `.github/*` |
| **Hermes HP (Zai)** | Android/Termux | Data pipeline: DB insertion, medical notes, research, testing | `scripts/*.py`, `docs/*`, `drizzle/*` |

---

## ⚡ Golden Rules

### 1. Always `git fetch` before starting
```bash
git fetch origin main
git pull origin main
```
Local state ≠ production state. Multi-agent = race conditions without sync.

### 2. Branch per task (for features affecting shared files)
```bash
git fetch origin main
git pull origin main
git checkout -b feature/nama-task
# ... work ...
git push origin feature/nama-task
# → PR on GitHub, other agents review
```

### 3. Commit message format
```
<type>: <short description>

[<optional detail>]
[by OpenCode/Hermes-Laptop/Hermes-HP]
```
Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

### 4. Never edit the same file simultaneously
If you need to edit a shared file (`middleware.ts`, `auth.ts`, `package.json`), coordinate via Telegram first or use a branch.

### 5. Test before push
```bash
cd frontend
npx tsc --noEmit        # TypeScript check
npx next build          # Build test
```

---

## 📁 File Ownership

### OpenCode owns:
- `src/app/**` (page routes)
- `src/components/**` (UI components)
- `src/lib/growth-charts/**` (growth chart logic)
- `src/lib/db/**` (client-side queries)
- `src/hooks/**`
- `src/lib/utils.ts`

### Hermes Laptop (Kayden) owns:
- `src/app/api/**` (server-side API routes)
- `src/lib/ai/**` (AI integration)
- `scripts/*.py` (backend scripts)
- `.github/workflows/**` (CI/CD)
- `drizzle.config.ts`
- `next.config.ts`

### Hermes HP (Zai) owns:
- `scripts/insert.py` (DB insertion)
- `docs/**` (draft reports, medical notes)
- `drizzle/schema.ts` (DB schema changes — coordinate first!)
- Testing& verification

### Shared (coordinate before editing):
- `package.json`
- `src/middleware.ts`
- `src/lib/auth.ts`
- `src/env.ts`

---

## 🔄 Sync Protocol

### Before starting work:
1. `git fetch origin main`
2. `git pull origin main`
3. Check recent commits: `git log --oneline -10`

### After completing work:
1. `git add . && git commit -m "type: description"`
2. `git push origin main`
3. Vercel auto-deploys from `main` branch

### When taking over a task:
1. Post in Telegram: "I'm taking [task] — OpenCode/Hermes"
2. `git fetch && git pull`
3. Check `CHANGELOG.md` for recent changes

---

## 📊 Communication

| Channel | Use Case |
|---|---|
| **GitHub commits** | "Who did what, which files changed" — visible to all agents |
| **GitHub Actions** | Auto-test + CHANGELOG update on push → audit trail |
| **Telegram** | Real-time discussion, clarifications, blockers |
| **CHANGELOG.md** | Full history of changes (auto-generated) |
| **AGENTS.md** | Role rules and file ownership |

---

## 🛠️ Development Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS, Shadcn UI
- **Backend:** Next.js API Routes
- **Database:** Neon Postgres (PostgreSQL), Drizzle ORM
- **Deployment:** Vercel
- **Auth:** Single password (`K95`), 30-min session cookie
- **AI:** MiniMax via proxy

---

## 🧪 Testing

Before any push to `main`:
```bash
cd frontend
npx tsc --noEmit        # Zero TypeScript errors
npx next build          # Clean build
```

CI runs automatically on every push/PR. PRs with failing CI won't be merged.

---

## 📋 Backlog Management

Tasks are tracked via GitHub Issues. Use labels:
- `frontend` — OpenCode territory
- `backend` — Hermes Laptop territory
- `data` — Hermes HP territory
- `bug` — bug fixes
- `enhancement` — new features

---

*Last updated: 2026-06-08 by Hermes HP (Zai)*
