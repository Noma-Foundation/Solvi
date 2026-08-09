import psycopg2


from internal.config import DBConfig
from internal.utils import AuthenticationCodeError
from internal.database import DatabaseConnection


def open_connection(connection: DatabaseConnection, config: DBConfig) -> DatabaseConnection | AuthenticationCodeError:
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
    except psycopg2.Error as e:
        return AuthenticationCodeError.CONNECTION_ERROR


def close_connection(conn: DatabaseConnection):
    if conn is None or getattr(conn, "connection", None) is None:
        return
    conn.connection.close()
