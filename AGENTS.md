# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Overview

**Solvi** is a desktop management system (order/ticket/CRM) built as a Python + pywebview app with a Vite/jQuery/Bootstrap frontend. The Python process manages a PostgreSQL database (SQLAlchemy) and exposes the `API` class directly to JS via `window.pywebview.api`.

## Commands

### Python backend
```sh
# Run tests (from project root)
pytest

# Run a single test file
pytest tests/test_auth_api.py

# Run a single test by name
pytest tests/test_auth_api.py::test_auth_user_returns_true_on_successful_authentication

# Launch the app in dev mode (starts Vite automatically in a new console window)
python main.py --dev

# Launch the app in production mode (serves frontend/dist)
python main.py
```

### Frontend (must run from `frontend/` directory)
```sh
cd frontend
npm run dev      # Vite dev server at http://localhost:5173
npm run build    # Outputs to frontend/dist/
npm test         # Jest (requires --experimental-vm-modules, already in the npm script)
```

To run a single frontend test file:
```sh
cd frontend
node --experimental-vm-modules ./node_modules/jest/bin/jest.js src/tests/event-bus.test.js
```

## Critical Architecture Notes

- **pywebview bridge**: Python `API` methods are called from JS as `await window.pywebview.api.<method>()`. All public methods on `API` and `SettingAPI` are automatically exposed. Arguments are JSON-serialized, return values must be JSON-serializable (dicts/lists/primitives).
- **`--dev` flag**: When passed to `main.py`, it spawns `npm run dev` in a new Windows console window (3-second sleep for Vite startup) and points the webview at `http://localhost:5173`. Without the flag, it loads `frontend/dist/index.html` as a local file.
- **Two windows**: The main window (main UI) and a settings window (`create_window_setting`) are separate pywebview windows with separate `js_api` instances — `API` vs `SettingAPI`.
- **`solvi/`**: This is the Python virtual environment directory in the project root; do not confuse it with application source code.
- **`frontend/framework/`**: A custom hand-rolled framework (not npm-installed). Contains `EventBus`, `EventList`, `History`, and `IComponentModel`. It is imported with relative `../../framework/` paths.

## Python Patterns

- **All DB operations live in `internal/api.py`**: Use `db.session` (SQLAlchemy `Session`). Always call `session.rollback()` in the `except` block before re-raising.
- **`__require_tenant()`** must be called at the top of every `API` method that touches tenant data — it guards against unauthenticated access.
- **Error types** (`internal/utils/errors.py`): `QueryError`, `DatabaseConnectionError`, `FileError` — use these instead of generic exceptions for known failure modes.
- **Models** use raw SQLAlchemy `Column`-style declarations (not `mapped_column`). Primary keys are `String` UUIDs assigned by application code with `str(uuid.uuid4())`.
- **`EmployeeAccount.tenant_id`** has a DB column alias `"terant_id"` (typo in schema) — do not rename the Python attribute.
- **Config** is loaded from `.env` via `python-dotenv`. `config.toml` is only read by `SettingAPI.ajust_settings()` at runtime, not at startup.
- **Tests** use SQLite in-memory (`sqlite:///:memory:`) for DB tests. `sys.path.append(".")` is required at the top of test files that import from `internal/`.
- **Test mocking pattern**: `API.__new__(API)` is used to construct the API without triggering `open_connection` in `__init__`.

## Frontend Patterns

- **Component lifecycle**: Every UI component extends `IComponentModel` and calls `this.init()` in its constructor. `init()` calls `buildTemplate()` then `bindEvents()` — never call these methods manually.
- **HTML templates**: Use the `/* html */` tagged template comment (`/* html */ \`...\``) before template literals for IDE syntax highlighting.
- **Routing/views**: Views are registered in `contextManager` (singleton in `utils/context-manager.js`). Use `contextManager.show("viewName")` to navigate. Views that need post-render init should use `queueMicrotask(() => new Component())`.
- **Event bus**: Use the frozen singleton `eventBus` from `event-manager-singleton.js` for all cross-component communication. Event object `execute()` methods must take **zero arguments** — `subscribe()` will throw otherwise.
- **`window.pywebview.api`** calls must be `await`-ed and wrapped in try/catch (the API bridge can fail if pywebview isn't ready).
- **Loading helpers**: Use `setButtonLoading($btn, true/false)` and `setContainerLoading($container, true/false)` from `utils/loading-state.js` — do not roll custom spinners.
- **Build output**: Vite builds both `index.html` and `setting.html` as separate entry points (configured in `vite.config.js` `rolldownOptions.input`).
