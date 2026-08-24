from sqlalchemy import Column, Date, DateTime, String, func

from internal.models.base import Base


class Client(Base):
    __tablename__ = "client"

    client_id = Column(String, primary_key=True)
    tenant_id = Column(String, nullable=False)
    employee_id = Column(String, nullable=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    document = Column(String, nullable=True)
    date_of_birth = Column(Date, nullable=True)
    remark = Column(String, nullable=True)
    create_at = Column(DateTime, server_default=func.now())
    update_at = Column(DateTime, server_default=func.now())
