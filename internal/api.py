import json
import bcrypt

from typing import List
from internal.database import DatabaseConnection, open_connection
from internal.models import Ticket
from internal.config import DBConfig
class API:
    """
    A class to handle all API requests to the database. This class has an instance
    of a database to communicate with it, as well as functions to communicate with
    the frontend.
    """

    def __init__(self, db_config: DatabaseConnection = None):
        if db_config is None:
            db_config = DatabaseConnection()
        self.__database = db_config
        self.db = open_connection(self.__database, DBConfig)

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

    def get_tickets(self) -> List[Ticket]:
        """
        Return a JSON string with all tickets from the database. If DB is not
        available or an error occurs, fall back to a small sample list.
        """
        # Try to read from DB
        try:
            if self.db and getattr(self.db, "connection", None):
                conn = self.db.connection
                cur = conn.cursor()
                try:
                    cur.execute("SELECT ticket_id, ticket_name FROM tickets ORDER BY ticket_id;")
                    rows = cur.fetchall()
                    tickets = [ {"ticket_id": r[0], "ticket_name": r[1]} for r in rows ]
                    return json.dumps(tickets)
                finally:
                    try:
                        cur.close()
                    except Exception:
                        pass
        except Exception:
            # ignore and fall back
            pass

        # fallback sample tickets (keeps backward compatibility)
        my_tickets = [
            Ticket(ticket_id=1, ticket_name="MyTicket"),
            Ticket(ticket_id=2, ticket_name="Ticket 2"),
            Ticket(ticket_id=3, ticket_name="Other Ticket")
        ]
        json_my_tickets = json.dumps([ticket.__dict__ for ticket in my_tickets])
        return json_my_tickets

    def add_ticket(self, ticket_name: str) -> bool:
        """
        Minimal implementation: append a ticket to the DB. No extra validation.
        Returns True on success, False otherwise.
        """
        if not isinstance(ticket_name, str):
            return False

        try:
            if not self.db or not getattr(self.db, "connection", None):
                return False

            conn = self.db.connection
            cur = conn.cursor()
            try:
                # keep SQL simple; assume there is a tickets table with ticket_name text
                cur.execute("INSERT INTO tickets (ticket_name) VALUES (%s) RETURNING ticket_id;", (ticket_name,))
                _ = cur.fetchone()
                conn.commit()
                return True
            finally:
                try:
                    cur.close()
                except Exception:
                    pass
        except Exception:
            return False

    def __set_connection(self) -> bool:
        pass
