# AGENTS.md (Plan Mode)

This file provides guidance when planning or designing changes in this repository.

## Non-obvious architectural constraints

- **pywebview JS bridge is synchronous from Python's side** — all public methods on `API`/`SettingAPI` are auto-exposed; returning non-serializable types (ORM objects, exceptions) will silently fail on the JS side. Always convert to dicts before returning.
- **`API` holds authenticated session state** (`current_employee_id`, `current_tenant_id`) as instance variables — the class is stateful and not thread-safe. There is one shared `API` instance per window.
- **Multi-tenancy is enforced in application code only** — every query that touches tenant data manually filters by `current_tenant_id`. The database has no row-level security.
- **The settings window is a separate pywebview window with its own `SettingAPI` instance** — it cannot share state with the main `API` directly.
- **Dev mode startup is Windows-only**: `start_server()` uses `CREATE_NEW_CONSOLE` (Windows-only flag) and a hardcoded 3-second sleep for Vite to warm up.
- **`frontend/dist/` is the production artifact** — Vite builds two entry points (`index.html`, `setting.html`). Any new HTML page added requires a corresponding entry in `vite.config.js` `rolldownOptions.input`.
- **`Base` (SQLAlchemy `DeclarativeBase`) is shared** — all models must inherit from `internal.models.base.Base` so `Base.metadata.create_all()` in tests creates all tables at once.
- **No migration tooling** — there is no Alembic or similar. Schema changes must be applied manually to the database.
- **Frontend routing is manual** — `contextManager.register()` / `contextManager.show()` is the entire routing system. There is no URL-based routing; browser history is not used.
- **Event bus history tracks subscription events, not dispatch events** — `getHistory()` returns event names that were subscribed to, which is counterintuitive for debugging dispatches.
