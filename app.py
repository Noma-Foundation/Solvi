import webview

import internal as backend

from subprocess import Popen
from internal.utils.paths import resource_path


class Application:
    window: any = None

    def __init__(self, dev_mode: bool):
        self.__database = backend.DatabaseConnection()
        self.__dbconfig = backend.DBConfig()
        self.api = backend.API(self.__database, self.__dbconfig)
        self.os: backend.OperatingSystem = backend.OperatingSystem()
        self.__dev_mode = dev_mode
        self.__oauth = None

        if dev_mode:
            self.__url = "http://localhost:5173"
        else:
            self.__url = str(resource_path("frontend", "dist", "index.html"))

        Application.window = webview.create_window(
            title="Solvi",
            url=self.__url,
            js_api=self.api,
            width=1080,
            height=720,
            resizable=True
        )

    def run(self):
        icon = resource_path("build", "windows", "icon.ico")
        webview.start(
            debug=self.__dev_mode,
            icon=str(icon) if icon.exists() else None,
        )

    def shutdown(self, server_process: Popen = None):
        backend.close_connection(self.api.db)
        backend.shutdown_server(server_process)

    @staticmethod
    def get_window():
        if Application.window is None:
            raise Exception("Application window not initialized or already closed.")
        return Application.window
    
    @staticmethod
    def set_window(window: any):
        Application.window = window
