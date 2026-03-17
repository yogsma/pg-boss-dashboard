# Changelog

## [2.0.0] - 2026-03-09

### BREAKING CHANGES

- **API routes moved**: All queue endpoints moved from `/api/queues/*` and `/api/jobs/*` to `/api/modules/queues/queues/*` and `/api/modules/queues/jobs/*`. Clients using the old endpoints must update their URLs.
- **Module system**: The application now uses a convention-based module architecture. Existing code under `services/`, `controllers/`, `routes/`, and `types/` has been moved to `modules/queues/`.
- **Dashboard layout**: The UI now uses a sidebar navigation layout with a `(dashboard)` route group. The root page is now a hub overview instead of the queue list.
- **Docker healthcheck**: Updated from `/api/queues` to `/api/modules` endpoint.

### Features

- **Postgres Ecosystem Hub**: Transformed from a queue-only dashboard into a multi-module PostgreSQL management hub with sidebar navigation.
- **Module system**: Convention-based module architecture with auto-discovery, health checks, and dynamic sidebar rendering.
  - Backend modules: `modules/<name>/index.ts`, `routes.ts`, `controller.ts`, `service.ts`, `types.ts`
  - Frontend modules: `modules/<name>/index.ts`, `pages/`, `components/`, `lib/api.ts`
  - Module registry with `GET /api/modules` endpoint for runtime discovery
- **Database Health module**: Monitor PostgreSQL performance via `pg_stat` views.
  - Connection usage gauge (active/idle/max)
  - Cache hit ratio monitoring
  - Database size overview
  - Slow query detection with configurable duration threshold
  - Table sizes with bar chart (top 10) and sortable table
  - Index usage statistics and unused index detection
- **Cron Jobs module** (pg_cron): Manage scheduled PostgreSQL jobs.
  - View all cron schedules with human-readable expression tooltips
  - Toggle jobs active/inactive via `PATCH` endpoint
  - Success/failure count tracking per job
  - Paginated execution history
  - Auto-detected via health check (hidden when pg_cron not installed)
- **Time Series module**: Explore and visualize time-bucketed data from any table.
  - Auto-discover tables with timestamp columns via `information_schema`
  - Configurable time range presets (1h, 6h, 24h, 7d, 30d)
  - Adjustable granularity (minute, hour, day, week, month)
  - Interactive Recharts area chart
  - SQL injection prevention: regex + information_schema validation for all identifiers
- **Sidebar navigation**: Collapsible module sections using shadcn sidebar component.
- **Hub overview page**: Module status cards showing availability and descriptions.
- **Reusable components**: `StatCard`, `PageHeader` with breadcrumbs.
- **Docker Compose**: Full-stack `docker-compose.yml` with PostgreSQL and dashboard services.

### Dependencies Added

- `recharts` (>=2.15) - Charts for health gauges, time series, bar charts
- `@radix-ui/react-collapsible` - Sidebar collapsible sections
- shadcn components: `sheet`, `skeleton`, `tabs`, `tooltip`, `select`, `switch`, `collapsible`, `sidebar`

### Migration Guide

If you were using the API directly:

| Old Endpoint | New Endpoint |
|-------------|-------------|
| `GET /api/queues` | `GET /api/modules/queues/queues` |
| `GET /api/queues/:name` | `GET /api/modules/queues/queues/:name` |
| `GET /api/queues/:name/jobs` | `GET /api/modules/queues/queues/:name/jobs` |
| `GET /api/jobs/:id` | `GET /api/modules/queues/jobs/:id` |
| `DELETE /api/queues/:name/jobs/:id` | `DELETE /api/modules/queues/queues/:name/jobs/:id` |
| `DELETE /api/queues/:name/jobs` | `DELETE /api/modules/queues/queues/:name/jobs` |
| _(new)_ | `GET /api/modules` - list all modules |

## [1.9.3]

