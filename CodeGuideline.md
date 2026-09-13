# Code Guideline

## Project Structure Overview

This is an **Nx monorepo** managed with **pnpm workspaces** (`apps/*`, `libs/shared/*`).

```
project-root/
  ├── apps/
  │   ├── web/                    # Public marketplace app (Vite + React, port 8080)
  │   │   ├── i18n.config.json    # i18n manifest for supported locales and language metadata
  │   │   ├── public/locales/     # public/locales/{code}.json translation files
  │   │   └── src/
  │   │       ├── components/     # Web app components (feature + ui/)
  │   │       ├── hooks/          # Web app custom hooks
  │   │       ├── i18n/           # i18n runtime: config.ts (entry) + util.ts (helpers)
  │   │       ├── lib/            # Web app utilities and state (store, supabase usage)
  │   │       ├── pages/          # Web app pages
  │   │       ├── App.tsx         # Root app component / providers
  │   │       ├── main.tsx        # Entry point
  │   │       └── index.css       # Global styles
  │   └── admin/                  # Back-office app (Vite + React, port 8090)
  │       └── src/
  │           ├── components/     # Admin components (Sidebar, KpiCard, DataTable, …)
  │           ├── lib/            # Admin utilities (auth provider)
  │           ├── pages/          # Admin pages (Login, Dashboard, Users, Listings, …)
  │           ├── App.tsx         # Root app component / providers / routes
  │           └── main.tsx        # Entry point
  ├── libs/
  │   └── shared/
  │       ├── types/              # @housemates/shared-types   — shared TypeScript types
  │       ├── utils/              # @housemates/shared-utils   — shared helpers (cn, formatting, …)
  │       ├── data/               # @housemates/shared-data    — shared business data & constants
  │       ├── supabase/           # @housemates/shared-supabase — Supabase client + data access
  │       └── ui/                 # @housemates/shared-ui      — shared UI components
  ├── supabase/
  │   └── migrations/             # SQL migrations + RLS policies (applied directly to Supabase)
  ├── package.json                # Workspace scripts (delegate to nx)
  ├── pnpm-workspace.yaml         # Workspace package globs
  ├── tsconfig.base.json          # Shared compiler options + path aliases
  ├── nx.json                     # Nx configuration
  └── eslint.config.js            # Shared ESLint config
```

> Backend-handoff temporary files (`scripts/`, `i18n.scan.json`, `reports/i18n/`, `docs/i18n-*.md`) are kept in the repo only until backend integration of i18n statistics/scan/auto-translate is complete. They are owned by the backend long-term and will be removed once integration lands. Treat them as read-only handoff copies — do not extend them.

## Directory Responsibilities

### Shared libraries (`libs/shared/*`)

- Package names are **flat** scoped names: `@housemates/shared-types`, `@housemates/shared-utils`, `@housemates/shared-data`, `@housemates/shared-supabase`, `@housemates/shared-ui`.
- Each library's public API is re-exported from its `src/index.ts`. Do not deep-import past the package boundary.
- Apps import libs by package name; Vite aliases in `apps/{web,admin}/vite.config.ts` map each name to the lib's `src/` directory, so lib changes take effect without a build step.
- Do **not** let an app import another app; shared code must live in a lib.
- `@housemates/shared-supabase` owns all Supabase access (client construction, web queries, admin data layer). Apps never build their own client.

### Apps

- **`apps/web/src/`**: see the individual responsibilities below. Web-only concerns (i18n, user store, web routes) stay here — not in shared libs.
- **`apps/admin/src/`**: back-office pages, admin components, and the auth provider (`lib/auth.tsx`). Reuses the shared admin data layer from `@housemates/shared-supabase` (`admin.ts`) and shared UI from `@housemates/shared-ui`.

### Web app internals

- **`src/components/`**: All web UI components.
  - **`ui/`**: Atomic and composite UI components.
  - *Group related components into subdirectories if they share a domain or feature (e.g., `form/`, `charts/`).*
- **`src/hooks/`**: Custom React hooks. Each file should export a single hook focused on one responsibility.
- **`src/i18n/`**: Two files only.
  - `config.ts` is the runtime entry: imports the manifest via `util.ts`, initializes i18next (HTTP backend, language detector, react binding), syncs `<html lang/dir>`, and re-exports the helpers. Importing this file for its side effect boots i18next.
  - `util.ts` holds pure helpers parsed from the manifest: `fallbackLng`, `supportedLngs`, `languageOptions`, `normalizeLanguage`, `getLanguageDirection`, plus types.
  - Components use the official `useTranslation()` from `react-i18next` directly; there is no project-specific `useT` wrapper.
- **`src/lib/`**: Utility functions and libraries that are not React components or hooks.
- **`src/pages/`**: All route-level pages.
  - *Each page should have its own subdirectory if it contains more than a single file or has related logic/components.*
