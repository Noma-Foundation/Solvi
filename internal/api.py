import tomllib
import logging
import uuid

import webview
import bcrypt
import psycopg2

from dataclasses import asdict

from internal.database import DatabaseConnection, open_connection
from internal.utils import DatabaseError
from internal.config import DBConfig
from internal.setting_api import SettingAPI
from internal.models import *


logger = logging.getLogger(__name__)
logging.basicConfig(filename="solvi.log", level=logging.INFO)

CLIENT_COLUMNS = (
    "client_id, tenant_id, employee_id, name, email, "
    "phone_number, document, date_of_birth, remark, create_at, update_at"
)


def _client_row_to_dict(row) -> dict:
    (
        client_id, tenant_id, employee_id, name, email,
        phone_number, document, date_of_birth, remark, create_at, update_at,
    ) = row

    customer = Customer(
        client_id=str(client_id),
        tenant_id=str(tenant_id),
        employee_id=str(employee_id) if employee_id else None,
        name=name,
        email=email,
        phone_number=phone_number,
        document=document,
        date_of_birth=date_of_birth.isoformat() if date_of_birth else None,
        remark=remark,
        create_at=create_at.isoformat() if create_at else None,
        update_at=update_at.isoformat() if update_at else None,
    )
    return asdict(customer)


