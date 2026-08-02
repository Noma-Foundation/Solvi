import json
import bcrypt

from typing import List
from internal.database import DatabaseConnection, open_connection
from internal.models import Ticket

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
        self.db = open_connection(self.__database)

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
        It should return a list containing all the tickets listed in the database. This function synchronizes the data from the OrderRequester.
        """
        my_tickets = [
            Ticket(ticket_id=1, ticket_name="MyTicket"),
            Ticket(ticket_id=2, ticket_name="Ticket 2"),
            Ticket(ticket_id=3, ticket_name="Other Ticket")
        ]
        json_my_tickets = json.dumps([ticket.__dict__ for ticket in my_tickets])
        return json_my_tickets

    def __set_connection(self) -> bool:
        pass
