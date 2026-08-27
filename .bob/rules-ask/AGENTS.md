# AGENTS.md (Ask Mode)

This file provides guidance when answering questions about this repository.

## Non-obvious context

- **`frontend/framework/`** is a custom hand-rolled framework (EventBus, EventList, History, IComponentModel) — not an installed library. Documentation for it lives only in JSDoc comments inside those files.
- **`solvi/`** in the project root is the Python virtual environment, not application code.
- **`config.toml`** is only read lazily by `SettingAPI.ajust_settings()` when the settings window calls it — it is NOT read at app startup. Runtime config comes from `.env` / environment variables.
- **Two separate JS APIs exist**: `API` (`internal/api.py`) is the main window JS API; `SettingAPI` (`internal/setting_api.py`) is the settings window JS API. They are separate pywebview `js_api` instances.
- **The DB schema uses `"terant_id"` (with typo) as the actual column name** for `EmployeeAccount.tenant_id` — the Python attribute name is correct but the DB column is misspelled.
- **`patch_get_screens()`** monkey-patches `webview.platforms.winforms.get_screens` to fix DPI-correct multi-monitor detection on Windows — this is why it's called at module level in `app.py`.
- **Tests use SQLite in-memory**, not PostgreSQL — they exercise the ORM layer only and won't catch PostgreSQL-specific behavior.
- **`EmployeeAccount` has no email field** — authentication is username + bcrypt password only.
