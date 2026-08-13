from dataclasses import dataclass, asdict


@dataclass
class Customer:
    id: str
    name: str
    phone: str = ""
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
            phone=str(data.get("phone", "")),
            email=str(data.get("email", "")),
            description=str(data.get("description", "")),
            cep=str(data.get("cep", "")),
            address=str(data.get("address", "")),
        )
