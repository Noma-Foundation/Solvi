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


def open_connection(connection: DatabaseConnection): 
    try:
        config = DBConfig()
        conn = psycopg2.connect(
            host=config.DB_HOST,
            port=config.DB_PORT,
            database=config.DB_NAME,
            user=config.DB_USER,
            password=config.DB_PASSWORD
        )
        returnConn = connection
        returnConn.connection = conn
        return returnConn
    except psycopg2.OperationalError as e:
        print("Error connecting to database:", e)
        return None


def close_connection(conn: DatabaseConnection):
    conn.connection.close()
