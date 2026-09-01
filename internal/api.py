import logging
import uuid

from datetime import date, datetime, timedelta
from decimal import Decimal

import webview
import bcrypt

from sqlalchemy import extract, select, func
from sqlalchemy.exc import SQLAlchemyError

from internal.utils.errors import QueryError
from internal.database import DatabaseConnection, open_connection
from internal.config import DBConfig
from internal.setting_api import SettingAPI
from internal.models import Client, EmployeeAccount, Movement, Task, Notification


MOVEMENT_TYPES = ("income", "expense")
MOVEMENT_STATUSES = ("pending", "confirmed", "canceled")
TASK_STATUSES = ("todo", "doing", "done")
NOTIFICATION_STATUSES = ("success", "info", "warning", "error")


logger = logging.getLogger(__name__)
logging.basicConfig(filename="solvi.log", level=logging.INFO)


class API:
    _window: webview.Window | None = None

    def __init__(self, database: DatabaseConnection, dbconfig: DBConfig, dev_mode: bool = False) -> None:
        self.db = open_connection(database, dbconfig)
        self.__dev_mode = dev_mode

        self.current_employee_id = None
        self.current_tenant_id = None
        self.current_employee_name = None
        self.current_employee_is_team_leader = False

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
        self.current_employee_name = employee.name
        self.current_employee_is_team_leader = bool(employee.is_team_leader)

        logger.info("Login successful. Existing credentials.")
        self.__check_birthdays()
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

        self.__notify(
            category="Cliente", status="success",
            title="Cliente cadastrado", message=f"Cliente {client.name} foi cadastrado por {self.__actor_name()}.",
            reference_id=client.client_id,
        )
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

        self.__notify(
            category="Cliente", status="info",
            title="Cliente atualizado", message=f"Cliente {client.name} foi atualizado por {self.__actor_name()}.",
            reference_id=client.client_id,
        )
        return self.__client_to_dict(client)

    def delete_client(self, client_id):
        self.__require_tenant("deleting a client")

        client = self.db.session.get(Client, client_id)
        if not client or str(client.tenant_id) != self.current_tenant_id:
            return False

        client_name = client.name
        self.db.session.delete(client)
        try:
            self.db.session.commit()
        except SQLAlchemyError:
            self.__safe_rollback()
            logger.error("Error while executing a query.")
            raise QueryError("Error while executing a query.")

        self.__notify(
            category="Cliente", status="warning",
            title="Cliente removido", message=f"Cliente {client_name} foi removido por {self.__actor_name()}.",
        )
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

        self.__notify(
            category="Orçamento", status="success",
            title="Orçamento criado",
            message=f"Orçamento {movement.sequence_number:04d} para {movement.title} criado por {self.__actor_name()}.",
            reference_id=movement.movement_id,
        )
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

        self.__notify(
            category="Orçamento", status="info",
            title="Orçamento atualizado",
            message=f"Orçamento {movement.sequence_number:04d} foi atualizado por {self.__actor_name()}.",
            reference_id=movement.movement_id,
        )
        return self.__movement_to_dict(movement)

    def delete_movement(self, movement_id):
        self.__require_tenant("Deleting a movement.")

        movement = self.db.session.get(Movement, movement_id)
        if not movement or str(movement.tenant_id) != self.current_tenant_id:
            return False

        sequence_number = movement.sequence_number
        self.db.session.delete(movement)
        try:
            self.db.session.commit()
        except SQLAlchemyError:
            self.__safe_rollback()
            logger.error("Error while executing a query.")
            raise QueryError("Error while executing a query.")

        self.__notify(
            category="Orçamento", status="warning",
            title="Orçamento removido",
            message=f"Orçamento {sequence_number:04d} foi removido por {self.__actor_name()}.",
        )
        return True

    def get_tasks(self, start_date=None, end_date=None):
        self.__require_tenant("Listing tasks.")

        query = select(Task).where(Task.tenant_id == self.current_tenant_id)
        if start_date is not None:
            query = query.where(Task.due_date >= start_date)
        if end_date is not None:
            query = query.where(Task.due_date <= end_date)
        query = query.order_by(Task.due_date)

        try:
            tasks = self.db.session.execute(query).scalars().all()
        except SQLAlchemyError:
            self.__safe_rollback()
            logger.error("Error while executing a query.")
            raise QueryError("Error while executing a query.")
        return [self.__task_to_dict(task) for task in tasks]

    def add_task(self, title, due_date, description=None, status="todo") -> None:
        self.__require_tenant("Adding a task.")
        self.__validate_task_status(status)

        task = Task(
            task_id=str(uuid.uuid4()),
            tenant_id=self.current_tenant_id,
            employee_id=self.current_employee_id,
            title=title,
            description=description,
            due_date=due_date,
            status=status,
        )
        self.db.session.add(task)
        try:
            self.db.session.commit()
            self.db.session.refresh(task)
        except SQLAlchemyError:
            self.__safe_rollback()
            logger.error("Error while executing a query.")
            raise QueryError("Error while executing a query.")

        self.__notify(
            category="Tarefa", status="success",
            title="Tarefa criada", message=f'Tarefa "{task.title}" criada para {task.due_date} por {self.__actor_name()}.',
            reference_id=task.task_id,
        )
        return self.__task_to_dict(task)

    def edit_task(self, task_id, title=None, description=None, due_date=None, status=None):
        self.__require_tenant("Editing a task.")

        task = self.db.session.get(Task, task_id)
        if not task or str(task.tenant_id) != self.current_tenant_id:
            return None

        if title is not None:
            task.title = title
        if description is not None:
            task.description = description
        if due_date is not None:
            task.due_date = due_date
        if status is not None:
            self.__validate_task_status(status)
            task.status = status

        task.update_at = func.now()

        try:
            self.db.session.commit()
            self.db.session.refresh(task)
        except SQLAlchemyError:
            self.__safe_rollback()
            logger.error("Error while executing a query.")
            raise QueryError("Error while executing a query.")

        self.__notify(
            category="Tarefa", status="info",
            title="Tarefa atualizada", message=f'Tarefa "{task.title}" foi atualizada por {self.__actor_name()}.',
            reference_id=task.task_id,
        )
        return self.__task_to_dict(task)

    def delete_task(self, task_id):
        self.__require_tenant("Deleting a task.")

        task = self.db.session.get(Task, task_id)
        if not task or str(task.tenant_id) != self.current_tenant_id:
            return False

        task_title = task.title
        self.db.session.delete(task)
        try:
            self.db.session.commit()
        except SQLAlchemyError:
            self.__safe_rollback()
            logger.error("Error while executing a query.")
            raise QueryError("Error while executing a query.")

        self.__notify(
            category="Tarefa", status="warning",
            title="Tarefa removida", message=f'Tarefa "{task_title}" foi removida por {self.__actor_name()}.',
        )
        return True

    def get_current_employee(self):
        self.__require_tenant("Reading the current employee's profile.")
        return {
            "employee_id": self.current_employee_id,
            "name": self.current_employee_name,
            "is_team_leader": self.current_employee_is_team_leader,
        }

    def get_dashboard_summary(self):
        self.__require_tenant("Loading the dashboard.")

        today = date.today()
        start_of_this_month_date = today.replace(day=1)
        start_of_last_month_date = (start_of_this_month_date - timedelta(days=1)).replace(day=1)
        # Movement/Client.create_at are DateTime columns; comparing them against
        # a bare date (rather than a datetime at midnight) compiles inconsistently
        # across dialects, so always compare against a real datetime.
        start_of_this_month = datetime.combine(start_of_this_month_date, datetime.min.time())
        start_of_last_month = datetime.combine(start_of_last_month_date, datetime.min.time())

        try:
            active_clients_count = self.db.session.execute(
                select(func.count()).select_from(Client)
                .where(Client.tenant_id == self.current_tenant_id)
            ).scalar_one()
            active_clients_last_month = self.db.session.execute(
                select(func.count()).select_from(Client).where(
                    Client.tenant_id == self.current_tenant_id,
                    Client.create_at < start_of_this_month,
                )
            ).scalar_one()

            income_this_month = self.__sum_movements("income", start_of_this_month)
            income_last_month = self.__sum_movements("income", start_of_last_month, start_of_this_month)
            expense_this_month = self.__sum_movements("expense", start_of_this_month)
            expense_last_month = self.__sum_movements("expense", start_of_last_month, start_of_this_month)

            today_movements = self.db.session.execute(
                select(Movement).where(
                    Movement.tenant_id == self.current_tenant_id,
                    Movement.status == "confirmed",
                    func.date(Movement.create_at) == today,
                ).order_by(Movement.create_at.desc())
            ).scalars().all()

            recent_notifications = self.db.session.execute(
                select(Notification)
                .where(Notification.tenant_id == self.current_tenant_id)
                .order_by(Notification.create_at.desc())
                .limit(5)
            ).scalars().all()
        except SQLAlchemyError:
            self.__safe_rollback()
            logger.error("Error while executing a query.")
            raise QueryError("Error while executing a query.")

        today_balance = sum(
            (movement.amount if movement.type == "income" else -movement.amount)
            for movement in today_movements
        ) if today_movements else Decimal("0")

        return {
            "active_clients_count": active_clients_count,
            "active_clients_change_percent": self.__percent_change(active_clients_count, active_clients_last_month),
            "income_amount": float(income_this_month),
            "income_change_percent": self.__percent_change(income_this_month, income_last_month),
            "expense_amount": float(expense_this_month),
            "expense_change_percent": self.__percent_change(expense_this_month, expense_last_month),
            "today_movements": [self.__movement_to_dict(movement) for movement in today_movements],
            "today_balance": float(today_balance),
            "recent_notifications": [self.__notification_to_dict(n) for n in recent_notifications],
        }

    def get_notifications(self):
        self.__require_tenant("Listing notifications.")

        try:
            notifications = self.db.session.execute(
                select(Notification)
                .where(Notification.tenant_id == self.current_tenant_id)
                .order_by(Notification.create_at.desc())
            ).scalars().all()
        except SQLAlchemyError:
            self.__safe_rollback()
            logger.error("Error while executing a query.")
            raise QueryError("Error while executing a query.")
        return [self.__notification_to_dict(notification) for notification in notifications]

    def mark_notification_read(self, notification_id):
        self.__require_tenant("Marking a notification as read.")

        notification = self.db.session.get(Notification, notification_id)
        if not notification or str(notification.tenant_id) != self.current_tenant_id:
            return None

        notification.is_read = True
        try:
            self.db.session.commit()
            self.db.session.refresh(notification)
        except SQLAlchemyError:
            self.__safe_rollback()
            logger.error("Error while executing a query.")
            raise QueryError("Error while executing a query.")
        return self.__notification_to_dict(notification)

    def delete_notification(self, notification_id):
        self.__require_tenant("Deleting a notification.")
        self.__require_team_leader("deleting a notification")

        notification = self.db.session.get(Notification, notification_id)
        if not notification or str(notification.tenant_id) != self.current_tenant_id:
            return False

        self.db.session.delete(notification)
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

    def __require_team_leader(self, action: str) -> None:
        if not self.current_employee_is_team_leader:
            logger.warning(f"Permission denied for {self.current_employee_id}: {action}.")
            raise PermissionError(f"Only a team leader can perform this action: {action}.")

    def __actor_name(self) -> str:
        return self.current_employee_name or "Sistema"

    def __notify(self, category: str, status: str, title: str, message: str, reference_id: str | None = None) -> None:
        """Records an internal notification. Called after every mutation so
        changes across the system are always visible in the notification feed.
        A failure here is logged but never raised, so a notification issue
        never rolls back or masks the mutation that triggered it."""
        notification = Notification(
            notification_id=str(uuid.uuid4()),
            tenant_id=self.current_tenant_id,
            employee_id=self.current_employee_id,
            reference_id=reference_id,
            category=category,
            status=status,
            title=title,
            message=message,
        )
        self.db.session.add(notification)
        try:
            self.db.session.commit()
        except SQLAlchemyError:
            self.__safe_rollback()
            logger.error("Failed to record a notification.")

    def __sum_movements(self, movement_type: str, start: datetime, end: datetime | None = None) -> Decimal:
        query = select(func.coalesce(func.sum(Movement.amount), 0)).where(
            Movement.tenant_id == self.current_tenant_id,
            Movement.status == "confirmed",
            Movement.type == movement_type,
            Movement.create_at >= start,
        )
        if end is not None:
            query = query.where(Movement.create_at < end)
        return self.db.session.execute(query).scalar_one()

    def __percent_change(self, current, previous) -> float | None:
        if not previous:
            return None
        return round((float(current) - float(previous)) / float(previous) * 100, 1)

    def __check_birthdays(self) -> None:
        today = date.today()

        try:
            clients = self.db.session.execute(
                select(Client).where(
                    Client.tenant_id == self.current_tenant_id,
                    extract("month", Client.date_of_birth) == today.month,
                    extract("day", Client.date_of_birth) == today.day,
                )
            ).scalars().all()
        except SQLAlchemyError:
            self.__safe_rollback()
            logger.error("Failed to check for client birthdays.")
            return

        for client in clients:
            try:
                already_notified = self.db.session.execute(
                    select(Notification).where(
                        Notification.tenant_id == self.current_tenant_id,
                        Notification.category == "Aniversário",
                        Notification.reference_id == client.client_id,
                        func.date(Notification.create_at) == today,
                    )
                ).scalar_one_or_none()
            except SQLAlchemyError:
                self.__safe_rollback()
                logger.error("Failed to check for client birthdays.")
                continue

            if already_notified:
                continue

            self.__notify(
                category="Aniversário", status="info",
                title=f"Hoje é aniversário de {client.name}",
                message=f"Dê os parabéns à {client.name}.",
                reference_id=client.client_id,
            )

    def __validate_task_status(self, status: str) -> None:
        if status not in TASK_STATUSES:
            raise ValueError(f"status must be one of {TASK_STATUSES}.")

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

    def __task_to_dict(self, task: Task) -> dict:
        return {
            "task_id": str(task.task_id),
            "tenant_id": str(task.tenant_id),
            "employee_id": str(task.employee_id) if task.employee_id else None,
            "title": task.title,
            "description": task.description,
            "due_date": task.due_date.isoformat() if task.due_date else None,
            "status": task.status,
            "create_at": task.create_at.isoformat() if task.create_at else None,
            "update_at": task.update_at.isoformat() if task.update_at else None,
        }

    def __notification_to_dict(self, notification: Notification) -> dict:
        return {
            "notification_id": str(notification.notification_id),
            "tenant_id": str(notification.tenant_id),
            "employee_id": str(notification.employee_id) if notification.employee_id else None,
            "reference_id": notification.reference_id,
            "category": notification.category,
            "status": notification.status,
            "title": notification.title,
            "message": notification.message,
            "is_read": notification.is_read,
            "create_at": notification.create_at.isoformat() if notification.create_at else None,
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
