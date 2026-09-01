import datetime

import pytest

from internal.api import API


def test_add_movement(mocker):
    fake_connection = mocker.MagicMock()
    mocker.patch("internal.api.open_connection", return_value=fake_connection)
    fake_connection.session.execute.return_value.scalar_one.return_value = 0

    api = API(database=mocker.MagicMock(), dbconfig=mocker.MagicMock())
    api.current_tenant_id = "tenant-123"
    api.current_employee_id = "employee-456"

    result = api.add_movement(
        type="income", title="Orçamento 1", amount=100, tax_rate=18,
        client_id="client-789", serial_number="SN-001",
    )

    # add_movement also records an internal notification, so session.add/commit
    # are called a second time for that Notification row.
    assert fake_connection.session.add.call_count == 2
    assert fake_connection.session.commit.call_count == 2
    fake_connection.session.refresh.assert_called_once()

    added_movement = fake_connection.session.add.call_args_list[0][0][0]
    assert added_movement.type == "income"
    assert added_movement.sequence_number == 1
    assert added_movement.tenant_id == "tenant-123"
    assert added_movement.employee_id == "employee-456"
    assert added_movement.client_id == "client-789"
    assert added_movement.serial_number == "SN-001"
    assert added_movement.status == "pending"

    assert result["title"] == "Orçamento 1"
    assert result["amount"] == 100
    assert result["tax_amount"] == 18
    assert result["client_id"] == "client-789"
    assert result["serial_number"] == "SN-001"


def test_add_movement_rejects_invalid_type(mocker):
    fake_connection = mocker.MagicMock()
    mocker.patch("internal.api.open_connection", return_value=fake_connection)

    api = API(database=mocker.MagicMock(), dbconfig=mocker.MagicMock())
    api.current_tenant_id = "tenant-123"

    with pytest.raises(ValueError):
        api.add_movement(type="transfer", title="Invalid", amount=100)


def test_edit_movement_recalculates_tax(mocker):
    fake_connection = mocker.MagicMock()
    mocker.patch("internal.api.open_connection", return_value=fake_connection)

    api = API(database=mocker.MagicMock(), dbconfig=mocker.MagicMock())
    api.current_tenant_id = "tenant-123"

    fake_movement = mocker.MagicMock(
        movement_id="movement-1", tenant_id="tenant-123", amount=100, tax_rate=None,
        sequence_number=1,
    )
    fake_connection.session.get.return_value = fake_movement
    # session.refresh() would normally reload server-computed columns (like
    # update_at) from the database; simulate that here since fake_movement
    # otherwise keeps the raw func.now() clause assigned in edit_movement.
    fake_connection.session.refresh.side_effect = (
        lambda movement: setattr(movement, "update_at", datetime.datetime(2026, 1, 1))
    )

    result = api.edit_movement("movement-1", amount=200, tax_rate=10, status="confirmed")

    assert fake_movement.amount == 200
    assert fake_movement.status == "confirmed"
    # One commit for the edit, one for the internal notification it records.
    assert fake_connection.session.commit.call_count == 2


def test_delete_movement(mocker):
    fake_connection = mocker.MagicMock()
    mocker.patch("internal.api.open_connection", return_value=fake_connection)

    api = API(database=mocker.MagicMock(), dbconfig=mocker.MagicMock())
    api.current_tenant_id = "tenant-123"

    fake_movement = mocker.MagicMock(movement_id="movement-1", tenant_id="tenant-123", sequence_number=1)
    fake_connection.session.get.return_value = fake_movement

    result = api.delete_movement("movement-1")

    fake_connection.session.delete.assert_called_once_with(fake_movement)
    # One commit for the delete, one for the internal notification it records.
    assert fake_connection.session.commit.call_count == 2
    assert result is True