class API:
    _window: webview.Window | None = None

    def __init__(self, database: DatabaseConnection, dbconfig: DBConfig, dev_mode: bool = False) -> None:
        self.db = open_connection(database, dbconfig)
        self.__dev_mode = dev_mode

        self.current_employee_id = None
        self.current_tenant_id = None

        if isinstance(self.db, DatabaseError):
            logger.error("An unexpected operation occurred. The database connection is null.")
            raise Exception("[Error] Error to connect database")


    def auth_user(self, username: str, password: str) -> bool | int:
        """Authenticate user by username and password."""

        if not self.db or not getattr(self.db, "connection", None):
            logger.error("An unexpected operation occurred. The database connection is null.")
            return DatabaseError.CONNECTION_ERROR

        conn = self.db.connection
        try:
            cursor = conn.cursor()
        except (psycopg2.InterfaceError, psycopg2.OperationalError) as e:
            logger.error("Error connecting with the cursor.")
            return DatabaseError.CURSOR_ERROR

        try:
            try:
                cursor.execute(
                    """
                    SELECT employee_id, terant_id, username, password
                    FROM employee
                    WHERE username = %s
                    """,
                    (username,)
                )
                row = cursor.fetchone()
            finally:
                try:
                    cursor.close()
                    logger.info("Cursor completed. Username and password captured.")
                except Exception:
                    logger.warning("Cursor completed. Username and password not captured.")

            if not row:
                return False

            employee_id, tenant_id, db_username, db_password_hash = row

            if db_username == "":
                return False

            if not db_password_hash:
                return False

            if not bcrypt.checkpw(password.encode("utf-8"), db_password_hash.encode("utf-8")):
                return False

            self.current_employee_id = str(employee_id)
            self.current_tenant_id = str(tenant_id)
            return True
        except (psycopg2.Error, ValueError, TypeError) as e:
            logger.error("Error while executing a query.")
            raise Exception("Error while executing a query.")

    def create_window_setting(self, title: str, width: int, height: int) -> None:
        url = "http://localhost:5173/setting.html" if self.__dev_mode else "frontend/dist/setting.html"
        api = SettingAPI()
        
        webview.create_window(
            title=title,
            url=url,
            resizable=False,
            width=width,
            height=height,
            js_api=api
        )

    def __require_cursor(self):
        """Open a cursor on the current DB connection, or return a DatabaseError."""
        if not self.db or not getattr(self.db, "connection", None):
            logger.error("An unexpected operation occurred. The database connection is null.")
            return DatabaseError.CONNECTION_ERROR

        try:
            return self.db.connection.cursor()
        except (psycopg2.InterfaceError, psycopg2.OperationalError):
            logger.error("Error connecting with the cursor.")
            return DatabaseError.CURSOR_ERROR

    def get_clients(self):
        """Return every client belonging to the authenticated tenant."""
        if not self.current_tenant_id:
            raise Exception("No authenticated tenant. Login before listing clients.")

        cursor = self.__require_cursor()
        if isinstance(cursor, DatabaseError):
            return cursor

        try:
            try:
                cursor.execute(
                    f"""
                    SELECT {CLIENT_COLUMNS}
                    FROM client
                    WHERE tenant_id = %s
                    ORDER BY name
                    """,
                    (self.current_tenant_id,)
                )
                rows = cursor.fetchall()
            finally:
                cursor.close()

            return [_client_row_to_dict(row) for row in rows]
        except (psycopg2.Error, ValueError, TypeError):
            logger.error("Error while executing a query.")
            raise Exception("Error while executing a query.")

    def add_client(
        self,
        name,
        email=None,
        phone_number=None,
        document=None,
        date_of_birth=None,
        remark=None,
    ):
        """Insert a new client for the authenticated tenant and return it as a dict."""
        if not self.current_tenant_id:
            raise Exception("No authenticated tenant. Login before adding a client.")

        cursor = self.__require_cursor()
        if isinstance(cursor, DatabaseError):
            return cursor

        conn = self.db.connection
        client_id = str(uuid.uuid4())

        try:
            try:
                cursor.execute(
                    f"""
                    INSERT INTO client (
                        client_id, tenant_id, employee_id, name, email,
                        phone_number, document, date_of_birth, remark
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING {CLIENT_COLUMNS}
                    """,
                    (
                        client_id, self.current_tenant_id, self.current_employee_id, name, email,
                        phone_number, document, date_of_birth, remark,
                    )
                )
                row = cursor.fetchone()
            finally:
                cursor.close()

            conn.commit()
            return _client_row_to_dict(row)
        except (psycopg2.Error, ValueError, TypeError):
            conn.rollback()
            logger.error("Error while executing a query.")
            raise Exception("Error while executing a query.")

    def edit_client(
        self,
        client_id,
        name=None,
        email=None,
        phone_number=None,
        document=None,
        date_of_birth=None,
        remark=None,
    ):
        """Update the client matching `client_id` and return it as a dict, or None if not found."""
        if not self.current_tenant_id:
            raise Exception("No authenticated tenant. Login before editing a client.")

        updates = {
            "name": name,
            "email": email,
            "phone_number": phone_number,
            "document": document,
            "date_of_birth": date_of_birth,
            "remark": remark,
        }
        fields = {column: value for column, value in updates.items() if value is not None}
        if not fields:
            return None

        cursor = self.__require_cursor()
        if isinstance(cursor, DatabaseError):
            return cursor

        conn = self.db.connection
        set_clause = ", ".join(f"{column} = %s" for column in fields)
        params = list(fields.values()) + [client_id, self.current_tenant_id]

        try:
            try:
                cursor.execute(
                    f"""
                    UPDATE client
                    SET {set_clause}, update_at = CURRENT_TIMESTAMP
                    WHERE client_id = %s AND tenant_id = %s
                    RETURNING {CLIENT_COLUMNS}
                    """,
                    params
                )
                row = cursor.fetchone()
            finally:
                cursor.close()

            conn.commit()
            return _client_row_to_dict(row) if row else None
        except (psycopg2.Error, ValueError, TypeError):
            conn.rollback()
            logger.error("Error while executing a query.")
            raise Exception("Error while executing a query.")

    def delete_client(self, client_id):
        """Remove the client matching `client_id`. Returns True if removed, False if not found."""
        if not self.current_tenant_id:
            raise Exception("No authenticated tenant. Login before deleting a client.")

        cursor = self.__require_cursor()
        if isinstance(cursor, DatabaseError):
            return cursor

        conn = self.db.connection

        try:
            try:
                cursor.execute(
                    "DELETE FROM client WHERE client_id = %s AND tenant_id = %s",
                    (client_id, self.current_tenant_id)
                )
                deleted = cursor.rowcount > 0
            finally:
                cursor.close()

            conn.commit()
            return deleted
        except (psycopg2.Error, ValueError, TypeError):
            conn.rollback()
            logger.error("Error while executing a query.")
            raise Exception("Error while executing a query.")
