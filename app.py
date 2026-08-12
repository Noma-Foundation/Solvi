import webview
import internal

from subprocess import Popen
from internal import API

internal.patch_get_screens()


class Application:
    window: object | None = None

    def __init__(self, dev_mode: bool):
        self.__database = internal.DatabaseConnection()
        self.__dbconfig = internal.DBConfig()
        self.api = internal.API(self.__database, self.__dbconfig, dev_mode=dev_mode)
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
        API._window = Application.get_window()

    def run(self):
        webview.start(
            debug=self.__dev_mode,
            icon='./build/bin/favicon.ico'
        )

    def shutdown(self, server_process: Popen = None):
        internal.close_connection(self.api.db)
        internal.shutdown_server(server_process)

    @staticmethod
    def get_window() -> webview.Window | Exception:
        if Application.window is None:
            raise Exception("Application window not initialized or already closed.")
        return Application.window
