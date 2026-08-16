import tomllib
import logging

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


class API:
    _window: webview.Window | None = None

    def __init__(self, database: DatabaseConnection, dbconfig: DBConfig, dev_mode: bool = False) -> None:
        self.db = open_connection(database, dbconfig)
        self.__dev_mode = dev_mode

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
                    "SELECT username, password FROM employees WHERE username = %s",
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

            db_username, db_password_hash = row
            if not db_password_hash:
                return False

            return bcrypt.checkpw(password.encode("utf-8"), db_password_hash.encode("utf-8"))
        except (psycopg2.Error, ValueError, TypeError) as e:
            logger.error("Error while executing a query.")
            return DatabaseError.QUERY_ERROR 

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

    def add_client(self, name, email): 
        customer = Customer(
            name=name,
            email=email
        )

        return asdict(customer)

    def delete_client(self):
        pass
