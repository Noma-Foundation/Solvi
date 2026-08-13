import json
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path

import bcrypt
import webview

from internal.database import DatabaseConnection, open_connection
from internal.config import DBConfig
from internal.utils.paths import data_dir

ICMS_RATES = {
    "AC": 17.0, "AL": 17.0, "AP": 18.0, "AM": 18.0, "BA": 18.5,
    "CE": 18.0, "DF": 18.0, "ES": 17.0, "GO": 17.0, "MA": 18.0,
    "MT": 17.0, "MS": 17.0, "MG": 18.0, "PA": 17.0, "PB": 18.0,
    "PR": 18.0, "PE": 18.0, "PI": 18.0, "RJ": 20.0, "RN": 18.0,
    "RS": 17.0, "RO": 17.5, "RR": 17.0, "SC": 17.0, "SP": 18.0,
    "SE": 18.0, "TO": 18.0,
}

BUDGET_STATUSES = {"Rascunho", "Enviado", "Aprovado", "Recusado"}
NOTIFICATION_LEVELS = {"Informação", "Aviso", "Erro", "Sucesso"}


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _ok(data=None):
    payload = {"ok": True}
    if data is not None:
        payload.update(data)
    return json.dumps(payload)


def _err(message: str):
    return json.dumps({"ok": False, "error": message})


