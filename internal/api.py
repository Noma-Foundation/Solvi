import webview
import bcrypt

import psycopg2

from internal.database import DatabaseConnection, open_connection
from internal.utils import AuthenticationErrorCode
from internal.config import DBConfig


class API:
    def __init__(self, database: DatabaseConnection, dbconfig: DBConfig):
        self.__database = database
        self.__dbconfig = dbconfig
        self.db = open_connection(self.__database, self.__dbconfig)

    def auth_user(self, username: str, password: str) -> bool | int:
        """Authenticate user by username and password."""
        if not self.db or not getattr(self.db, "connection", None):
            return AuthenticationErrorCode.FATAL_ERROR 

        conn = self.db.connection
        try:
            cursor = conn.cursor()
        except (psycopg2.InterfaceError, psycopg2.OperationalError) as e:
            return AuthenticationErrorCode.FATAL_ERROR

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
                return False

            return bcrypt.checkpw(password.encode("utf-8"), db_password_hash.encode("utf-8"))
        except (psycopg2.Error, ValueError, TypeError) as e:
            return AuthenticationErrorCode.FATAL_ERROR 
