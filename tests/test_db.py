import sys

sys.path.append(".")

import psycopg2

from internal.config import DBConfig
from internal.database.db import DatabaseConnection, open_connection
from internal.utils import DatabaseError


def test_open_connection_uses_url_when_provided(mocker):
    fake_conn = mocker.Mock()
    connect_mock = mocker.patch(
        "internal.database.db.psycopg2.connect", return_value=fake_conn
    )

    db = DatabaseConnection()
    db_url = "postgres://user:pwd@localhost:5432/test_db"
    db_config = DBConfig(url=db_url)

    result = open_connection(db, db_config)

    assert result.connection is fake_conn
    connect_mock.assert_called_once_with(db_url)


def test_open_connection_returns_connection_error_on_psycopg2_failure(mocker):
    mocker.patch(
        "internal.database.db.psycopg2.connect",
        side_effect=psycopg2.OperationalError("connection refused"),
    )

    db = DatabaseConnection()
    db_config = DBConfig(
        host="localhost",
        port="5432",
        database="test_db",
        user="test_user",
        password="test_password",
    )

    result = open_connection(db, db_config)
        
    assert result is DatabaseError.CONNECTION_ERROR