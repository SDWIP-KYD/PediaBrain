# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

---

## [0.1.0] — 2026-06-08

### Added
- **GitHub Actions CI** — TypeScript check + Next.js build on every push/PR to `main`
- **Auto-Changelog** — GitHub Actions auto-appends entry to this file on every push (excludes `.github/**` and `CHANGELOG.md` itself)
- **WHO Growth Charts** — BB/U, TB/U, BB/TB, IMT/U charts with CDC data (by OpenCode)
- **Growth Curve Mini** — mini chart in visit expanded view (by OpenCode)
- **Full Report Popup** — chief complaint, antropometri, handle malformed sections (by OpenCode)
- **DPJP Column + Filter** — kanban view with DPJP column and 2-col rooms layout (by OpenCode)
- **Visit BB/TB/LK Display** — anthropometry shown in visit details + edit dialog (by OpenCode)

---

## [0.0.0] — 2026-06-04

### Added
- Initial PediaBrain setup (Next.js + Neon Postgres + Vercel)
- Patient management (CRUD, kanban view)
- Consultation notes (SOAP format)
- Medical reference notes system
- Auth system (password: `K95`)
- Telegram bridge (Hermes ↔ Hermes)
