import os
from dataclasses import dataclass

import psycopg2
from dotenv import load_dotenv

from internal.config import DBConfig
from internal.utils import DatabaseError


load_dotenv()


@dataclass
class DatabaseConnection:
    url: str = os.getenv("DATABASE_URL")
    connection: object = None


def open_connection(connection: DatabaseConnection, config: DBConfig) -> DatabaseConnection | DatabaseError:
    try:
        if config.url:
            conn = psycopg2.connect(config.url)
        else:
            conn = psycopg2.connect(
                host=config.host or os.getenv("DB_HOST"),
                port=config.port or os.getenv("DB_PORT"),
                database=config.database or os.getenv("DB_NAME"),
                user=config.user or os.getenv("DB_USER"),
                password=config.password or os.getenv("DB_PASSWORD"),
            )
        connection.connection = conn
        return connection
    except psycopg2.Error:
        return DatabaseError.CONNECTION_ERROR


def close_connection(conn: DatabaseConnection):
    if conn is None or getattr(conn, "connection", None) is None:
        return
    conn.connection.close()
