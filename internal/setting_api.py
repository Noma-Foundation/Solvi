from internal.config import GlobalConfig


class SettingAPI:

    def __init__(self):
        self.global_vars = GlobalConfig()

    def ajust_settings(self):
        return "Hello, World!"
