# AGENTS.md — u-lar

Mono-repo: `u-lar_be` (ASP.NET Core 10 Web API) + `u-lar_fe` (React 19 / Vite / TypeScript). No CI workflows, no root `opencode.json`.

## Developer commands

Backend (run from repo root):
```bash
dotnet build                                  # builds u-lar_be.slnx
dotnet run --project u-lar_be                # http://localhost:5116  (env Development via launchSettings)
dotnet ef database update --project u-lar_be  # apply migrations
dotnet ef dbcontext info --project u-lar_be   # sanity-check DbContext wiring
```
Frontend (run from `u-lar_fe`):
```bash
bun install
bun run dev     # Vite dev server, http://localhost:5173
bun run build   # tsc -b && vite build
bun run lint
```
There is **no test project**. Adding one is future work.

## Backend wiring

- `Program.cs` calls five extension methods in `ServiceCollectionExtensions.cs`: `AddApiServices`, `AddOptionsConfiguration`, `AddPersistence`, `AddFeatureServices`, `AddJwtAuthentication` (+ `AddCorsConfiguration`).
- `AddApiServices` registers controllers, API versioning (URL segment → `/api/v1/...`), OpenAPI + Scalar (Development-only), and the global `GlobalExceptionHandler`.
- `AddPersistence` wires a single `AppDbContext` via Npgsql + EF Core snake_case naming. **No raw SQL anywhere.**
- `AddFeatureServices` is the only DI site — one line per feature slice.
- Passwords: `Microsoft.AspNetCore.Identity.PasswordHasher<T>` registered open-generic for both `Student` and `AdminUser`.
- Auth: admin creates student accounts (students cannot self-register). JWT bearer auth; student tokens are validated against DB `IsActive` on every request.

## Backend constraints (hard)

- One project only — never split into multiple projects/solutions.
- No raw SQL, `FromSqlRaw`, or string-built queries. All DB access is LINQ over `AppDbContext` DbSets.
- Controllers are request/response only — business logic in feature services.
- No `try/catch` for HTTP shaping in controllers/services; throw `NotFoundException`/`ConflictException`/`ForbiddenException` from `Common/Exceptions/` (converted to `ProblemDetails` by `GlobalExceptionHandler`).
- All config via `appsettings.json` strongly-typed options — no hardcoded config values.
- Don't add packages or scaffolding without a concrete need (see `u-lar_be/Features/README.md`).

## Configuration must-haves

- `appsettings.json` is **gitignored**. Copy from `appsettings.example.json` is empty/incomplete — use `appsettings.Development.json` as the working template, or set env:
  - `ConnectionStrings__Postgres` — local PostgreSQL `u_lar` database.
  - `Jwt__Key` — a strong key (startup validates length/signing via data annotations).
  - `AdminSeed__Password` — admin seed password.
- CORS policy `UlarAdminWeb` allows `http://localhost:5173` (and `192.168.69.91:5173` in Development).
- `Microsoft.OpenApi` is pinned to 2.11.0 — transitive 2.0.0 has a security advisory (GHSA-v5pm-xwqc-g5wc). Don't drop the pin.

## Backend conventions

- Feature-first vertical slices under `Features/` — each contains DTOs, service interface + impl, validators. Slices don't import each other's services; shared types go in `Common/` or `Domain/`.
- DB schema: `Domain/Common/BaseEntity` (Id, CreatedAt, UpdatedAt) is auto-timestamped in both `SaveChanges` overloads. Table names + relations live in `IEntityTypeConfiguration<T>` files under `Persistence/Configurations/`.
- Namespace is `u_lar_be` (underscores); folder is `u-lar_be` (hyphens).
- `db_table.md` (gitignored, local) is the 28-table schema design — consult before modeling entities.

## Frontend conventions

- `src/services/api.ts` is the single API base URL + Axios instance. Reads `VITE_API_BASE_URL` or falls back to `http://<hostname>:5116/api/v1`. Auto-attaches `accessToken` from localStorage; 401 clears auth and redirects to `/login`.
- Tailwind CSS via `@tailwindcss/vite` plugin.
- TypeScript: `verbatimModuleSyntax: true`, `noUnusedLocals/Parameters: true` — unused vars error.
- ESLint uses flat config (`eslint.config.js`) with react-hooks and react-refresh plugins.

## API surface

- OpenAPI: `/openapi/v1.json` (Development-only). Scalar UI: `/scalar/v1` (Development-only).
- `u-lar_be/u-lar_be.http` contains sample requests with hardcoded bearer tokens — good for smoke testing, won't reflect real auth state.
