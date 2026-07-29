import webview

import internal as backend

class Application:
    window: any = None

    def __init__(self, dev_mode: bool):
        self.api = backend.API()
        self.dev_mode = dev_mode
        self.os = backend.OperatingSystem()
        if dev_mode:
            self.url = "http://localhost:5173"
        else:
            self.url = "frontend/dist/index.html"

        Application.window = webview.create_window(
            title="Orderhub",
            url=self.url,
            js_api=self.api,
            width=1080,
            height=720,
            resizable=True
        )
    
    def run(self): 
        webview.start(debug=self.dev_mode)

    def on_shutdown(self):
        backend.shutdown(self.dev_mode)
