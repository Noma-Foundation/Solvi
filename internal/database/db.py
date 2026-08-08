import os

import psycopg2

from dotenv import load_dotenv
from dataclasses import dataclass
from internal.config import DBConfig


load_dotenv()

@dataclass
class DatabaseConnection:
    connection = None
    port: str = os.getenv("DB_PORT")
    user: str = os.getenv("DB_USER")
    host: str = os.getenv("DB_HOST")
    database: str = os.getenv("DB_NAME")
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
