import psycopg2
import os

import psycopg2

from dataclasses import dataclass

@dataclass
class DatabaseConnection:
    connection = None
    port: str = "5432"
    user: str = "postgres"
    host: str = "localhost"
    database: str = "orderhub-test"
    connection = None


def open_connection(connection: DatabaseConnection): 
    conn = connection
    connStr = "dbname=orderhub-test user=postgres password=admin host=localhost port=5432"

    conn.connection = psycopg2.connect(connStr)
    return conn


def close_connection(conn: DatabaseConnection):
    conn.connection.close()
    return conn

