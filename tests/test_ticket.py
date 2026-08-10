import os

os.path.append(".")


def test_ticket_dto():
    from internal.models.ticket import Ticket

    ticket = Ticket(
        id=1,
        description="Concert Ticket",
        price=99.99
    )
    assert ticket.id == 1
    assert ticket.description == "Concert Ticket"
    assert ticket.price == 99.99