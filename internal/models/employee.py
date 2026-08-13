from dataclasses import dataclass

@dataclass
class Employee:
    id: int
    name: str
    is_admin: bool


def create_employee(id: int, name: str, is_admin: bool) -> Employee:
    if (not isinstance(id, int) or not isinstance(name, str) or not isinstance(is_admin, bool)):
        raise TypeError("Invalid data types for Employee attributes.")
    return Employee(id=id, name=name, is_admin=is_admin)
