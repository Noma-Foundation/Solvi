import sys

sys.path.append(".")

from internal.config import DBConfig
from internal.database.database import DatabaseConnection
from internal.database.db import open_connection, close_connection


def test_connection_with_params(mocker):
    fake_conn = mocker.Mock()
    connect_mocker = mocker.patch("internal.database.db.psycopg2.connect", return_value=fake_conn) 

    db = DatabaseConnection()
    db_config = DBConfig()

    result = open_connection(db, db_config)

    assert result.connection == fake_conn
