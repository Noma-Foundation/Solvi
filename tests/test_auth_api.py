import sys

sys.path.append(".")

import pytest
import bcrypt

from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import sessionmaker

from internal.api import API
from internal.database import DatabaseConnection
from internal.models import Base, EmployeeAccount


@pytest.fixture
def api():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine)()

    instance = API.__new__(API)
    instance.db = DatabaseConnection(engine=engine, session=session)
    instance.current_employee_id = None
    instance.current_tenant_id = None
    return instance


def test_auth_user_returns_false_when_user_not_found(api):
    result = api.auth_user("no_user", "pass")

    assert result is False


def test_auth_user_returns_true_on_successful_authentication(api):
    password_hash = bcrypt.hashpw(b"secret", bcrypt.gensalt()).decode("utf-8")
    
    api.db.session.add(EmployeeAccount(
        employee_id="employee-uuid",
        tenant_id="tenant-uuid",
        username="bob",
        password=password_hash,
    ))
    api.db.session.commit()

    result = api.auth_user("bob", "secret")

    assert result is True
    assert api.current_employee_id == "employee-uuid"
    assert api.current_tenant_id == "tenant-uuid"


def test_auth_user_returns_false_on_wrong_password(api):
    password_hash = bcrypt.hashpw(b"secret", bcrypt.gensalt()).decode("utf-8")

    api.db.session.add(EmployeeAccount(
        employee_id="employee-uuid",
        tenant_id="tenant-uuid",
        username="bob",
        password=password_hash,
    ))
    api.db.session.commit()

    result = api.auth_user("bob", "wrong")

    assert result is False


def test_auth_user_raises_on_query_error(api, mocker):
    mocker.patch.object(api.db.session, "execute", side_effect=SQLAlchemyError("query failed"))

    with pytest.raises(Exception, match="Error while executing a query."):
        api.auth_user("bob", "secret")
