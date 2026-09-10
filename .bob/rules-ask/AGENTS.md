# AGENTS.md (Ask Mode)

This file provides guidance when answering questions about this repository.

## Non-obvious context

- **`frontend/framework/`** is a custom hand-rolled framework (EventBus, EventList, History, IComponentModel) — not an installed library. Documentation lives only in JSDoc comments inside those files.
- **`solvi/`** in the project root is the Python virtual environment, not application code.
- **The backend is Node.js/Hono/Kysely** at `backend/` — NOT Python. The old Python/pywebview backend (`internal/`) no longer exists.
- **The frontend still contains pywebview API calls** (`window.pywebview.api.*`) in `setting-page.js` and `customer-control-panel.js` — the app may be embedded in a pywebview shell, but the main data API is the Hono REST backend on port 3000.
- **`backend/src/database/database.js` has a broken DB connection** — the connection URL is passed as `database:` to `pg.Pool` instead of `connectionString:`. The DB layer is non-functional in the current commit.
- **`backend/tests/` is empty** — there are no backend tests at all.
- **Frontend `VITE_API_URL`** defaults to `http://localhost:3000` via `frontend/src/utils/meta.js`. In dev, Vite also proxies `/api` → `localhost:3000` automatically.
- **Event bus history tracks subscription events, not dispatch events** — `getHistory()` returns event names that were subscribed to, which is counterintuitive for debugging dispatches.
- **`publishAsync` defers via `setTimeout(0)`**, not a true promise — callbacks run after the current call stack clears, not as microtasks.
- **`contextManager` has all views registered at module load** (in `context-manager.js` constructor) — adding a new view requires both creating the view file and registering it there.
