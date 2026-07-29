# Laravel Web Builder — Project Guide

## Architecture

- **Laravel 12** (PHP 8.2+) — backend, source of truth, serves Inertia SPA
- **Node.js Engine** (Express) — sandboxed rendering of published projects at `localhost:4000`
- **PreviewProxyController** — serves published previews at `/app/{slug}` on Laravel (`localhost:8000`), proxies to Node Engine with inline project data via `X-Project-Data` header (avoids deadlock with single-threaded `php artisan serve`)
- **Inertia.js v2** — React 19 SPA with SSR, no Blade views except root `app.blade.php`
- **Tailwind CSS v4** — CSS-first config via `@theme` in `resources/css/app.css`
- **ShadCN UI** — Radix Nova style, Lucide icons
- **Monaco Editor** — code editing in show.tsx

## Key Commands

```bash
# Laravel + Vite dev server (no Node Engine)
composer run dev

# Node Engine (separate terminal)
cd node-engine && npm run dev

# Full build
npm run build

# Type check
npx tsc --noEmit

# Lint + format
npm run lint
npm run format

# Tests
php vendor/bin/pest

# Setup fresh project
composer run setup
```

## Project Structure

```
resources/js/
├── pages/
│   ├── auth/login.tsx
│   ├── auth/register.tsx
│   ├── dashboard.tsx
│   └── projects/
│       ├── create.tsx       # New project form with template selection
│       ├── index.tsx         # Project listing/cards
│       ├── preview.tsx       # Live preview iframe
│       └── show.tsx          # Main editor (file tree + Monaco + actions)
├── layouts/
│   └── admin-layout.tsx      # Sidebar + header + breadcrumbs
├── components/
│   ├── app-sidebar.tsx       # Nav sidebar with recent projects
│   └── ui/                   # ShadCN components
├── hooks/
│   └── use-mobile.ts
├── lib/
│   └── utils.ts              # cn() helper
├── types/
│   ├── index.ts              # Project, ProjectFile, etc.
│   └── index.d.ts
├── app.tsx                   # Inertia app entry
└── ssr.tsx                   # SSR entry
```

## Code Conventions

- **React**: Use `useState`/`useCallback` hooks, Inertia `usePage`/`useForm`, `router.post`/`delete` for mutations (never `fetch`)
- **File operations**: Always use `router.post`/`router.delete` with `preserveState: true` + `preserveScroll: true` + `onSuccess`/`onError` callbacks; update local state in `onSuccess`
- **Routing**: Use `route('name', params)` from Ziggy (no hardcoded URLs)
- **Types**: Defined in `resources/js/types/` — `Project`, `ProjectFile`, `ProjectAsset`, `PageProps`, `Flash`
- **Styling**: Tailwind utility classes, `cn()` for conditional classes, OKLCH color space for theme variables
- **Controllers**: Return `redirect()->back()` for Inertia-driven mutations (no JSON unless AJAX-only endpoint)
- **Error handling**: `toast.success()`/`toast.error()` from Sonner for user feedback
- **Editor (Monaco)**: Uses `absolute inset-0` positioning inside `relative overflow-hidden` parent for reliable sizing

## Routes

| Method | URI | Name | Notes |
|--------|-----|------|-------|
| GET | `/app/{slug}/{path?}` | `app.preview` | Public preview proxy |
| GET | `/` | `dashboard` | Auth required |
| GET/POST | `/projects` | `projects.index/store` | CRUD |
| GET/PUT/DELETE | `/projects/{project:slug}` | `projects.show/update/destroy` | CRUD |
| POST/DELETE | `/projects/{slug}/files` | `projects.files.store/destroy` | File CRUD |
| POST/DELETE | `/projects/{slug}/assets` | `projects.assets.store/destroy` | Asset CRUD |
| POST/POST | `/projects/{slug}/publish`/`unpublish` | `projects.publish/unpublish` | Publishing |
| POST/POST | `/ai/generate`/`improve` | `ai.generate/improve` | AI features |
| GET | `/api/internal/projects/{slug}` | — | Internal API (shared secret) |

## Key Patterns

### File operations (create, save, delete, rename, move)
Use `router.post`/`router.delete` with Inertia, update local `files` state via `onSuccess`. For rename/move: chain `post` then `delete` sequentially.

### Preview proxy flow
1. User visits `/app/{slug}` on Laravel
2. `PreviewProxyController` fetches project+files from DB
3. Sends request to Node Engine with `X-Project-Data` header (base64)
4. Node Engine reads header bypasses API callback → renders sandboxed EJS/Express → returns HTML
5. Laravel streams response back via `StreamedResponse` (avoids Boost logger body truncation)

### Publishing
`PublishController` creates snapshot in `project_publishes` table, purges Node Engine cache for that slug, sets `published=true`. Unpublish reverses it.

## Node Engine

- **Port**: 4000
- **Stateless**: Never accesses DB — data comes via internal API or `X-Project-Data` header
- **Sandbox**: `vm.createContext` with timeout (500ms) for EJS/Express rendering
- **Cache**: node-cache, 5min TTL, purged on publish/unpublish
- **Entry files**: index.ejs > index.html > first file in project
