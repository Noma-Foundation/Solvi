# AGENTS.md (Plan Mode)

This file provides guidance when planning or designing changes in this repository.

## Non-obvious architectural constraints

- **Backend is Node.js/Hono/Kysely**, NOT Python — the `internal/` Python backend no longer exists. All new backend routes go in `backend/src/index.js` (or new route modules imported there).
- **Frontend still has pywebview API calls** — `setting-page.js` calls `window.pywebview.api.ajust_settings()` and `customer-control-panel.js` guards on `pywebviewready`. This dual-mode architecture (pywebview shell + REST backend) must be preserved when modifying those files.
- **No authentication middleware** exists on the backend — the Hono server is fully open. Auth logic must be added before any routes that require it.
- **Backend DB layer is broken**: `pg.Pool({ database: url })` should be `pg.Pool({ connectionString: url })` — any plan involving DB queries must fix this first.
- **Kysely requires TypeScript-style table type definitions** for type-safe queries — the current `backend/src/database/database.js` uses an untyped `Kysely` instance. Adding new tables requires defining their shape.
- **No backend tests infrastructure** — `backend/tests/` is empty with no Jest/Vitest config. Any plan involving backend testing must set up the test runner first.
- **Frontend routing is manual** — `contextManager.register()` / `contextManager.show()` is the entire routing system (in `context-manager.js`). There is no URL-based routing. Adding a new page requires: creating a view file, importing it in `context-manager.js`, and calling `this.register()` in its constructor.
- **Vite builds two entry points** (`index.html`, `setting.html`) — any new HTML page needs a `rolldownOptions.input` entry in `vite.config.js`.
- **Event bus history tracks subscriptions, not dispatches** — `getHistory()` is counterintuitive for debugging; it shows what was subscribed to, not what was dispatched.
- **`contextManager` singleton creates `MenuBar` lazily on first `show()` call** — the menu bar is not present in the DOM until the first view is displayed.
