import webview

import internal as backend

class Application:
    window: any = None

    def __init__(self, dev_mode: bool):
        self.api = backend.API()
        self.os: backend.OperatingSystem = backend.OperatingSystem()
        self.__dev_mode = dev_mode
        self.__oauth = None

        if dev_mode:
            self.__url = "http://localhost:5173"
        else:
            self.__url = "frontend/dist/index.html"

        Application.window = webview.create_window(
            title="Orderhub",
            url=self.__url,
            js_api=self.api,
            width=1080,
            height=720,
            resizable=True
        )

    def run(self): 
        webview.start(debug=self.__dev_mode)

    def on_shutdown(self):
        backend.shutdown(self.__dev_mode)

    def set_oauth(self, oauth):
        self.__oauth = oauth