class API:
    def __init__(self, database: DatabaseConnection, dbconfig: DBConfig):
        self.__database = database
        self.__dbconfig = dbconfig
        # self.db = open_connection(self.__database, self.__dbconfig)

    # ── Auth ──────────────────────────────────────────────────────────────

    def auth_user(self, username: str, password: str) -> bool:
        try:
            if not self.db or not getattr(self.db, "connection", None):
                return False

            conn = self.db.connection
            cursor = conn.cursor()
            try:
                cursor.execute(
                    "SELECT username, password FROM employees WHERE username = %s",
                    (username,)
                )
                row = cursor.fetchone()
            finally:
                try:
                    cursor.close()
                except Exception:
                    pass

            if not row:
                return False

            db_username, db_password_hash = row
            if not db_password_hash:
                return False

            return bcrypt.checkpw(password.encode("utf-8"), db_password_hash.encode("utf-8"))
        except Exception:
            return False

    # ── Store ─────────────────────────────────────────────────────────────

    def _store_path(self) -> Path:
        path = data_dir() / "app-data.json"
        return path

    def _legacy_customers_path(self) -> Path:
        return data_dir() / "customers.json"

    def _default_store(self) -> dict:
        return {
            "customers": [],
            "calendar": [],
            "folders": [],
            "budgets": [],
            "notifications": [],
        }

    def _load_store(self) -> dict:
        path = self._store_path()
        legacy = self._legacy_customers_path()

        if path.exists():
            try:
                with path.open("r", encoding="utf-8") as f:
                    data = json.load(f)
                if isinstance(data, dict):
                    store = self._default_store()
                    for key in store:
                        if key in data and isinstance(data[key], list):
                            store[key] = data[key]
                    return store
            except (json.JSONDecodeError, OSError):
                pass

        store = self._default_store()
        if legacy.exists():
            try:
                with legacy.open("r", encoding="utf-8") as f:
                    customers = json.load(f)
                if isinstance(customers, list):
                    store["customers"] = customers
            except (json.JSONDecodeError, OSError):
                pass
            self._save_store(store)
            try:
                legacy.unlink(missing_ok=True)
            except OSError:
                pass
            return store

        self._save_store(store)
        return store

    def _save_store(self, store: dict) -> None:
        path = self._store_path()
        with path.open("w", encoding="utf-8") as f:
            json.dump(store, f, ensure_ascii=False, indent=2)

    # ── Customers ─────────────────────────────────────────────────────────

    def get_customers(self):
        return json.dumps(self._load_store()["customers"])

    def add_customer(self, name, phone="", email="", description="", cep="", address=""):
        name = (name or "").strip()
        if not name:
            return json.dumps({"error": "name is required"})

        customer = {
            "id": str(uuid.uuid4()),
            "name": name,
            "phone": (phone or "").strip(),
            "email": (email or "").strip(),
            "description": (description or "").strip(),
            "cep": (cep or "").strip(),
            "address": (address or "").strip(),
        }
        store = self._load_store()
        store["customers"].append(customer)
        self._save_store(store)
        return json.dumps(customer)

    def remove_customer(self, customer_id):
        customer_id = str(customer_id or "")
        store = self._load_store()
        customers = store["customers"]
        filtered = [c for c in customers if str(c.get("id")) != customer_id]
        if len(filtered) == len(customers):
            return json.dumps({"ok": False})
        store["customers"] = filtered
        self._save_store(store)
        return json.dumps({"ok": True})

    # ── Calendar ──────────────────────────────────────────────────────────

    def get_calendar_tasks(self):
        return json.dumps(self._load_store()["calendar"])

    def add_calendar_task(self, title, description="", date="", time=""):
        title = (title or "").strip()
        date = (date or "").strip()
        if not title:
            return _err("title is required")
        if not date:
            return _err("date is required")

        task = {
            "id": str(uuid.uuid4()),
            "title": title,
            "description": (description or "").strip(),
            "date": date,
            "time": (time or "").strip(),
            "createdAt": _now_iso(),
        }
        store = self._load_store()
        store["calendar"].append(task)
        self._save_store(store)
        return json.dumps(task)

    def update_calendar_task(self, task_id, title, description="", date="", time=""):
        task_id = str(task_id or "")
        title = (title or "").strip()
        date = (date or "").strip()
        if not task_id:
            return _err("id is required")
        if not title:
            return _err("title is required")
        if not date:
            return _err("date is required")

        store = self._load_store()
        for task in store["calendar"]:
            if str(task.get("id")) == task_id:
                task["title"] = title
                task["description"] = (description or "").strip()
                task["date"] = date
                task["time"] = (time or "").strip()
                self._save_store(store)
                return json.dumps(task)
        return _err("task not found")

    def remove_calendar_task(self, task_id):
        task_id = str(task_id or "")
        store = self._load_store()
        before = len(store["calendar"])
        store["calendar"] = [t for t in store["calendar"] if str(t.get("id")) != task_id]
        if len(store["calendar"]) == before:
            return _err("task not found")
        self._save_store(store)
        return _ok()

    # ── Folders ───────────────────────────────────────────────────────────

    def get_folder_tree(self):
        return json.dumps(self._load_store()["folders"])

    def create_folder(self, name, parent_id=""):
        name = (name or "").strip()
        if not name:
            return _err("name is required")

        parent_id = str(parent_id or "").strip()
        store = self._load_store()
        if parent_id:
            parent = next((i for i in store["folders"] if str(i.get("id")) == parent_id), None)
            if not parent or parent.get("type") != "folder":
                return _err("parent folder not found")

        item = {
            "id": str(uuid.uuid4()),
            "name": name,
            "type": "folder",
            "parentId": parent_id or None,
            "path": None,
            "size": 0,
            "modifiedAt": _now_iso(),
        }
        store["folders"].append(item)
        self._save_store(store)
        return json.dumps(item)

    def rename_folder_item(self, item_id, name):
        item_id = str(item_id or "")
        name = (name or "").strip()
        if not item_id:
            return _err("id is required")
        if not name:
            return _err("name is required")

        store = self._load_store()
        for item in store["folders"]:
            if str(item.get("id")) == item_id:
                item["name"] = name
                item["modifiedAt"] = _now_iso()
                self._save_store(store)
                return json.dumps(item)
        return _err("item not found")

    def delete_folder_item(self, item_id):
        item_id = str(item_id or "")
        store = self._load_store()
        ids_to_remove = {item_id}

        changed = True
        while changed:
            changed = False
            for item in store["folders"]:
                parent = item.get("parentId")
                if parent and str(parent) in ids_to_remove and str(item.get("id")) not in ids_to_remove:
                    ids_to_remove.add(str(item.get("id")))
                    changed = True

        before = len(store["folders"])
        store["folders"] = [i for i in store["folders"] if str(i.get("id")) not in ids_to_remove]
        if len(store["folders"]) == before:
            return _err("item not found")
        self._save_store(store)
        return _ok()

    def import_files(self, parent_id=""):
        parent_id = str(parent_id or "").strip()
        store = self._load_store()
        if parent_id:
            parent = next((i for i in store["folders"] if str(i.get("id")) == parent_id), None)
            if not parent or parent.get("type") != "folder":
                return _err("parent folder not found")

        try:
            window = webview.active_window()
            if window is None and webview.windows:
                window = webview.windows[0]
            if window is None:
                return _err("window unavailable")

            paths = window.create_file_dialog(
                webview.OPEN_DIALOG,
                allow_multiple=True,
            )
        except Exception as exc:
            return _err(str(exc))

        if not paths:
            return json.dumps([])

        imported = []
        for file_path in paths:
            p = Path(file_path)
            if not p.exists() or not p.is_file():
                continue
            try:
                size = p.stat().st_size
                mtime = datetime.fromtimestamp(p.stat().st_mtime, tz=timezone.utc).isoformat()
            except OSError:
                size = 0
                mtime = _now_iso()

            item = {
                "id": str(uuid.uuid4()),
                "name": p.name,
                "type": "file",
                "parentId": parent_id or None,
                "path": str(p.resolve()),
                "size": size,
                "modifiedAt": mtime,
            }
            store["folders"].append(item)
            imported.append(item)

        self._save_store(store)
        return json.dumps(imported)

    def open_path(self, item_id):
        item_id = str(item_id or "")
        store = self._load_store()
        item = next((i for i in store["folders"] if str(i.get("id")) == item_id), None)
        if not item:
            return _err("item not found")
        if item.get("type") != "file":
            return _err("only files can be opened")
        path = item.get("path") or ""
        if not path or not Path(path).exists():
            return _err("file path not found on disk")
        try:
            os.startfile(path)  # type: ignore[attr-defined]
            return _ok()
        except Exception as exc:
            return _err(str(exc))

    def get_item_properties(self, item_id):
        item_id = str(item_id or "")
        store = self._load_store()
        item = next((i for i in store["folders"] if str(i.get("id")) == item_id), None)
        if not item:
            return _err("item not found")
        return json.dumps(item)

    # ── Budgets ───────────────────────────────────────────────────────────

    def get_icms_rates(self):
        return json.dumps(ICMS_RATES)

    def get_budgets(self):
        return json.dumps(self._load_store()["budgets"])

    def _calc_budget_totals(self, items, state):
        subtotal = 0.0
        normalized = []
        for raw in items or []:
            try:
                qty = float(raw.get("quantity", 0) or 0)
                unit = float(raw.get("unitPrice", 0) or 0)
            except (TypeError, ValueError):
                qty, unit = 0.0, 0.0
            line = round(qty * unit, 2)
            subtotal += line
            normalized.append({
                "description": str(raw.get("description", "") or "").strip(),
                "quantity": qty,
                "unitPrice": unit,
                "subtotal": line,
            })
        subtotal = round(subtotal, 2)
        rate = float(ICMS_RATES.get((state or "").upper(), 0))
        icms = round(subtotal * (rate / 100.0), 2)
        total = round(subtotal + icms, 2)
        return normalized, subtotal, icms, total, rate

    def add_budget(
        self,
        number="",
        client="",
        state="",
        items=None,
        observations="",
        status="Rascunho",
    ):
        client = (client or "").strip()
        state = (state or "").strip().upper()
        status = (status or "Rascunho").strip()
        if not client:
            return _err("client is required")
        if state not in ICMS_RATES:
            return _err("invalid state")
        if status not in BUDGET_STATUSES:
            return _err("invalid status")

        if isinstance(items, str):
            try:
                items = json.loads(items)
            except json.JSONDecodeError:
                return _err("invalid items")

        normalized, subtotal, icms, total, rate = self._calc_budget_totals(items, state)
        now = _now_iso()
        budget = {
            "id": str(uuid.uuid4()),
            "number": (number or "").strip() or f"ORC-{str(uuid.uuid4())[:8].upper()}",
            "client": client,
            "state": state,
            "items": normalized,
            "subtotal": subtotal,
            "icmsRate": rate,
            "icms": icms,
            "total": total,
            "observations": (observations or "").strip(),
            "status": status,
            "createdAt": now,
            "updatedAt": now,
        }
        store = self._load_store()
        store["budgets"].append(budget)
        self._save_store(store)
        return json.dumps(budget)

    def update_budget(
        self,
        budget_id,
        number="",
        client="",
        state="",
        items=None,
        observations="",
        status="Rascunho",
    ):
        budget_id = str(budget_id or "")
        client = (client or "").strip()
        state = (state or "").strip().upper()
        status = (status or "Rascunho").strip()
        if not budget_id:
            return _err("id is required")
        if not client:
            return _err("client is required")
        if state not in ICMS_RATES:
            return _err("invalid state")
        if status not in BUDGET_STATUSES:
            return _err("invalid status")

        if isinstance(items, str):
            try:
                items = json.loads(items)
            except json.JSONDecodeError:
                return _err("invalid items")

        store = self._load_store()
        for budget in store["budgets"]:
            if str(budget.get("id")) == budget_id:
                normalized, subtotal, icms, total, rate = self._calc_budget_totals(items, state)
                budget["number"] = (number or "").strip() or budget.get("number", "")
                budget["client"] = client
                budget["state"] = state
                budget["items"] = normalized
                budget["subtotal"] = subtotal
                budget["icmsRate"] = rate
                budget["icms"] = icms
                budget["total"] = total
                budget["observations"] = (observations or "").strip()
                budget["status"] = status
                budget["updatedAt"] = _now_iso()
                self._save_store(store)
                return json.dumps(budget)
        return _err("budget not found")

    def remove_budget(self, budget_id):
        budget_id = str(budget_id or "")
        store = self._load_store()
        before = len(store["budgets"])
        store["budgets"] = [b for b in store["budgets"] if str(b.get("id")) != budget_id]
        if len(store["budgets"]) == before:
            return _err("budget not found")
        self._save_store(store)
        return _ok()

    def duplicate_budget(self, budget_id):
        budget_id = str(budget_id or "")
        store = self._load_store()
        source = next((b for b in store["budgets"] if str(b.get("id")) == budget_id), None)
        if not source:
            return _err("budget not found")

        now = _now_iso()
        copy = dict(source)
        copy["id"] = str(uuid.uuid4())
        copy["number"] = f"{source.get('number', 'ORC')}-COPY"
        copy["status"] = "Rascunho"
        copy["createdAt"] = now
        copy["updatedAt"] = now
        copy["items"] = [dict(i) for i in (source.get("items") or [])]
        store["budgets"].append(copy)
        self._save_store(store)
        return json.dumps(copy)

    # ── Notifications ─────────────────────────────────────────────────────

    def get_notifications(self):
        return json.dumps(self._load_store()["notifications"])

    def add_notification(
        self,
        title,
        description="",
        category="sistema",
        level="Informação",
    ):
        title = (title or "").strip()
        level = (level or "Informação").strip()
        if not title:
            return _err("title is required")
        if level not in NOTIFICATION_LEVELS:
            return _err("invalid level")

        now = datetime.now().astimezone()
        notification = {
            "id": str(uuid.uuid4()),
            "title": title,
            "description": (description or "").strip(),
            "category": (category or "sistema").strip(),
            "level": level,
            "date": now.strftime("%Y-%m-%d"),
            "time": now.strftime("%H:%M:%S"),
            "read": False,
            "createdAt": now.isoformat(),
        }
        store = self._load_store()
        store["notifications"].insert(0, notification)
        self._save_store(store)
        return json.dumps(notification)

    def mark_notification_read(self, notification_id):
        notification_id = str(notification_id or "")
        store = self._load_store()
        for item in store["notifications"]:
            if str(item.get("id")) == notification_id:
                item["read"] = True
                self._save_store(store)
                return json.dumps(item)
        return _err("notification not found")

    def mark_all_notifications_read(self):
        store = self._load_store()
        for item in store["notifications"]:
            item["read"] = True
        self._save_store(store)
        return _ok({"count": len(store["notifications"])})

    def remove_notification(self, notification_id):
        notification_id = str(notification_id or "")
        store = self._load_store()
        before = len(store["notifications"])
        store["notifications"] = [
            n for n in store["notifications"] if str(n.get("id")) != notification_id
        ]
        if len(store["notifications"]) == before:
            return _err("notification not found")
        self._save_store(store)
        return _ok()

    def clear_notifications(self):
        store = self._load_store()
        store["notifications"] = []
        self._save_store(store)
        return _ok()
