import sys

sys.path.append(".")

import pytest

from sqlalchemy.exc import SQLAlchemyError

from internal.config import DBConfig
from internal.database.db import DatabaseConnection, open_connection
from internal.utils import DatabaseConnectionError


def test_open_connection_uses_url_when_provided(mocker):
    fake_engine = mocker.MagicMock()
    create_engine_mock = mocker.patch(
        "internal.database.db.create_engine", return_value=fake_engine
    )

    db = DatabaseConnection()
    db_url = "postgresql://user:pwd@localhost:5432/test_db"
    db_config = DBConfig(url=db_url)

    result = open_connection(db, db_config)

    print(result)
    print(db_url)
    print(db_config)
    
    assert result.engine is fake_engine
    assert result.session is not None
    create_engine_mock.assert_called_once_with(db_url)


def test_open_connection_normalizes_postgres_scheme(mocker):
    create_engine_mock = mocker.patch(
        "internal.database.db.create_engine", return_value=mocker.MagicMock()
    )

    db = DatabaseConnection()
    db_config = DBConfig(url="postgres://user:pwd@localhost:5432/test_db")

    open_connection(db, db_config)

    create_engine_mock.assert_called_once_with("postgresql://user:pwd@localhost:5432/test_db")


def test_open_connection_raises_on_connection_failure(mocker):
    mocker.patch(
        "internal.database.db.create_engine",
        side_effect=SQLAlchemyError("connection refused"),
    )

    db = DatabaseConnection()
    db_config = DBConfig(
        host="localhost",
        port="5432",
        database="test_db",
        user="test_user",
        password="test_password",
    )

    with pytest.raises(DatabaseConnectionError):
        open_connection(db, db_config)
