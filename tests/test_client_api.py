import sys

sys.path.append(".")

import uuid
from datetime import date, datetime

import pytest

from internal.api import API


def _row(
    client_id="client-uuid",
    tenant_id="tenant-uuid",
    employee_id="employee-uuid",
    name="Jane Doe",
    email="jane@example.com",
    phone_number="123456789",
    document="12345678900",
    date_of_birth=date(1990, 1, 1),
    remark="VIP",
    create_at=datetime(2026, 1, 1, 12, 0, 0),
    update_at=datetime(2026, 1, 1, 12, 0, 0),
):
    return (
        client_id, tenant_id, employee_id, name, email,
        phone_number, document, date_of_birth, remark, create_at, update_at,
    )


def _api_with_cursor(mocker):
    api = API.__new__(API)
    api.db = mocker.Mock()
    api.db.connection = mocker.Mock()
    cursor = api.db.connection.cursor.return_value
    api.current_tenant_id = "tenant-uuid"
    api.current_employee_id = "employee-uuid"
    return api, cursor


def test_get_clients_raises_when_no_tenant():
    api = API.__new__(API)
    api.current_tenant_id = None

    with pytest.raises(Exception, match="No authenticated tenant"):
        api.get_clients()


def test_get_clients_returns_rows_as_dicts(mocker):
    api, cursor = _api_with_cursor(mocker)
    cursor.fetchall.return_value = [_row()]

    result = api.get_clients()

    cursor.execute.assert_called_once()
    query, params = cursor.execute.call_args[0]
    assert "client_id" in query and "update_at" in query
    assert params == ("tenant-uuid",)

    assert result == [{
        "client_id": "client-uuid",
        "tenant_id": "tenant-uuid",
        "employee_id": "employee-uuid",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "phone_number": "123456789",
        "document": "12345678900",
        "date_of_birth": "1990-01-01",
        "remark": "VIP",
        "create_at": "2026-01-01T12:00:00",
        "update_at": "2026-01-01T12:00:00",
    }]


def test_add_client_raises_when_no_tenant():
    api = API.__new__(API)
    api.current_tenant_id = None

    with pytest.raises(Exception, match="No authenticated tenant"):
        api.add_client("Jane Doe")


def test_add_client_inserts_and_commits(mocker):
    api, cursor = _api_with_cursor(mocker)
    cursor.fetchone.return_value = _row()
    mocker.patch.object(uuid, "uuid4", return_value="generated-uuid")

    result = api.add_client("Jane Doe", email="jane@example.com")

    query, params = cursor.execute.call_args[0]
    assert "INSERT INTO client" in query
    assert params == (
        "generated-uuid", "tenant-uuid", "employee-uuid", "Jane Doe", "jane@example.com",
        None, None, None, None,
    )
    api.db.connection.commit.assert_called_once()
    assert result["client_id"] == "client-uuid"


def test_edit_client_returns_none_when_no_fields_given():
    api = API.__new__(API)
    api.current_tenant_id = "tenant-uuid"

    result = api.edit_client("client-uuid")

    assert result is None


def test_edit_client_updates_and_returns_dict(mocker):
    api, cursor = _api_with_cursor(mocker)
    cursor.fetchone.return_value = _row(name="Jane Updated")

    result = api.edit_client("client-uuid", name="Jane Updated")

    query, params = cursor.execute.call_args[0]
    assert "UPDATE client" in query
    assert "name = %s" in query
    assert params == ["Jane Updated", "client-uuid", "tenant-uuid"]
    api.db.connection.commit.assert_called_once()
    assert result["name"] == "Jane Updated"


def test_edit_client_returns_none_when_not_found(mocker):
    api, cursor = _api_with_cursor(mocker)
    cursor.fetchone.return_value = None

    result = api.edit_client("missing-uuid", name="Jane Updated")

    assert result is None


def test_delete_client_returns_true_when_removed(mocker):
    api, cursor = _api_with_cursor(mocker)
    cursor.rowcount = 1

    result = api.delete_client("client-uuid")

    cursor.execute.assert_called_once_with(
        "DELETE FROM client WHERE client_id = %s AND tenant_id = %s",
        ("client-uuid", "tenant-uuid"),
    )
    api.db.connection.commit.assert_called_once()
    assert result is True


def test_delete_client_returns_false_when_not_found(mocker):
    api, cursor = _api_with_cursor(mocker)
    cursor.rowcount = 0

    result = api.delete_client("missing-uuid")

    assert result is False


def test_delete_client_raises_when_no_tenant():
    api = API.__new__(API)
    api.current_tenant_id = None

    with pytest.raises(Exception, match="No authenticated tenant"):
        api.delete_client("client-uuid")
