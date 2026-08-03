import json
import bcrypt

from typing import List, Optional, Any
from internal.database import DatabaseConnection, open_connection
from internal.models import Ticket
from internal.config import DBConfig

class API:
    """
    A class to handle all API requests to the database.
    """

    def __init__(self, db_config: DatabaseConnection = None):
        if db_config is None:
            db_config = DatabaseConnection()
        self.__database = db_config
        self.db = open_connection(self.__database, DBConfig())

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

    # --- Database helpers -------------------------------------------------
    def _ensure_tickets_table(self) -> bool:
        """Create the tickets table if it does not exist. Keep schema minimal.
        Fields: id SERIAL PRIMARY KEY, description TEXT, price REAL
        """
        try:
            if not self.db or not getattr(self.db, "connection", None):
                print("_ensure_tickets_table: no db connection")
                return False
            conn = self.db.connection
            cur = conn.cursor()
            try:
                cur.execute(
                    """
                    CREATE TABLE IF NOT EXISTS tickets (
                        id SERIAL PRIMARY KEY,
                        description TEXT,
                        price REAL
                    );
                    """
                )
                conn.commit()
                return True
            finally:
                try:
                    cur.close()
                except Exception:
                    pass
        except Exception as e:
            print("_ensure_tickets_table error:", e)
            return False

    # --- Ticket API -------------------------------------------------------
    def get_ticket(self) -> str:
        """
        Load all tickets from the database and return a JSON string.
        Ensures the tickets table exists before querying.
        """
        # Ensure table exists
        self._ensure_tickets_table()

        try:
            if not self.db or not getattr(self.db, "connection", None):
                print("get_ticket: no db connection")
                return json.dumps([])

            conn = self.db.connection
            cur = conn.cursor()
            try:
                cur.execute("SELECT id, description, price FROM tickets ORDER BY id;")
                rows = cur.fetchall()
                tickets = []
                for r in rows:
                    tickets.append({
                        "id": int(r[0]) if r[0] is not None else None,
                        "description": r[1] if r[1] is not None else "",
                        "price": float(r[2]) if r[2] is not None else 0.0,
                    })
                return json.dumps(tickets)
            finally:
                try:
                    cur.close()
                except Exception:
                    pass
        except Exception as e:
            print("get_ticket error:", e)
            return json.dumps([])

    # keep backwards compatibility
    def get_tickets(self) -> str:
        return self.get_ticket()

    def add_ticket(self, description: Any, price: Optional[Any] = None) -> str:
        """
        Persist a ticket in the DB. Accepts either:
          - add_ticket(description_str, price_val)
          - add_ticket(json_string_or_dict) where object has description and price
        Returns the created ticket as JSON string on success, or an empty JSON on failure.
        """
        # Normalize incoming args
        desc = None
        pr = None
        try:
            if price is None and isinstance(description, (str, bytes)):
                # maybe JSON string
                try:
                    obj = json.loads(description)
                    desc = obj.get("description")
                    pr = obj.get("price")
                except Exception:
                    # treat description as plain text
                    desc = description
                    pr = None
            elif isinstance(description, dict):
                desc = description.get("description")
                pr = description.get("price")
            else:
                desc = description
                pr = price

            if desc is None:
                print("add_ticket: missing description")
                return json.dumps({})

            # ensure table
            if not self._ensure_tickets_table():
                print("add_ticket: ensure table failed")
                return json.dumps({})

            if not self.db or not getattr(self.db, "connection", None):
                print("add_ticket: no db connection")
                return json.dumps({})

            conn = self.db.connection
            cur = conn.cursor()
            try:
                cur.execute(
                    "INSERT INTO tickets (description, price) VALUES (%s, %s) RETURNING id, description, price;",
                    (desc, float(pr) if pr is not None else None),
                )
                row = cur.fetchone()
                conn.commit()
                if row:
                    ticket = {"id": int(row[0]), "description": row[1] if row[1] is not None else "", "price": float(row[2]) if row[2] is not None else 0.0}
                    return json.dumps(ticket)
                print("add_ticket: insert returned no row")
                return json.dumps({})
            finally:
                try:
                    cur.close()
                except Exception:
                    pass
        except Exception as e:
            print("add_ticket error:", e)
            return json.dumps({})

    def __set_connection(self) -> bool:
        pass
