import sys

sys.path.append(".")

from internal.models.customer import Customer


def test_ticket_dto():
    ticket = Customer(
        id=1,
        name="John Doe",
        email="john.doe@example.com"
    )
    assert ticket.id == 1
    assert ticket.name == "John Doe"
    assert ticket.email == "john.doe@example.com"