import logging
import uuid

import webview
import bcrypt

from dataclasses import asdict

from sqlalchemy import select, func
from sqlalchemy.exc import SQLAlchemyError

from internal.database import DatabaseConnection, open_connection
from internal.config import DBConfig
from internal.setting_api import SettingAPI
from internal.models import Client, Customer, EmployeeAccount


logger = logging.getLogger(__name__)
logging.basicConfig(filename="solvi.log", level=logging.INFO)


class API:
    _window: webview.Window | None = None

    def __init__(self, database: DatabaseConnection, dbconfig: DBConfig, dev_mode: bool = False) -> None:
        self.db = open_connection(database, dbconfig)
        self.__dev_mode = dev_mode

        self.current_employee_id = None
        self.current_tenant_id = None

    def auth_user(self, username: str, password: str) -> bool:
        """Authenticate user by username and password."""
        employee = self.__fetch(
            select(EmployeeAccount).where(EmployeeAccount.username == username)
        ).scalar_one_or_none()

        if not employee or not employee.username or not employee.password:
            return False
        if not bcrypt.checkpw(password.encode("utf-8"), employee.password.encode("utf-8")):
            return False

        self.current_employee_id = str(employee.employee_id)
        self.current_tenant_id = str(employee.tenant_id)
        return True

    def get_clients(self):
        """Return every client belonging to the authenticated tenant."""
        self.__require_tenant("listing clients")

        clients = self.__fetch(
            select(Client).where(Client.tenant_id == self.current_tenant_id).order_by(Client.name)
        ).scalars().all()
        return [self.__client_to_dict(client) for client in clients]

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
        self.__require_tenant("adding a client")

        client = Client(
            client_id=str(uuid.uuid4()),
            tenant_id=self.current_tenant_id,
            employee_id=self.current_employee_id,
            name=name,
            email=email,
            phone_number=phone_number,
            document=document,
            date_of_birth=date_of_birth,
            remark=remark,
        )
        self.db.session.add(client)
        self.__commit(client)
        return self.__client_to_dict(client)

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
        self.__require_tenant("editing a client")

        fields = {
            column: value
            for column, value in {
                "name": name,
                "email": email,
                "phone_number": phone_number,
                "document": document,
                "date_of_birth": date_of_birth,
                "remark": remark,
            }.items()
            if value is not None
        }
        if not fields:
            return None

        client = self.db.session.get(Client, client_id)
        if not client or client.tenant_id != self.current_tenant_id:
            return None

        for column, value in fields.items():
            setattr(client, column, value)
        client.update_at = func.now()

        self.__commit(client)
        return self.__client_to_dict(client)

    def delete_client(self, client_id):
        self.__require_tenant("deleting a client")

        client = self.db.session.get(Client, client_id)
        if not client or client.tenant_id != self.current_tenant_id:
            return False

        self.db.session.delete(client)
        self.__commit()
        return True

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

    def __require_tenant(self, action: str) -> None:
        """Raise if there is no authenticated tenant for the current session."""
        if not self.current_tenant_id:
            raise Exception(f"No authenticated tenant. Login before {action}.")

    def __fetch(self, statement):
        """Run a read-only select statement, wrapping SQLAlchemy errors."""
        try:
            return self.db.session.execute(statement)
        except SQLAlchemyError:
            logger.error("Error while executing a query.")
            raise Exception("Error while executing a query.")

    def __commit(self, instance=None) -> None:
        """Commit the session and refresh `instance` with DB-computed values (e.g. timestamps)."""
        try:
            self.db.session.commit()
            if instance is not None:
                self.db.session.refresh(instance)
        except SQLAlchemyError:
            self.db.session.rollback()
            logger.error("Error while executing a query.")
            raise Exception("Error while executing a query.")

    def __client_to_dict(self, client: Client) -> dict:
        customer = Customer(
            client_id=str(client.client_id),
            tenant_id=str(client.tenant_id),
            employee_id=str(client.employee_id) if client.employee_id else None,
            name=client.name,
            email=client.email,
            phone_number=client.phone_number,
            document=client.document,
            date_of_birth=client.date_of_birth.isoformat() if client.date_of_birth else None,
            remark=client.remark,
            create_at=client.create_at.isoformat() if client.create_at else None,
            update_at=client.update_at.isoformat() if client.update_at else None,
        )
        return asdict(customer)
