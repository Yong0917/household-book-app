# Repository Guidelines

## Project Structure & Module Organization
`app/` contains the Next.js 15 App Router routes, including protected pages under `app/(protected)` and auth flows under `app/auth`. Reusable UI lives in `components/`, grouped by feature such as `ledger/`, `notes/`, `settings/`, `statistics/`, and shared primitives in `components/ui/`. Server-side data logic is in `lib/actions/`, Supabase clients are in `lib/supabase/`, and shared helpers live in `lib/utils*`. Database schema changes belong in `supabase/migrations/`. Static assets and store screenshots live in `public/` and `docs/screenshots/`. This web app is also packaged inside the Android project at `/Users/seung-yongsin/Documents/Yong/money-logs-andorid`, where it is delivered through a WebView wrapper.

## Build, Test, and Development Commands
Use `npm install` to sync dependencies from `package-lock.json`. Run `npm run dev` for local development on `http://localhost:3000`. Use `npm run build` to create a production build and catch App Router or type-related build failures. Run `npm run start` to serve the production build locally. Use `npm run lint` before opening a PR; this repo relies on ESLint for the main automated quality gate.

## Coding Style & Naming Conventions
Write TypeScript with 2-space indentation and semicolons, matching the existing codebase. Use PascalCase for React components (`TransactionSheet.tsx`), camelCase for functions and variables, and lowercase route segment names in `app/`. Keep server actions in `lib/actions/*.ts` and prefer the existing `@/` path aliases from `components.json` and `tsconfig.json`. Styling uses Tailwind CSS plus shadcn/ui primitives; extend tokens in `app/globals.css` or `tailwind.config.ts` instead of scattering one-off values.

## Testing Guidelines
There is no dedicated `npm test` script yet. At minimum, run `npm run lint` and verify affected flows manually in the browser. For UI work, update or capture screenshots when behavior changes; the repository already includes reference images such as `test-01-login-page.png` through `test-08-notes.png`. Because the app is shipped inside an Android WebView, manually check mobile navigation, OAuth/session handling, safe-area spacing, file download/upload flows, and back-button behavior when changes could affect embedded usage. For Supabase changes, add a new migration file rather than editing old migrations.

## Commit & Pull Request Guidelines
Recent history follows Conventional Commit prefixes such as `feat:`, `fix:`, `refactor:`, and `build:`. Keep commits focused and descriptive, ideally scoped to one feature or bug. PRs should include a short summary, affected screens or flows, any required environment or migration steps, and screenshots for visible UI changes. Link related issues or product docs when relevant.

## Security & Configuration Tips
Keep secrets in `.env.local`; only the public variable names documented in `.env.example` should be committed. Supabase URL and publishable key are required for auth and data access. Review `proxy.ts` and `middleware.ts` behavior carefully when changing authentication or route protection. When changing login, redirects, downloads, or browser APIs, confirm the behavior still works in the Android wrapper project as well as in a normal mobile browser.
