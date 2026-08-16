# Housemates Finder (CampusHouseMate)

Back-office and marketplace monorepo for the "Housemates Finder" campus housing platform.

This is an **Nx monorepo** managed with **pnpm workspaces**. It contains a customer-facing marketplace app (`apps/web`), a back-office admin app (`apps/admin`), shared libraries (`libs/shared/*`), and the Supabase schema/migrations (`supabase/`).

---

## Overview

| Package | Description |
| --- | --- |
| `apps/web` | Public marketplace: listing browse, saved listings, chat, profile, i18n. Vite + React on port `8080`. |
| `apps/admin` | Back-office: dashboard KPIs/charts, user & listing moderation, reports, settings. Vite + React on port `8090`. |
| `libs/shared/ui` | `@housemates/shared-ui` — shared UI components (shadcn-based: button, card, dialog, table, toaster, …). |
| `libs/shared/data` | `@housemates/shared-data` — shared business data, schools list, constants. |
| `libs/shared/types` | `@housemates/shared-types` — shared TypeScript types (Listing, Profile, Report, …). |
| `libs/shared/utils` | `@housemates/shared-utils` — shared helpers (`cn`, formatting, dates, …). |
| `libs/shared/supabase` | `@housemates/shared-supabase` — Supabase client + typed data access (web queries + admin data layer). |
| `supabase/` | SQL migrations and RLS policies (SQL, not linked to the `supabase` CLI). |

> Shared package names are **flat** scoped names (`@housemates/shared-ui`), not subpaths (`@housemates/shared/ui`), because npm forbids `/` inside the package name part.

---

## Local development

Prerequisites: **Node 20+** and **pnpm** installed.

```bash
pnpm install          # install all workspace deps
```

Run an app (root scripts delegate to Nx):

```bash
pnpm dev              # web app  -> http://localhost:8080
pnpm dev:admin        # admin app -> http://localhost:8090
pnpm dev:web          # same as pnpm dev
```

### Environment

Each app reads `.env` from its own directory:

- `apps/web/.env.example` → copy to `apps/web/.env`
- `apps/admin/.env.example` → copy to `apps/admin/.env`

Required variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

---

## Nx / pnpm workspace commands

Run from the repo root:

```bash
pnpm build            # build all projects (web + admin + libs)
pnpm build:web        # build the web app only
pnpm build:admin      # build the admin app only
pnpm lint             # lint all projects
pnpm typecheck        # typecheck all projects
pnpm check            # lint + typecheck for all projects
pnpm test:e2e         # Playwright e2e suite (web app)
```

Project-specific commands:

```bash
pnpm exec nx run web:build
pnpm exec nx run admin:serve
pnpm exec nx show projects
pnpm exec nx graph     # visualize the dependency graph
```

> Nx 23 infers targets from each package's `package.json` scripts and config files, so `typecheck`, `lint`, `build`, and `serve` targets exist automatically per project.

### Adding code to a shared library

1. Add/modify the source under the library's `src/` (e.g. `libs/shared/ui/src/…`).
2. Re-export new public API from the library's `src/index.ts`.
3. Import it in apps via the package name (e.g. `import { cn } from "@housemates/shared-utils"`). Vite aliases (in `apps/web/vite.config.ts` and `apps/admin/vite.config.ts`) map each package name to its `src/` directory, so no build step is required for the libs.

---

## Supabase

- Schema and RLS live as plain SQL migrations in `supabase/migrations/` (applied to Supabase directly; the `supabase` CLI is not wired in).
- Migrations are prefixed with the date (e.g. `migration_20260816_admin_access`) and are additive.
- RLS conventions:
  - Regular users manage their own rows only (`auth.uid() = …`).
  - Admins are `profiles.is_admin = true`; admin policies mirror the `reports_admin_*` pattern.
  - The `protect_admin_fields` trigger prevents non-admin users from self-elevating or toggling their own suspension.
- The admin app signs in with a normal Supabase user; admin capabilities come purely from RLS policies plus UI gating (`AdminGuard` in `apps/admin`).

---

## Tech stack

- **Build/workspace**: pnpm workspaces + Nx 23
- **Apps**: Vite 7, React 18, TypeScript
- **UI**: Tailwind CSS, shadcn-ui components, Radix primitives, lucide-react, recharts (admin)
- **State/data**: Zustand (web), @supabase/supabase-js
- **i18n**: i18next / react-i18next / i18next-http-backend (web app only)
- **Tests**: Playwright (web e2e)

---

## Deployment

- **Web app**: deploy `apps/web` (Vite static build). Enter.pro handles the build + publish for the linked project.
- **Admin app**: deploy `apps/admin` behind admin-only auth; every data mutation is additionally protected by RLS.
- Apply `supabase/migrations/*` to the target Supabase project before/after releasing (they are additive).
