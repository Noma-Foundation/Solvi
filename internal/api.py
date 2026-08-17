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

        self.clients = []
        self.__next_client_id = 1

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

    def get_clients(self):
        return [asdict(customer) for customer in self.clients]

    def add_client(
        self,
        name,
        email,
        status="pending",
        status_label="Pendente",
        aulas="-",
        valor_pago="-",
        telefone="-",
        responsavel="-",
        cargo="-",
        endereco="-",
        cidade_uf="-",
        plano="-",
        inicio="-",
        renovacao="-",
        documento="-",
        observacoes="-",
    ):
        customer = Customer(
            id=self.__next_client_id,
            name=name,
            email=email,
            status=status,
            status_label=status_label,
            aulas=aulas,
            valor_pago=valor_pago,
            telefone=telefone,
            responsavel=responsavel,
            cargo=cargo,
            endereco=endereco,
            cidade_uf=cidade_uf,
            plano=plano,
            inicio=inicio,
            renovacao=renovacao,
            documento=documento,
            observacoes=observacoes,
        )
        self.__next_client_id += 1
        self.clients.append(customer)

        return asdict(customer)

    def edit_client(
        self,
        client_id,
        name=None,
        email=None,
        status=None,
        status_label=None,
        aulas=None,
        valor_pago=None,
        telefone=None,
        responsavel=None,
        cargo=None,
        endereco=None,
        cidade_uf=None,
        plano=None,
        inicio=None,
        renovacao=None,
        documento=None,
        observacoes=None,
    ):
        """Update the client matching `client_id` and return it as a dict, or None if not found."""
        customer = next((c for c in self.clients if c.id == client_id), None)
        if customer is None:
            return None

        updates = {
            "name": name,
            "email": email,
            "status": status,
            "status_label": status_label,
            "aulas": aulas,
            "valor_pago": valor_pago,
            "telefone": telefone,
            "responsavel": responsavel,
            "cargo": cargo,
            "endereco": endereco,
            "cidade_uf": cidade_uf,
            "plano": plano,
            "inicio": inicio,
            "renovacao": renovacao,
            "documento": documento,
            "observacoes": observacoes,
        }
        for field, value in updates.items():
            if value is not None:
                setattr(customer, field, value)

        return asdict(customer)

    def delete_client(self, client_id):
        """Remove the client matching `client_id`. Returns True if removed, False if not found."""
        for index, customer in enumerate(self.clients):
            if customer.id == client_id:
                del self.clients[index]
                return True

        return False
