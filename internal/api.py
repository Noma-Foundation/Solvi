import internal as backend

class API:
    SUPPORT_LOGIN = ("support", "support")
    MOCK_ADMIN_USERNAME = "peixe2b"
    MOCK_ADMIN_PASSWORD = "admin"

    def __init__(self):
        self.database = backend.DatabaseConnection(
            port="5432",
            user="postgres",
            host="localhost",
            database="orderhub-test"
        )

    def auth_user(self, username: str, password: str):
        if (username, password) == (self.MOCK_ADMIN_USERNAME, self.MOCK_ADMIN_PASSWORD):
            return True
        return False
