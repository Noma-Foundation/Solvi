from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String, func

from internal.models.base import Base


class Movement(Base):
    __tablename__ = "movement"

    movement_id = Column(String, primary_key=True)
    tenant_id = Column(String, nullable=False)
    employee_id = Column(String, ForeignKey("employee.employee_id"), nullable=True)
    client_id = Column(String, ForeignKey("client.client_id"), nullable=True)

    sequence_number = Column(Integer, nullable=False)
    serial_number = Column(String, nullable=True)
    type = Column(String, nullable=False)
    status = Column(String, nullable=False, default="pending")

    title = Column(String, nullable=False)
    location = Column(String, nullable=True)

    amount = Column(Numeric(12, 2), nullable=False)
    tax_rate = Column(Numeric(5, 2), nullable=True)
    tax_amount = Column(Numeric(12, 2), nullable=True)

    create_at = Column(DateTime, server_default=func.now())
    update_at = Column(DateTime, server_default=func.now())
