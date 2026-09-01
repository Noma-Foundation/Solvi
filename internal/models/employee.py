from sqlalchemy import Boolean, Column, String

from internal.models.base import Base


class EmployeeAccount(Base):
    __tablename__ = "employee"

    employee_id = Column(String, primary_key=True)
    tenant_id = Column("terant_id", String, nullable=False)
    username = Column(String, nullable=False)
    password = Column(String, nullable=False)
    name = Column(String, nullable=True)
    is_team_leader = Column(Boolean, nullable=True, default=False)
