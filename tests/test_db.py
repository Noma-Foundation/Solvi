import sys

sys.path.append(".")

from internal.database.database import DatabaseConnection
from internal.database.db import open_connection, close_connection


def test_connection_with_params(mocker):
    fake_conn = mocker.Mock() # Create a mock connection object
    fake_conn.patch("psycopg2.connect", return_value=fake_conn)
    params = { 
        "host": "localhost",
        "port": "5432",
        "database": "test_db",
        "user": "test_user",
        "password": "test_password"
    }
