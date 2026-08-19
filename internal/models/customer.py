from dataclasses import dataclass
from typing import Optional


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
