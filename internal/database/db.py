import os

import psycopg2

from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()

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
        conn = psycopg2.connect(
            host=connection.host,
            port=connection.port,
            database=connection.database,
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD")
        )
        returnConn = connection
        returnConn.connection = conn
        return returnConn
    except psycopg2.OperationalError as e:
        print("Error connecting to database:", e)
        return None


def close_connection(conn: DatabaseConnection):
    conn.connection.close()
    return conn

