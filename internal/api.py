import bcrypt
import logging

from internal.database import DatabaseConnection, open_connection
from internal.config import DBConfig

logger = logging.getLogger(__name__)

class API:
    def __init__(self, database: DatabaseConnection, dbconfig: DBConfig):
        self.__database = database
        self.__dbconfig = dbconfig
        self.db = open_connection(self.__database, self.__dbconfig)

    def auth_user(self, username: str, password: str) -> bool:
        """Authenticate user by username and password."""
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