- **`src/App.tsx`**: Sets up global providers.
- **`src/main.tsx`**: Application entry point.

**Important:**
Whenever a new module (such as a component, hook, or utility) or a new page is added or removed, this document **must be updated immediately** to reflect the changes. Keeping this documentation up to date ensures that all collaborators have a clear understanding of the current project structure and its intended organization.

## How to Add New Code

### 1. Adding a New Page

- **Create a subdirectory under `src/pages/` (in the relevant app) for each new page.**
  - Example: For a "Dashboard" page, create `apps/web/src/pages/dashboard/`.
- **Place the main page component as `index.tsx` inside the subdirectory.**
- **Add any page-specific components or logic in the same subdirectory.**
- **Register the new route in `src/router.tsx` and generate a semantic name.**
  - Example:
    ```tsx
    import Dashboard from "./pages/dashboard";
    // ...
    {
      path: "/dashboard",
      name: "dashboard",
      element: <Dashboard />,
    }
    ```

### 2. Adding a New Component

- **If the component is shared across apps or reused broadly, add it to `libs/shared/ui/src/` and re-export it from `src/index.ts`.**
- **If the component is app-specific, place it in that app's `src/components/`.**
- **If the component is only used by a specific page, place it in that page's subdirectory under `src/pages/`.**
- **Each component should be focused on a single responsibility.**
- **Small files (< 100 lines) are encouraged for a single component.**

### 3. Adding a New Hook

- **Create a new file in `src/hooks/` named after the hook (e.g., `use-feature.ts`).**
- **Each file should export only one hook.**
- **Hooks should be as small and focused as possible.**

### 4. Adding Utilities

- **Add app-specific utilities to that app's `src/lib/`.**
- **Add utilities shared by multiple apps to `libs/shared/utils/src/` (re-exported from its `index.ts`).**
- **Group related utilities in the same file or subdirectory if needed.**

### 5. Adding or Updating Languages

- **Language metadata must go through `apps/web/i18n.config.json`.**
- **Do not hardcode supported languages, labels, browser detection aliases, or RTL direction lists in `src/i18n/*.ts`.**
- **Locale content lives in `apps/web/public/locales/{code}.json`** as flat dotted-key JSON; the `fallbackLng` file owns the canonical key set.
- **Runtime code reads the manifest only through `src/i18n/util.ts`.** Adding or removing a language means editing `i18n.config.json` plus the matching `public/locales/{code}.json`; nothing in `src/i18n/` needs to change.
- **Translations are read with the official `useTranslation()` from `react-i18next`.** No custom hook, no cast at call sites.

### 6. Adding Supabase Data Access

- **Never construct a Supabase client in app code.** Use `@housemates/shared-supabase` (`client.ts`).
- **Add app-facing queries to `libs/shared/supabase/src/queries.ts` and admin-facing queries to `admin.ts`; re-export from `src/index.ts`.**
- **When a query needs a new RLS policy, add it as a new additive migration in `supabase/migrations/`** (prefix with the date, e.g. `migration_YYYYMMDD_short_description`), modeled on the existing `reports_admin_*` and `profiles_admin_update` policies.

## Coding Best Practices

- **One module, one responsibility:**  
  Each file (component, hook, utility) should do one thing only.
- **High cohesion, low coupling:**  
  Keep related logic together and avoid unnecessary dependencies between modules.
- **Naming conventions:**  
  - Use `PascalCase` for components and page directories.
  - Use `camelCase` for hooks and utility functions.
  - Name page subdirectories and files after their route or feature.
- **Component structure:**  
  - Keep components small and focused.
  - Extract subcomponents if a component grows too large.
- **Page structure:**  
  - Place all logic, hooks, and components specific to a page in its subdirectory.
  - Only share code via `components/`, `hooks/`, `lib/`, or a shared lib if it is truly reusable.
- **TypeScript config:**  
  - `tsconfig.base.json` defines shared options and path aliases (`./`-relative, no `baseUrl`).
  - Per-app tsconfigs repeat the aliases (TS `paths` are replaced, not merged, on `extends`).
- **Documentation:**  
  - Add comments for complex logic.
  - Document the purpose of each module at the top of the file if not obvious.
  - Keep `README.md` and this document in sync with the actual structure.

## Example: Adding a New "Profile" Page

1. **Create a directory:**  
   `apps/web/src/pages/profile/`
2. **Add the main page component:**  
   `apps/web/src/pages/profile/index.tsx`
3. **Add page-specific components:**  
   `apps/web/src/pages/profile/ProfileHeader.tsx`, `apps/web/src/pages/profile/ProfileDetails.tsx`
4. **Register the route in `App.tsx`:**
   ```tsx
   import Profile from "./pages/profile";
   // ...
   <Route path="/profile" element={<Profile />} />
   ```
5. **If you need a reusable button, add it to `libs/shared/ui/src/button.tsx`** (and re-export from the lib's `index.ts`).
