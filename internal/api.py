import bcrypt

import internal as backend

class API:
    """
    A class to handle all API requests to the database. This class has an instance
    of a database to communicate with it, as well as functions to communicate with
    the frontend.
    """

    def __init__(self):
        self.__database = backend.DatabaseConnection(
            port="5432",
            user="postgres",
            host="localhost",
            database="orderhub-test"
        )
        self.db = backend.open_connection(self.__database)

    """
    Represents the authorization of an user. Returns True if the user is authorized, False otherwise.
    Should be used as a promise in the Frontend of the project through the command window.pywebview.api.auth_user(name, password).
    """
    def auth_user(self, username: str, password: str):
        if self.__db.connection:
            cursor = self.__db.connection.cursor()
            cursor.execute("SELECT username FROM employees WHERE username = %s", (username,))
            getUsername = cursor.fetchone()
            
            cursor.execute("SELECT password FROM employees WHERE username = %s", (username,))
            getPassword = cursor.fetchone()
            
            is_valid = bcrypt.checkpw(password.encode('utf-8'), getPassword[0].encode('utf-8'))
            
            if getUsername and is_valid:
                return True
        return False
