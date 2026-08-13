from dataclasses import dataclass

@dataclass
class Ticket:
    id: int
    description: str
    price: float
