import subprocess
import webview

import internal as backend

from internal import API


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
            self.__url = "frontend/dist/index.html"

        Application.window = webview.create_window(
            title="Solvi",
            url=self.__url,
            js_api=self.api,
            width=1080,
            height=720,
            resizable=True
        )

    def run(self): 
        webview.start(
            debug=self.__dev_mode,
            icon='./build/windows/icon.ico'
        )

    def shutdown(self, server_process: subprocess.Popen):
        backend.shutdown_server(server_process)
        backend.close_connection(self.api.db)

    @staticmethod
    def get_window():
        if Application.window is None:
            raise Exception("Application window not initialized or already closed.")
        return Application.window
    
    @staticmethod
    def set_window(window: any):
        Application.window = window