- build(deps-dev): bump brace-expansion in /package/ui (#42) (5562502)

## [1.9.1](https://github.com/yogsma/pg-boss-dashboard/compare/v1.2.0...vnull) (2026-03-09)

* fix: remove fragile dry-run version detection from release workflow (#46) (f7aa6c9)
* fix: remove invalid releaseNotes template and restore RELEASE_TOKEN (#45) (b40d3fa)
* fix: use GITHUB_TOKEN instead of expired RELEASE_TOKEN in release workflow (#44) (b5a0d9f)
* fix: security issues and upgrade to node 20 (#43) (afb3fa1)
* build(deps-dev): bump js-yaml from 4.1.0 to 4.1.1 in /package/ui (#28) (8acc814)
* build(deps): bump qs and express in /package/api (#36) (6d90da4)
* build(deps): bump basic-ftp from 5.0.5 to 5.2.0 (#38) (1aa23e1)
* build(deps): bump minimatch in /package/ui (#39) (69587fa)
* build(deps): bump axios from 1.12.0 to 1.13.5 in /package/ui (#35) (a9883f1)
* build(deps-dev): bump minimatch from 3.1.2 to 3.1.5 in /package/api (#40) (7bf3f84)
* build(deps): bump glob from 10.4.5 to 10.5.0 in /package/ui (#29) (47eae7c)
* build(deps): bump form-data from 4.0.1 to 4.0.4 in /package/ui (#22) (4ad1fbc)
* build(deps): bump next from 15.2.4 to 15.4.7 in /package/ui (#23) (fd43592)
* build(deps): bump axios from 1.8.2 to 1.12.0 in /package/ui (#24) (a97175f)
* feat: add job details page (#21) (bb0b8bc)
* build(deps): bump next from 15.2.3 to 15.2.4 in /package/ui (#20) (03de21a)
* build(deps): bump next from 15.1.5 to 15.2.3 in /package/ui (#19) (efcd900)
* build(deps): bump axios from 1.7.9 to 1.8.2 in /package/ui (#18) [skip ci] (5c771c6)
* chore: adjust release notes (#17) (3ccc934)
* chore: add version for release (#16) (57635c2)

# 1.9.0 (2025-02-01)

### Bug Fixes

- adjust button and toaster layout ([#15](https://github.com/yogsma/pg-boss-dashboard/issues/15)) ([498f40f](https://github.com/yogsma/pg-boss-dashboard/commit/498f40f36f7d4908091348bda1f73fc69bb2c7ca))

## [1.8.0] - 2025-01-31

### Features

- add delete option for jobs ([#13](https://github.com/yogsma/pg-boss-dashboard/issues/13)) ([dd33db9](https://github.com/yogsma/pg-boss-dashboard/commit/dd33db94d7dd0b8adfa4495887b9358458e2fbcd))

## [1.7.0] - 2025-01-31

### Bug Fixes

- move draft check for github ([#9](https://github.com/yogsma/pg-boss-dashboard/issues/9)) ([5f44a09](https://github.com/yogsma/pg-boss-dashboard/commit/5f44a09484dcfa271812609a9fec0d938d8906a7))
- release workflow fix ([#8](https://github.com/yogsma/pg-boss-dashboard/issues/8)) ([cbcbd8e](https://github.com/yogsma/pg-boss-dashboard/commit/cbcbd8efdefbc2dc4522804fc69883ce626f5cca))
- remove draft check ([#10](https://github.com/yogsma/pg-boss-dashboard/issues/10)) ([75b52d5](https://github.com/yogsma/pg-boss-dashboard/commit/75b52d59eba83003ef4f7b0ec2488f093dfc46f4))

## [1.2.0] - 2025-01-19

### Bug Fixes

- add token ([857b1cd](https://github.com/yogsma/pg-boss-dashboard/commit/857b1cdeafd0e3fe1155baead7b6e53636ca83b1))
- minor version bump ([#3](https://github.com/yogsma/pg-boss-dashboard/issues/3)) ([78b81e4](https://github.com/yogsma/pg-boss-dashboard/commit/78b81e44f6f50ee15cabf410d997ef0817d65295))
- release build fix ([c0b5c9e](https://github.com/yogsma/pg-boss-dashboard/commit/c0b5c9e6c7f3fddbaaecc947762d3dde0d175976))
- update release rules ([#2](https://github.com/yogsma/pg-boss-dashboard/issues/2)) ([96f47cc](https://github.com/yogsma/pg-boss-dashboard/commit/96f47ccb88102a7b7d154bb061490755710363cd))
- use new favicon ([#1](https://github.com/yogsma/pg-boss-dashboard/issues/1))

### Features

- pg-boss-dashboard ui initial release