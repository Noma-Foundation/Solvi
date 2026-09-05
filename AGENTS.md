# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Overview

**Solvi** is a desktop management system (order/ticket/CRM) with:
- **Frontend**: Vite + jQuery + Bootstrap, custom hand-rolled component framework at `frontend/framework/`
- **Backend**: Node.js + Hono + Kysely + PostgreSQL at `backend/` (REST API on port 3000)
- **pywebview integration**: The frontend still calls `window.pywebview.api.*` for some features (e.g. settings), meaning the app may also be embedded in a pywebview shell alongside the Hono backend

## Commands

### Frontend (must run from `frontend/` directory)
```sh
cd frontend
npm run dev      # Vite dev server at http://localhost:5173 (proxies /api → localhost:3000)
npm run build    # Outputs to frontend/dist/
npm test         # Jest (requires --experimental-vm-modules, already in the npm script)
```

To run a single frontend test file:
```sh
cd frontend
node --experimental-vm-modules ./node_modules/jest/bin/jest.js src/tests/event-bus.test.js
```

### Backend (must run from `backend/` directory)
```sh
cd backend
npm run dev    # Hono server with --watch on port 3000
npm start      # Production start
```

## Critical Architecture Notes

- **Vite proxy**: `/api` requests from the frontend dev server are proxied to `http://localhost:3000` — no CORS issues in dev. Configured in `vite.config.js` `server.proxy`.
- **`frontend/framework/`**: Custom hand-rolled framework (not npm-installed). Contains `EventBus`, `EventList`, `History`, `IComponentModel`. Import with relative paths like `../../framework/event-bus.js`.
- **Vite builds two entry points**: `index.html` and `setting.html` — new HTML pages require a corresponding entry in `vite.config.js` `rolldownOptions.input`.
- **`solvi/`** in the project root is the Python virtual environment — not application code.
- **Backend DB config bug**: `backend/src/database/database.js` passes the full connection URL string as `database:` to `pg.Pool`, which is incorrect (should be `connectionString:`). This is a known issue in the current codebase.
- **`VITE_API_URL`**: Frontend reads `import.meta.env.VITE_API_URL` (defaulting to `http://localhost:3000`) from `frontend/src/utils/meta.js` — set this in a `.env` file for non-default deployments.

## Frontend Patterns

- **Component lifecycle**: Every UI component extends `IComponentModel` and calls `this.init()` at the end of its constructor. `init()` calls `buildTemplate()` then `bindEvents()` — never call these methods manually.
- **HTML templates**: Use the `/* html */` comment before template literals containing HTML (`/* html */ \`...\``).
- **Routing/views**: `contextManager` is a singleton exported from `utils/context-manager.js` (never `new` it). Use `contextManager.show("viewName")` to navigate. Views that need post-render component init must use `queueMicrotask(() => new Component())` — see `customer-page.js`.
- **Event bus**: Use the frozen singleton `eventBus` from `src/event-manager-singleton.js` (never `new` it). Event object `execute()` methods must take **zero parameters** — `subscribe()` throws synchronously if they don't.
- **`publishAsync` vs `dispatch`**: `publishAsync` defers callbacks via `setTimeout(0)`; `dispatch` is synchronous and returns an array of return values.
- **Loading helpers**: Use `setButtonLoading($btn, true/false)` and `setContainerLoading($container, true/false)` from `utils/loading-state.js`.
- **pywebview guard pattern**: Check `window.pywebview && window.pywebview.api` before calling; fall back to `window.addEventListener("pywebviewready", ...)`. See `customer-control-panel.js`.
- **`buildClientRecord()`** in `utils/customer-record.js` is the canonical mapper from backend snake_case API responses to camelCase UI records — use it in every component that handles customer data.

## Backend Patterns (Node.js / Hono / Kysely)

- **Framework**: Hono on `@hono/node-server` — all routes defined in `backend/src/index.js`.
- **DB**: Kysely query builder with `pg` driver. DB instance exported from `backend/src/database/database.js`.
- **Error handling**: A global `try/catch` middleware in `index.js` catches unhandled errors and returns `{ ok: false, message: "Internal Server Error" }` with status 500. Route handlers should throw on error.
- **No test runner configured** in `backend/` — `backend/tests/` is empty.
