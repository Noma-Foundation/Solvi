import internal as backend
import bcrypt

class API:
    SUPPORT_LOGIN = ("support", "support")
    MOCK_ADMIN_USERNAME = "peixe"
    MOCK_ADMIN_PASSWORD = "admin"

    def __init__(self):
        self.database = backend.DatabaseConnection(
            port="5432",
            user="postgres",
            host="localhost",
            database="orderhub-test"
        )
        self.db = backend.open_connection(self.database)

    def auth_user(self, username: str, password: str):
        if self.db.connection:
            cursor = self.db.connection.cursor()
            cursor.execute("SELECT username FROM employees WHERE username = %s", (username,))
            getUsername = cursor.fetchone()
            
            cursor.execute("SELECT password FROM employees WHERE username = %s", (username,))
            getPassword = cursor.fetchone()
            
            is_valid = bcrypt.checkpw(password.encode('utf-8'), getPassword[0].encode('utf-8'))
            
            if getUsername and is_valid:
                return True
        return False
