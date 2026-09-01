import logging
import uuid

from decimal import Decimal

import webview
import bcrypt

from sqlalchemy import select, func
from sqlalchemy.exc import SQLAlchemyError

from internal.utils.errors import QueryError
from internal.database import DatabaseConnection, open_connection
from internal.config import DBConfig
from internal.setting_api import SettingAPI
from internal.models import Client, EmployeeAccount, Movement


MOVEMENT_TYPES = ("income", "expense")
MOVEMENT_STATUSES = ("pending", "confirmed", "canceled")


logger = logging.getLogger(__name__)
logging.basicConfig(filename="solvi.log", level=logging.INFO)


class API:
    _window: webview.Window | None = None

    def __init__(self, database: DatabaseConnection, dbconfig: DBConfig, dev_mode: bool = False) -> None:
        self.db = open_connection(database, dbconfig)
        self.__dev_mode = dev_mode

        self.current_employee_id = None
        self.current_tenant_id = None

    def auth_user(self, username: str, password: str) -> bool | None:
        try:
            employee = self.db.session.execute(
                select(EmployeeAccount).where(EmployeeAccount.username == username)
            ).scalar_one_or_none()
        except SQLAlchemyError:
            self.__safe_rollback()
            logger.error("Error while executing a query.")
            raise QueryError("Error while executing a query.")

        if employee is None:
            return False
        
        if not employee.username or not employee.password:
            return False

        if not bcrypt.checkpw(password.encode("utf-8"), employee.password.encode("utf-8")):
            return False

        self.current_employee_id = str(employee.employee_id)
        self.current_tenant_id = str(employee.tenant_id)

        logger.info("Login successful. Existing credentials.")
        return True

    def get_clients(self):
        self.__require_tenant("Listing customers. Saving customers to the local database.")

        try:
            clients = self.db.session.execute(
                select(Client).where(Client.tenant_id == self.current_tenant_id).order_by(Client.name)
            ).scalars().all()
        except SQLAlchemyError:
            self.__safe_rollback()
            logger.error("Error while executing a query.")
            raise QueryError("Error while executing a query.")
        return [self.__client_to_dict(client) for client in clients]

    def add_client(self, name, email=None, phone_number=None, document=None, date_of_birth=None, remark=None) -> None:
        self.__require_tenant("Adding a customer to a cloud database.")

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
        try:
            self.db.session.commit()
            self.db.session.refresh(client)
        except SQLAlchemyError:
            self.__safe_rollback()
            logger.error("Error while executing a query.")
            raise QueryError("Error while executing a query.")
        return self.__client_to_dict(client)

    def edit_client(self, client_id, name=None, email=None, phone_number=None, document=None, date_of_birth=None, remark=None):
        self.__require_tenant("Editing customer information.")

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
        if not client or str(client.tenant_id) != self.current_tenant_id:
            return None

        for column, value in fields.items():
            setattr(client, column, value)
        client.update_at = func.now()

        try:
            self.db.session.commit()
            self.db.session.refresh(client)
        except SQLAlchemyError:
            self.__safe_rollback()
            logger.error("Error while executing a query.")
            raise QueryError("Error while executing a query.")
        return self.__client_to_dict(client)

    def delete_client(self, client_id):
        self.__require_tenant("deleting a client")

        client = self.db.session.get(Client, client_id)
        if not client or str(client.tenant_id) != self.current_tenant_id:
            return False

        self.db.session.delete(client)
        try:
            self.db.session.commit()
        except SQLAlchemyError:
            self.__safe_rollback()
            logger.error("Error while executing a query.")
            raise QueryError("Error while executing a query.")
        return True

    def get_movements(self):
        self.__require_tenant("Listing movements.")

        try:
            movements = self.db.session.execute(
                select(Movement)
                .where(Movement.tenant_id == self.current_tenant_id)
                .order_by(Movement.sequence_number)
            ).scalars().all()
        except SQLAlchemyError:
            self.__safe_rollback()
            logger.error("Error while executing a query.")
            raise QueryError("Error while executing a query.")
        return [self.__movement_to_dict(movement) for movement in movements]

    def add_movement(self, type, title, amount, location=None, client_id=None, tax_rate=None, status="pending", serial_number=None) -> None:
        self.__require_tenant("Adding a movement.")
        self.__validate_movement_type(type)
        self.__validate_movement_status(status)

        try:
            next_sequence = self.db.session.execute(
                select(func.count())
                .select_from(Movement)
                .where(Movement.tenant_id == self.current_tenant_id)
            ).scalar_one() + 1
        except SQLAlchemyError:
            self.__safe_rollback()
            logger.error("Error while executing a query.")
            raise QueryError("Error while executing a query.")

        movement = Movement(
            movement_id=str(uuid.uuid4()),
            tenant_id=self.current_tenant_id,
            employee_id=self.current_employee_id,
            client_id=client_id,
            sequence_number=next_sequence,
            serial_number=serial_number,
            type=type,
            status=status,
            title=title,
            location=location,
            amount=Decimal(str(amount)),
            tax_rate=Decimal(str(tax_rate)) if tax_rate is not None else None,
            tax_amount=self.__calculate_tax(amount, tax_rate),
        )
        self.db.session.add(movement)
        try:
            self.db.session.commit()
            self.db.session.refresh(movement)
        except SQLAlchemyError:
            self.__safe_rollback()
            logger.error("Error while executing a query.")
            raise QueryError("Error while executing a query.")
        return self.__movement_to_dict(movement)

    def edit_movement(self, movement_id, type=None, title=None, amount=None, location=None, client_id=None, tax_rate=None, status=None, serial_number=None):
        self.__require_tenant("Editing a movement.")

        movement = self.db.session.get(Movement, movement_id)
        if not movement or str(movement.tenant_id) != self.current_tenant_id:
            return None

        if type is not None:
            self.__validate_movement_type(type)
            movement.type = type
        if status is not None:
            self.__validate_movement_status(status)
            movement.status = status
        if title is not None:
            movement.title = title
        if location is not None:
            movement.location = location
        if client_id is not None:
            movement.client_id = client_id
        if serial_number is not None:
            movement.serial_number = serial_number

        if amount is not None or tax_rate is not None:
            new_amount = amount if amount is not None else movement.amount
            new_tax_rate = tax_rate if tax_rate is not None else movement.tax_rate
            movement.amount = Decimal(str(new_amount))
            movement.tax_rate = Decimal(str(new_tax_rate)) if new_tax_rate is not None else None
            movement.tax_amount = self.__calculate_tax(new_amount, new_tax_rate)

        movement.update_at = func.now()

        try:
            self.db.session.commit()
            self.db.session.refresh(movement)
        except SQLAlchemyError:
            self.__safe_rollback()
            logger.error("Error while executing a query.")
            raise QueryError("Error while executing a query.")
        return self.__movement_to_dict(movement)

    def delete_movement(self, movement_id):
        self.__require_tenant("Deleting a movement.")

        movement = self.db.session.get(Movement, movement_id)
        if not movement or str(movement.tenant_id) != self.current_tenant_id:
            return False

        self.db.session.delete(movement)
        try:
            self.db.session.commit()
        except SQLAlchemyError:
            self.__safe_rollback()
            logger.error("Error while executing a query.")
            raise QueryError("Error while executing a query.")
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
        logger.info("Rendered settings page.")

    def __safe_rollback(self) -> None:
        try:
            self.db.session.rollback()
        except SQLAlchemyError:
            logger.error("Rollback failed; the session may be shared across concurrent requests.")

    def __require_tenant(self, action: str) -> None:
        if not self.current_tenant_id:
            raise Exception(f"No authenticated tenant. Login before {action}.")
        logger.info(action)

    def __validate_movement_type(self, type: str) -> None:
        if type not in MOVEMENT_TYPES:
            raise ValueError(f"type must be one of {MOVEMENT_TYPES}.")

    def __validate_movement_status(self, status: str) -> None:
        if status not in MOVEMENT_STATUSES:
            raise ValueError(f"status must be one of {MOVEMENT_STATUSES}.")

    def __calculate_tax(self, amount, tax_rate) -> Decimal | None:
        if tax_rate is None:
            return None
        return (Decimal(str(amount)) * Decimal(str(tax_rate)) / Decimal("100")).quantize(Decimal("0.01"))

    def __movement_to_dict(self, movement: Movement) -> dict:
        return {
            "movement_id": str(movement.movement_id),
            "tenant_id": str(movement.tenant_id),
            "employee_id": str(movement.employee_id) if movement.employee_id else None,
            "client_id": str(movement.client_id) if movement.client_id else None,
            "sequence_number": movement.sequence_number,
            "serial_number": movement.serial_number,
            "type": movement.type,
            "status": movement.status,
            "title": movement.title,
            "location": movement.location,
            "amount": float(movement.amount),
            "tax_rate": float(movement.tax_rate) if movement.tax_rate is not None else None,
            "tax_amount": float(movement.tax_amount) if movement.tax_amount is not None else None,
            "create_at": movement.create_at.isoformat() if movement.create_at else None,
            "update_at": movement.update_at.isoformat() if movement.update_at else None,
        }

    def __client_to_dict(self, client: Client) -> dict:
        return {
            "client_id": str(client.client_id),
            "tenant_id": str(client.tenant_id),
            "employee_id": str(client.employee_id) if client.employee_id else None,
            "name": client.name,
            "email": client.email,
            "phone_number": client.phone_number,
            "document": client.document,
            "date_of_birth": client.date_of_birth.isoformat() if client.date_of_birth else None,
            "remark": client.remark,
            "create_at": client.create_at.isoformat() if client.create_at else None,
            "update_at": client.update_at.isoformat() if client.update_at else None,
        }
