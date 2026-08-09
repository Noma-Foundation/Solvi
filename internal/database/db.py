import os

import psycopg2

from dotenv import load_dotenv
from dataclasses import dataclass
from internal.config import DBConfig
from internal.utils import AuthenticationErrorCode


load_dotenv()

@dataclass
class DatabaseConnection:
    url: str = os.getenv("DATABASE_URL")
    port: str = os.getenv("DB_PORT")
    user: str = os.getenv("DB_USER")
    host: str = os.getenv("DB_HOST")
    database: str = os.getenv("DB_NAME")
    connection: object = None


def open_connection(connection: DatabaseConnection, config: DBConfig) -> DatabaseConnection | AuthenticationErrorCode:
    try:
        if config.url:
            conn = psycopg2.connect(config.url)
        else:
            conn = psycopg2.connect(
                host=config.host,
                port=config.port,
                database=config.database,
                user=config.user,
                password=config.password,
            )
        rtnConn = connection
        rtnConn.connection = conn
        return rtnConn
    except psycopg2.OperationalError as e:
        return AuthenticationErrorCode.CONNECTION_ERROR


def close_connection(conn: DatabaseConnection):
    if conn is None or getattr(conn, "connection", None) is None:
        return
    conn.connection.close()
