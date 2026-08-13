import sys

sys.path.append(".")

from internal.models.customer import Customer


def test_ticket_dto():
    ticket = Customer(
        id=1,
        name="John Doe",
        email="john.doe@example.com",
    )
    assert ticket.id == 1
    assert ticket.name == "John Doe"
    assert ticket.email == "john.doe@example.com"


def test_customer_cpf_roundtrip():
    customer = Customer(id="1", name="John Doe", cpf="123.456.789-00")
    payload = customer.to_dict()
    assert payload["cpf"] == "123.456.789-00"
    restored = Customer.from_dict(payload)
    assert restored.cpf == "123.456.789-00"
