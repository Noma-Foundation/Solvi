# AGENTS.md (Agent / Coding Mode)

This file provides guidance to agents when writing or modifying code in this repository.

## Non-obvious coding rules

- **Component `init()` flow is fixed**: `buildTemplate()` → `bindEvents()`. Call `this.init()` at the end of the constructor; never call `buildTemplate` or `bindEvents` directly.
- **Event objects passed to `eventBus.subscribe()` must have `execute()` with zero parameters** — the bus validates this and throws synchronously.
- **Use `/* html */` comment before all template literals containing HTML** — project convention for IDE highlighting.
- **`contextManager` and `eventBus` are singletons** — never `new` them; import from `utils/context-manager.js` and `event-manager-singleton.js` respectively.
- **Framework is local at `frontend/framework/`** — import with relative paths like `../../framework/event-bus.js`. It is NOT an npm package.
- **Frontend tests run from `frontend/` directory** — `npm test` is already configured with `--experimental-vm-modules`; raw `jest` will fail.
- **Views that instantiate components post-render must use `queueMicrotask`** — direct `new Component()` in a view function may run before DOM is ready.
- **`buildClientRecord()` from `utils/customer-record.js`** must be used to map all backend customer API responses to UI records — do not inline the mapping.
- **pywebview guard before every API call**: Always check `window.pywebview && window.pywebview.api` or listen for `"pywebviewready"` before calling `window.pywebview.api.*`.
- **Backend DB config is broken**: `backend/src/database/database.js` passes the connection URL as `database:` to `pg.Pool` — it should be `connectionString:`. Fix this before adding DB queries.
- **Backend has no tests** — `backend/tests/` is empty and no test runner is configured for the backend.
- **New Vite HTML entry points** require a corresponding entry in `vite.config.js` `rolldownOptions.input`.
