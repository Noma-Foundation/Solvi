from dataclasses import dataclass

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from internal.models.base import Base


class EmployeeAccount(Base):
    __tablename__ = "employee"

    employee_id: Mapped[str] = mapped_column(String, primary_key=True)
    tenant_id: Mapped[str] = mapped_column("terant_id", String, nullable=False)
    username: Mapped[str] = mapped_column(String, nullable=False)
    password: Mapped[str] = mapped_column(String, nullable=False)


@dataclass
class Employee:
    id: int
    name: str
    is_admin: bool


def create_employee(id: int, name: str, is_admin: bool) -> Employee:
    if (not isinstance(id, int) or not isinstance(name, str) or not isinstance(is_admin, bool)):
        raise TypeError("Invalid data types for Employee attributes.")
    return Employee(id=id, name=name, is_admin=is_admin)
