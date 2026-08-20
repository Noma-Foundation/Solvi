import sys

sys.path.append(".")

from datetime import date

import pytest

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from internal.api import API
from internal.database import DatabaseConnection
from internal.models import Base, Client


@pytest.fixture
def api():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine)()

    instance = API.__new__(API)
    instance.db = DatabaseConnection(engine=engine, session=session)
    instance.current_tenant_id = "tenant-uuid"
    instance.current_employee_id = "employee-uuid"
    return instance


def _add_client(api, **overrides):
    fields = dict(
        client_id="client-uuid",
        tenant_id="tenant-uuid",
        employee_id="employee-uuid",
        name="Jane Doe",
        email="jane@example.com",
        phone_number="123456789",
        document="12345678900",
        date_of_birth=date(1990, 1, 1),
        remark="VIP",
    )
    fields.update(overrides)
    api.db.session.add(Client(**fields))
    api.db.session.commit()


def test_get_clients_raises_when_no_tenant():
    api = API.__new__(API)
    api.current_tenant_id = None

    with pytest.raises(Exception, match="No authenticated tenant"):
        api.get_clients()


def test_get_clients_returns_rows_as_dicts(api):
    _add_client(api)

    result = api.get_clients()

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
        "create_at": result[0]["create_at"],
        "update_at": result[0]["update_at"],
    }]


def test_get_clients_only_returns_current_tenant(api):
    _add_client(api)
    _add_client(api, client_id="other-client", tenant_id="other-tenant", name="Other")

    result = api.get_clients()

    assert [client["client_id"] for client in result] == ["client-uuid"]


def test_add_client_raises_when_no_tenant():
    api = API.__new__(API)
    api.current_tenant_id = None

    with pytest.raises(Exception, match="No authenticated tenant"):
        api.add_client("Jane Doe")


def test_add_client_inserts_and_returns_dict(api):
    result = api.add_client("Jane Doe", email="jane@example.com")

    assert result["name"] == "Jane Doe"
    assert result["email"] == "jane@example.com"
    assert result["tenant_id"] == "tenant-uuid"
    assert result["employee_id"] == "employee-uuid"
    assert result["create_at"] is not None

    stored = api.db.session.get(Client, result["client_id"])
    assert stored is not None
    assert stored.name == "Jane Doe"


def test_edit_client_returns_none_when_no_fields_given(api):
    result = api.edit_client("client-uuid")

    assert result is None


def test_edit_client_updates_and_returns_dict(api):
    _add_client(api)

    result = api.edit_client("client-uuid", name="Jane Updated")

    assert result["name"] == "Jane Updated"


def test_edit_client_returns_none_when_not_found(api):
    result = api.edit_client("missing-uuid", name="Jane Updated")

    assert result is None


def test_edit_client_returns_none_for_other_tenant(api):
    _add_client(api, client_id="other-client", tenant_id="other-tenant")

    result = api.edit_client("other-client", name="Jane Updated")

    assert result is None


def test_delete_client_returns_true_when_removed(api):
    _add_client(api)

    result = api.delete_client("client-uuid")

    assert result is True
    assert api.db.session.get(Client, "client-uuid") is None


def test_delete_client_returns_false_when_not_found(api):
    result = api.delete_client("missing-uuid")

    assert result is False


def test_delete_client_raises_when_no_tenant():
    api = API.__new__(API)
    api.current_tenant_id = None

    with pytest.raises(Exception, match="No authenticated tenant"):
        api.delete_client("client-uuid")
