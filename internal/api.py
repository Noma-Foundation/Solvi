import json
import uuid
from pathlib import Path

import bcrypt

from internal.database import DatabaseConnection, open_connection
from internal.config import DBConfig


class API:
    def __init__(self, database: DatabaseConnection, dbconfig: DBConfig):
        self.__database = database
        self.__dbconfig = dbconfig
        self.db = open_connection(self.__database, self.__dbconfig)

    def get_customers(self):
        return json.dumps(self._load_customers())

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
        customers = self._load_customers()
        customers.append(customer)
        self._save_customers(customers)
        return json.dumps(customer)

    def remove_customer(self, customer_id):
        customer_id = str(customer_id or "")
        customers = self._load_customers()
        filtered = [c for c in customers if str(c.get("id")) != customer_id]
        if len(filtered) == len(customers):
            return json.dumps({"ok": False})
        self._save_customers(filtered)
        return json.dumps({"ok": True})

    def auth_user(self, username: str, password: str) -> bool:
        """Authenticate user by username and password.

        Returns True when authentication succeeds, False otherwise. This method is
        defensive: it checks for a valid DB connection, closes cursors, and avoids
        leaking exceptions to callers. Logging should be added in a real app.
        """
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

    def _customers_path(self) -> Path:
        path = Path("data") / "customers.json"
        path.parent.mkdir(parents=True, exist_ok=True)
        return path

    def _load_customers(self) -> list:
        path = self._customers_path()
        if not path.exists():
            self._save_customers([])
            return []
        try:
            with path.open("r", encoding="utf-8") as f:
                data = json.load(f)
            if not isinstance(data, list):
                return []
            return data
        except (json.JSONDecodeError, OSError):
            return []

    def _save_customers(self, customers: list) -> None:
        path = self._customers_path()
        with path.open("w", encoding="utf-8") as f:
            json.dump(customers, f, ensure_ascii=False, indent=2)