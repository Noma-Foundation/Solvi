import webview

import internal 

from subprocess import Popen
from internal import API


class Application:
    window: any = None

    def __init__(self, dev_mode: bool):
        print("Initialize variables")
        self.__database = internal.DatabaseConnection()
        self.__dbconfig = internal.DBConfig()
        self.api = internal.API(self.__database, self.__dbconfig)
        self.os = internal.OperatingSystem()
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
        API.window = Application.window

    def run(self): 
        webview.start(
            debug=self.__dev_mode,
            icon='./build/bin/favicon.ico'
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

