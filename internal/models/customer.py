from dataclasses import dataclass

@dataclass
class Customer:
    id: int
    name: str
<<<<<<< HEAD
    email: str
=======
    phone: str = ""
    cpf: str = ""
    email: str = ""
    description: str = ""
    cep: str = ""
    address: str = ""

    def to_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict) -> "Customer":
        return cls(
            id=str(data.get("id", "")),
            name=str(data.get("name", "")),
            phone=str(data.get("phone", "") or ""),
            cpf=str(data.get("cpf", "") or ""),
            email=str(data.get("email", "") or ""),
            description=str(data.get("description", "") or ""),
            cep=str(data.get("cep", "") or ""),
            address=str(data.get("address", "") or ""),
        )
>>>>>>> 73fee27 (Add xref-main.html and unit tests for Customer model)
