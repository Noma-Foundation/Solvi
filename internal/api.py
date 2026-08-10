import webview
import bcrypt

import psycopg2

from internal.database import DatabaseConnection, open_connection
from internal.utils import AuthenticationCodeError
from internal.config import DBConfig


class API:
    _window: webview.Window | None = None

    def __init__(self, database: DatabaseConnection, dbconfig: DBConfig):
        self.__database = database
        self.__dbconfig = dbconfig
        self.db = open_connection(self.__database, self.__dbconfig)

        if isinstance(self.db, AuthenticationCodeError):
            print(f"[API] Database initialization failed: {self.db}")

    def auth_user(self, username: str, password: str) -> bool | int:
        """Authenticate user by username and password."""

        if not self.db or not getattr(self.db, "connection", None):
            self.__open_error_message()
            return AuthenticationCodeError.FATAL_ERROR

<<<<<<< HEAD
        conn = self.db.connection
        try:
            cursor = conn.cursor()
        except (psycopg2.InterfaceError, psycopg2.OperationalError) as e:
            self.__open_error_message()
            return AuthenticationCodeError.FATAL_ERROR
=======
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

    def add_customer(self, name, phone="", email="", description="", cep="", address="", cpf=""):
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
            "cpf": (cpf or "").strip(),
        }
        store = self._load_store()
        store["customers"].append(customer)
        self._save_store(store)
        return json.dumps(customer)

    def update_customer(self, customer_id, name, phone="", email="", description="", cep="", address="", cpf=""):
        customer_id = str(customer_id or "")
        if not customer_id:
            return json.dumps({"ok": False, "error": "id is required"})
        name = (name or "").strip()
        if not name:
            return json.dumps({"error": "name is required"})

        store = self._load_store()
        for customer in store["customers"]:
            if str(customer.get("id")) == customer_id:
                customer["name"] = name
                customer["phone"] = (phone or "").strip()
                customer["email"] = (email or "").strip()
                customer["description"] = (description or "").strip()
                customer["cep"] = (cep or "").strip()
                customer["address"] = (address or "").strip()
                customer["cpf"] = (cpf or "").strip()
                self._save_store(store)
                return json.dumps(customer)
        return json.dumps({"ok": False, "error": "customer not found"})

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
>>>>>>> 73fee27 (Add xref-main.html and unit tests for Customer model)

        try:
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
                self.__open_error_message()
                return False

            return bcrypt.checkpw(password.encode("utf-8"), db_password_hash.encode("utf-8"))
        except (psycopg2.Error, ValueError, TypeError) as e:
            self.__open_error_message()
            return AuthenticationCodeError.FATAL_ERROR 

    def __open_error_message(self, error: str = "Database connection Error"):
        if API._window is None:
            return
        API._window.create_confirmation_dialog(
            title="DatabaseError",
            message=error
        )
