# AGENTS.md (Agent / Coding Mode)

This file provides guidance to agents when writing or modifying code in this repository.

## Non-obvious coding rules

- **Never instantiate `API` normally in tests** — use `API.__new__(API)` to skip `open_connection` in `__init__`, then set `instance.db`, `instance.current_employee_id`, `instance.current_tenant_id` manually.
- **All test files must start with `sys.path.append(".")` before any `internal` imports** — there is no `pytest.ini`/`pyproject.toml` configuring `pythonpath`.
- **DB session rollback before re-raise** — every `except SQLAlchemyError` block must call `self.db.session.rollback()` before raising `QueryError`.
- **`__require_tenant()` first** — every `API` method that reads/writes tenant data must call `self.__require_tenant(...)` as its first line.
- **`EmployeeAccount.tenant_id` column is aliased `"terant_id"` in DB** — this is an intentional frozen typo; never change the alias string.
- **IDs are application-generated UUIDs as strings** — always generate with `str(uuid.uuid4())` before inserting; the DB does not auto-generate them.
- **Component `init()` flow is fixed**: `buildTemplate()` → `bindEvents()`. Call `this.init()` at the end of the constructor; never call `buildTemplate` or `bindEvents` directly.
- **Event objects passed to `eventBus.subscribe()` must have `execute()` with zero parameters** — the bus validates this and throws synchronously.
- **Use `/* html */` comment before all template literals containing HTML** — this is the project convention for IDE highlighting, not just style.
- **`contextManager` and `eventBus` are singletons** — never `new` them; import from `utils/context-manager.js` and `event-manager-singleton.js` respectively.
- **Framework is local at `frontend/framework/`** — import with relative paths like `../../framework/event-bus.js`. It is NOT an npm package.
- **Frontend tests run from `frontend/` directory** — `npm test` is already configured with `--experimental-vm-modules`; raw `jest` will fail.
- **Views that instantiate components post-render must use `queueMicrotask`** — see `customer-page.js` pattern; direct `new Component()` in a view function may run before DOM is ready.
