from dataclasses import dataclass

@dataclass
class Customer:
    id: int
    name: str
    email: str
    status: str = "pending"
    status_label: str = "Pending"
    classes: str = "-"
    amount_paid: str = "-"
    phone: str = "-"
    contact_person: str = "-"
    job_title: str = "-"
    address: str = "-"
    city_state: str = "-"
    plan: str = "-"
    start_date: str = "-"
    renewal_date: str = "-"
    document: str = "-"
    notes: str = "-"
