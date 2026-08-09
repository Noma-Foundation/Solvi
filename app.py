import webview

import internal as backend

from subprocess import Popen
from internal import API


class Application:
    window: any = None

    def __init__(self, dev_mode: bool):
        self.__database = backend.DatabaseConnection()
        self.__dbconfig = backend.DBConfig()
        self.api = backend.API(self.__database, self.__dbconfig)
        self.os: backend.OperatingSystem = backend.OperatingSystem()
        self.__dev_mode = dev_mode

        if dev_mode:
            self.__url = "http://localhost:5173"
        else:
            self.__url = "frontend/dist/index.html"

        Application.window = webview.create_window(
            title="Solvi",
            url=self.__url,
            js_api=self.api,
            width=1080,
            height=720,
            resizable=True
        )
        self.__verify_database_connection(self.api.db)

    def run(self): 
        webview.start(
            debug=self.__dev_mode,
            icon='./build/windows/icon.ico'
        )

    def shutdown(self, server_process: Popen = None):
        backend.close_connection(self.api.db)
        backend.shutdown_server(server_process)

    @staticmethod
    def get_window() -> webview.Window | Exception:
        if Application.window is None:
            raise Exception("Application window not initialized or already closed.")
        return Application.window
    
    @staticmethod
    def set_window(window: any) -> None:
        Application.window = window

    def __verify_database_connection(self, db: backend.DatabaseConnection) -> None:
        if isinstance(db, backend.AuthenticationErrorCode) and db == backend.AuthenticationErrorCode.CONNECTION_ERROR:
            Application.get_window().create_confirmation_dialog(
                title="Error",
                message="Database connection error. Please try again later."
            )
