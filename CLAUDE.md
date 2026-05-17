# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server at http://localhost:4200 (proxies /api → localhost:3000)
npm run build      # Production build → dist/facturation/
npm run watch      # Watch build
npm test           # Karma + Jasmine test suite
```

No lint script is configured; TypeScript strict mode enforces type safety.

## Architecture

Angular 17 standalone components — no NgModules anywhere. All components use `standalone: true` with explicit `imports[]`.

### Routing

```
/             → HomeComponent            (public)
/login        → LoginComponent           (public)
/dashboard    → MainLayout + Dashboard   (authGuard protected)
```

`authGuard` decodes the JWT from localStorage and checks the `exp` claim. Expired or missing tokens redirect to `/login`.

### Core

- `core/auth/auth.service.ts` — JWT login/logout, `currentUser` signal, `isAuthenticated()` checks token expiry via `jwt-decode`
- `core/auth/jwt.interceptor.ts` — Auto-injects `Authorization: Bearer` header on all HTTP requests
- `core/layout/main-layout.component.*` — Sidebar + topbar shell for authenticated pages

### Features

Each feature lives under `features/<name>/` and is lazy-loaded via `loadComponent`. Currently:

- **home** — Landing page
- **login** — Template-driven auth form (no reactive forms)
- **dashboard** — KPI cards + 3 ECharts charts; data from `DashboardService.getSummary()` → `GET /api/dashboard/summary`

Dashboard uses Angular signals for state: `summary = signal<DashboardSummary | null>(null)`, `loading = signal(true)`, `error = signal('')`.

### State Management

No NgRx. Lightweight pattern:
- **Global auth state** — `AuthService.currentUser` signal, persisted to localStorage
- **Component state** — local signals + `computed()`
- **Server state** — fetched in `ngOnInit`, stored in component signals

### Charts

`ngx-echarts` wraps Apache ECharts. Chart components (`revenue-chart`, `status-donut`, `comparison-bar`) receive `@Input()` data from the parent dashboard and own their ECharts `EChartsOption` config.

### Models

`shared/models/kpi.model.ts` — `User`, `KpiSummary`, `DashboardSummary`
`shared/models/invoice.model.ts` — `Invoice`

### UI Stack

PrimeNG 17 components + PrimeFlex grid + PrimeIcons. Theme: Lara Dark Blue (configured in `angular.json` styles array). Custom design tokens in `src/styles.scss` (navy primary, status colors for paid/pending/overdue/sent/draft, Inter font).

### Backend

Expects a REST API on `localhost:3000` during dev (configured in `proxy.conf.json`). Current endpoints:
- `POST /api/auth/login` → returns JWT
- `GET /api/dashboard/summary` → returns `DashboardSummary`
