import sys

sys.path.append(".")

from datetime import date

import pytest
import bcrypt

from sqlalchemy import create_engine, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import sessionmaker

from internal.api import API
from internal.database import DatabaseConnection
from internal.models import Base, Client, EmployeeAccount, Notification


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


def _seed_employee_and_birthday_client(api, birth_year_offset=30):
    password_hash = bcrypt.hashpw(b"secret", bcrypt.gensalt()).decode("utf-8")
    api.db.session.add(EmployeeAccount(
        employee_id="employee-uuid",
        tenant_id="tenant-uuid",
        username="bob",
        password=password_hash,
    ))

    today = date.today()
    birth_year = today.year - birth_year_offset
    birth_date = date(birth_year, today.month, today.day) if not (today.month == 2 and today.day == 29) \
        else date(birth_year, 2, 28)

    api.db.session.add(Client(
        client_id="client-uuid",
        tenant_id="tenant-uuid",
        name="Ana Julia",
        date_of_birth=birth_date,
    ))
    api.db.session.commit()


def test_auth_user_creates_birthday_notification(api):
    _seed_employee_and_birthday_client(api)

    api.auth_user("bob", "secret")

    notifications = api.db.session.execute(select(Notification)).scalars().all()
    assert len(notifications) == 1
    assert notifications[0].category == "Aniversário"
    assert "Ana Julia" in notifications[0].title


def test_auth_user_does_not_duplicate_birthday_notification_same_day(api):
    _seed_employee_and_birthday_client(api)

    api.auth_user("bob", "secret")
    api.auth_user("bob", "secret")

    notifications = api.db.session.execute(select(Notification)).scalars().all()
    assert len(notifications) == 1
