from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from internal.models.base import Base


class EmployeeAccount(Base):
    __tablename__ = "employee"

    employee_id: Mapped[str] = mapped_column(String, primary_key=True)
    tenant_id: Mapped[str] = mapped_column("terant_id", String, nullable=False)
    username: Mapped[str] = mapped_column(String, nullable=False)
    password: Mapped[str] = mapped_column(String, nullable=False)
