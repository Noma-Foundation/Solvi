from sqlalchemy import Column, Date, DateTime, ForeignKey, String, func

from internal.models.base import Base


class Task(Base):
    __tablename__ = "task"

    task_id = Column(String, primary_key=True)
    tenant_id = Column(String, nullable=False)
    employee_id = Column(String, ForeignKey("employee.employee_id"), nullable=True)

    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    due_date = Column(Date, nullable=False)
    status = Column(String, nullable=False, default="todo")

    create_at = Column(DateTime, server_default=func.now())
    update_at = Column(DateTime, server_default=func.now())
