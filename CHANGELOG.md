# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

---

## [0.3.0] — 2026-09-12

### Changed

- **Lab Lookup v3** — multi-RM search (up to 100 NORMs, paste from WA/sensus),
  parallel per-patient fetching (cap 6 concurrent) with independent error states
- Collapsible hierarchy: Patient → Visit → Parameters
- Per-patient parameter search across all visits (Hema-style flat table, newest first)
- Copy-visit button (konsul/WA text format)
- Per-patient Refetch button (bypasses 6h server cache)
- **Removed** trend charts (HGB/PLT/WBC graphs) — replaced by search + full history

---

## [0.2.0] — 2026-09-11

### Added

- **Lab Lookup with live SIMRS data** — `/lab-lookup` page + `/api/hema-lookup`
  proxy (two-phase: quick preview + background full-fetch job, 6h cache)
- Collapsible visit cards with reference ranges + subtle low/high markers
- Special modules display (PA/Rad/BMP/LCS/Immuno/IHC)
- Load More pagination (20 visits)
- Server perf: parallel page fetch w/ per-worker sessions (90s → 40s cold)

### Removed

- AI Toolbox page (sidebar, navbar, shortcuts)

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
