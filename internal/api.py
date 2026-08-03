import json
import bcrypt

from internal.database import DatabaseConnection, open_connection
from internal.config import DBConfig

class API:
    def __init__(self, db=None):
        self.__database = DatabaseConnection()
        self.__dbconfig = DBConfig()
        self.db = open_connection(self.__database, self.__dbconfig)

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

            # bcrypt.checkpw expects bytes
            return bcrypt.checkpw(password.encode("utf-8"), db_password_hash.encode("utf-8"))
        except Exception:
            # Don't expose internals to the caller. In production replace with structured logging.
            return False

    def add_ticket(self, description, price):
        conn = self.db.connection
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO tickets (description, price) VALUES (%s, %s) RETURNING id, description, price;",
            (description, float(price) if price is not None else None),
        )
        row = cur.fetchone()
        conn.commit()
        cur.close()
        if row:
            return json.dumps({"id": int(row[0]), "description": row[1], "price": float(row[2]) if row[2] is not None else 0.0})
        return json.dumps({})

    def get_tickets(self):
        conn = self.db.connection
        cur = conn.cursor()
        cur.execute("SELECT id, description, price FROM tickets ORDER BY id;")
        rows = cur.fetchall()
        tickets = []
        for r in rows:
            tickets.append({"id": int(r[0]), "description": r[1], "price": float(r[2]) if r[2] is not None else 0.0})
        cur.close()
        return json.dumps(tickets)
