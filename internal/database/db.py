import os 
import logging

import psycopg2

from dotenv import load_dotenv
from dataclasses import dataclass

from internal.config import DBConfig
from internal.utils import DatabaseError


load_dotenv()

logger = logging.getLogger(__name__)

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
                host=os.getenv("DB_HOST"),
                port=os.getenv("DB_PORT"),
                database=os.getenv("DB_NAME"),
                user=os.getenv("DB_USER"),
                password=os.getenv("DB_PASSWORD")
            )
        connection.connection = conn
        logger.info("Database successfully connected.")
        return connection
    except psycopg2.Error as e:
        logger.error("Error connecting to the database.")
        return DatabaseError.CONNECTION_ERROR


def close_connection(conn: DatabaseConnection):
    if conn is None or getattr(conn, "connection", None) is None:
        logger.warning("The database connection is null or None.")
        return
    conn.connection.close()
