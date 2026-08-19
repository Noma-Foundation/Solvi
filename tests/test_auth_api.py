import sys

sys.path.append(".")

import pytest
import bcrypt

from internal.api import API
from internal.utils import DatabaseError


def test_auth_user_returns_fatal_error_when_db_is_none(mocker):
    api = API.__new__(API)
    api.db = None
    mocker.patch.object(API, "_window", None)

    result = api.auth_user("any", "any")

    assert result is DatabaseError.CONNECTION_ERROR


def test_auth_user_returns_fatal_error_when_underlying_conn_is_none(mocker):
    api = API.__new__(API)
    api.db = mocker.Mock()
    api.db.connection = None
    mocker.patch.object(API, "_window", None)

    result = api.auth_user("any", "any")

    assert result is DatabaseError.CONNECTION_ERROR


def test_auth_user_returns_false_when_user_not_found(mocker):
    api = API.__new__(API)
    api.db = mocker.Mock()
    api.db.connection = mocker.Mock()
    api.db.connection.cursor.return_value.fetchone.return_value = None

    result = api.auth_user("no_user", "pass")

    assert result is False
    api.db.connection.cursor.return_value.execute.assert_called_once_with(
        """
                    SELECT employee_id, terant_id, username, password
                    FROM employee
                    WHERE username = %s
                    """,
        ("no_user",),
    )


def test_auth_user_returns_true_on_successful_authentication(mocker):
    api = API.__new__(API)
    api.db = mocker.Mock()
    api.db.connection = mocker.Mock()
    api.db.connection.cursor.return_value.fetchone.return_value = (
        "employee-uuid", "tenant-uuid", "bob", "$2b$12$hashplaceholder"
    )
    mocker.patch.object(bcrypt, "checkpw", return_value=True)

    result = api.auth_user("bob", "secret")

    assert result is True
    bcrypt.checkpw.assert_called_once_with(b"secret", b"$2b$12$hashplaceholder")
    assert api.current_employee_id == "employee-uuid"
    assert api.current_tenant_id == "tenant-uuid"


def test_auth_user_returns_false_on_wrong_password(mocker):
    api = API.__new__(API)
    api.db = mocker.Mock()
    api.db.connection = mocker.Mock()
    api.db.connection.cursor.return_value.fetchone.return_value = (
        "employee-uuid", "tenant-uuid", "bob", "$2b$12$hashplaceholder"
    )
    mocker.patch.object(bcrypt, "checkpw", return_value=False)

    result = api.auth_user("bob", "wrong")

    assert result is False


def test_auth_user_returns_fatal_error_on_psycopg2_error_during_cursor(mocker):
    import psycopg2

    api = API.__new__(API)
    api.db = mocker.Mock()
    api.db.connection.cursor.side_effect = psycopg2.OperationalError("connection lost")
    mocker.patch.object(API, "_window", None)

    result = api.auth_user("bob", "secret")

    assert result is DatabaseError.CURSOR_ERROR


def test_auth_user_returns_fatal_error_on_psycopg2_error_during_query(mocker):
    import psycopg2

    api = API.__new__(API)
    api.db = mocker.Mock()
    cursor_mock = mocker.Mock()
    cursor_mock.execute.side_effect = psycopg2.Error("query failed")
    api.db.connection.cursor.return_value = cursor_mock
    mocker.patch.object(API, "_window", None)

    with pytest.raises(Exception, match="Error while executing a query."):
        api.auth_user("bob", "secret")