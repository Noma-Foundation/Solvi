import os

import psycopg2

from dataclasses import dataclass
from internal.config import DBConfig

@dataclass
class DatabaseConnection:
    connection = None
    port: str = "5432"
    user: str = "postgres"
    host: str = "localhost"
    database: str = "orderhub-test"
    connection = None
    url: str = ""


def open_connection(connection: DatabaseConnection, config: DBConfig): 
    try:
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
        print("Error connecting to database:", e)
        return None


def close_connection(conn: DatabaseConnection):
    conn.connection.close()
    return conn

