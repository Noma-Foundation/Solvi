from dataclasses import asdict, dataclass


@dataclass
class Customer:
    id: int | str
    name: str
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
