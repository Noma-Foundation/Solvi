import bcrypt

from internal.database import open_connection, DatabaseConnection

class API:
    """
    A class to handle all API requests to the database. This class has an instance
    of a database to communicate with it, as well as functions to communicate with
    the frontend.
    """

    def __init__(self):
        self.__database = DatabaseConnection(
            port="5432",
            user="postgres",
            host="localhost",
            database="orderhub-test"
        )
        self.db = open_connection(self.__database)

    """
    Represents the authorization of an user. Returns True if the user is authorized, False otherwise.
    Should be used as a promise in the Frontend of the project through the command window.pywebview.api.auth_user(name, password).
    """
    def auth_user(self, username: str, password: str):
        if self.db and getattr(self.db, "connection", None):
            cursor = self.db.connection.cursor()
            cursor.execute(
                "SELECT username, password FROM employees WHERE username = %s",
                (username,)
            )

            row = cursor.fetchone()
            if not row:
                return False

            db_username, db_password_hash = row
            return bcrypt.checkpw(password.encode(), db_password_hash.encode())
            
        return False
