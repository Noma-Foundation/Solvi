from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, func

from internal.models.base import Base


class Notification(Base):
    __tablename__ = "notification"

    notification_id = Column(String, primary_key=True)
    tenant_id = Column(String, nullable=False)
    employee_id = Column(String, ForeignKey("employee.employee_id"), nullable=True)
    reference_id = Column(String, nullable=True)

    category = Column(String, nullable=False)
    status = Column(String, nullable=False, default="info")
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    is_read = Column(Boolean, nullable=False, default=False)

    create_at = Column(DateTime, server_default=func.now())
