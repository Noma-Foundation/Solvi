from dataclasses import dataclass
from datetime import date, datetime
from typing import Optional

from sqlalchemy import Date, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from internal.models.base import Base


class Client(Base):
    __tablename__ = "client"

    client_id: Mapped[str] = mapped_column(String, primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String, nullable=False)
    employee_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    phone_number: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    document: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    date_of_birth: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    remark: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    create_at: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=func.now())
    update_at: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=func.now())


@dataclass
class Customer:
    client_id: str
    tenant_id: str
    name: str
    employee_id: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    document: Optional[str] = None
    date_of_birth: Optional[str] = None
    remark: Optional[str] = None
    create_at: Optional[str] = None
    update_at: Optional[str] = None
