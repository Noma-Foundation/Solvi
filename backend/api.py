
class API:
    SUPPORT_LOGIN = ("support", "support")

    def __init__(self):
        pass

    def auth_user(self, username: str, password: str):
        # For support login
        if (username, password) == self.SUPPORT_LOGIN:
            return True 
        return False
