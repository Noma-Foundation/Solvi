import os
import logging

from dotenv import load_dotenv
from dataclasses import dataclass

from sqlalchemy import create_engine
from sqlalchemy.engine import URL, Engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError

from internal.config import DBConfig
from internal.utils import DatabaseConnectionError


load_dotenv()
logger = logging.getLogger(__name__)

@dataclass
class DatabaseConnection:
    url: str | None = os.getenv("DATABASE_URL")
    engine: Engine | None = None
    session: Session | None = None


def _build_url(config: DBConfig) -> str:
    if config.url:
        return config.url.replace("postgres://", "postgresql://", 1)

    return str(URL.create(
        "postgresql+psycopg2",
        username=config.user,
        password=config.password,
        host=config.host,
        port=int(config.port) if config.port else None,
        database=config.database,
    ))


def open_connection(connection: DatabaseConnection, config: DBConfig) -> DatabaseConnection:
    try:
        engine = create_engine(_build_url(config))
        with engine.connect():
            print("Database is connected.")
    except SQLAlchemyError:
        logger.error("Error connecting to the database.")
        raise DatabaseConnectionError("Error connecting to the database.")

    s = sessionmaker(bind=engine)

    connection.engine = engine
    connection.session = s()
    logger.info("Database successfully connected.")
    return connection


def close_connection(conn: DatabaseConnection) -> None:
    if conn is None or getattr(conn, "session", None) is None:
        logger.warning("The database connection is null or None.")
        return
    conn.session.close()
